import { useQuery, useMutation, useQueryClient } from "react-query";
import { DigitalIdentity, IdentityType, PersonalInfo } from "../types";
import apiService from "../services/api";
import toast from "react-hot-toast";

export const useIdentities = (owner?: string) => {
    const queryClient = useQueryClient();

    // Get all identities
    const {
        data: identities,
        isLoading,
        error,
        refetch,
    } = useQuery(["identities", owner], () => apiService.getIdentities(owner), {
        staleTime: 30000, // 30 seconds
        cacheTime: 300000, // 5 minutes
    });

    // Create identity mutation
    const createIdentityMutation = useMutation(
        (identityData: {
            owner: string;
            identityProvider: string;
            identityType: IdentityType;
            personalInfo: PersonalInfo;
        }) => apiService.createIdentity(identityData),
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries(["identities"]);
                toast.success("Identity created successfully");
            },
            onError: (error: any) => {
                toast.error(error.message || "Failed to create identity");
            },
        }
    );

    return {
        identities: identities || [],
        isLoading,
        error,
        refetch,
        createIdentity: createIdentityMutation.mutate,
        isCreating: createIdentityMutation.isLoading,
    };
};

export const useIdentity = (identityId: string) => {
    return useQuery(
        ["identity", identityId],
        () => apiService.getIdentity(identityId),
        {
            enabled: !!identityId,
            staleTime: 30000,
        }
    );
};
