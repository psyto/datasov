import { useQuery, useMutation, useQueryClient } from "react-query";
import { DigitalIdentity, IdentityProof } from "../types";
import apiService from "../services/api";
import toast from "react-hot-toast";

export const useIdentity = (identityId: string) => {
    return useQuery(
        ["identity", identityId],
        () => apiService.getIdentity(identityId),
        {
            enabled: !!identityId,
            staleTime: 60000, // 1 minute
        }
    );
};

export const useIdentityProof = (identityId: string) => {
    const queryClient = useQueryClient();

    const generateProofMutation = useMutation(
        () => apiService.generateIdentityProof(identityId),
        {
            onSuccess: (data) => {
                toast.success("Identity proof generated successfully");
            },
            onError: (error: any) => {
                toast.error(
                    error.message || "Failed to generate identity proof"
                );
            },
        }
    );

    const validateProofMutation = useMutation(
        (proof: IdentityProof) => apiService.validateIdentityProof(proof),
        {
            onSuccess: (data) => {
                if (data) {
                    toast.success("Identity proof is valid");
                } else {
                    toast.error("Identity proof is invalid");
                }
            },
            onError: (error: any) => {
                toast.error(
                    error.message || "Failed to validate identity proof"
                );
            },
        }
    );

    return {
        generateProof: generateProofMutation.mutate,
        validateProof: validateProofMutation.mutate,
        isGenerating: generateProofMutation.isLoading,
        isValidating: validateProofMutation.isLoading,
    };
};

export const useAccessControl = () => {
    const queryClient = useQueryClient();

    const generateAccessProofMutation = useMutation(
        ({
            identityId,
            consumer,
            dataType,
        }: {
            identityId: string;
            consumer: string;
            dataType: string;
        }) => apiService.generateAccessProof(identityId, consumer, dataType),
        {
            onSuccess: (data) => {
                toast.success("Access proof generated successfully");
            },
            onError: (error: any) => {
                toast.error(error.message || "Failed to generate access proof");
            },
        }
    );

    const validateAccessProofMutation = useMutation(
        (proof: any) => apiService.validateAccessProof(proof),
        {
            onSuccess: (data) => {
                if (data) {
                    toast.success("Access proof is valid");
                } else {
                    toast.error("Access proof is invalid");
                }
            },
            onError: (error: any) => {
                toast.error(error.message || "Failed to validate access proof");
            },
        }
    );

    return {
        generateAccessProof: generateAccessProofMutation.mutate,
        validateAccessProof: validateAccessProofMutation.mutate,
        isGenerating: generateAccessProofMutation.isLoading,
        isValidating: validateAccessProofMutation.isLoading,
    };
};
