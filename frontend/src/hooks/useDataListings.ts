import { useQuery, useMutation, useQueryClient } from "react-query";
import {
    DataListing,
    CreateDataListingRequest,
    UpdateDataListingRequest,
    CancelDataListingRequest,
} from "@/types";
import apiService from "@/services/api";
import toast from "react-hot-toast";

export const useDataListings = (params?: {
    owner?: string;
    page?: number;
    limit?: number;
}) => {
    const queryClient = useQueryClient();

    // Get all data listings
    const {
        data: listings,
        isLoading,
        error,
        refetch,
    } = useQuery(
        ["dataListings", params],
        () => apiService.getDataListings(params),
        {
            staleTime: 30000, // 30 seconds
            cacheTime: 300000, // 5 minutes
        }
    );

    // Create data listing mutation
    const createListingMutation = useMutation(
        (request: CreateDataListingRequest) =>
            apiService.createDataListing(request),
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries(["dataListings"]);
                toast.success("Data listing created successfully");
            },
            onError: (error: any) => {
                toast.error(error.message || "Failed to create data listing");
            },
        }
    );

    // Update data listing mutation
    const updateListingMutation = useMutation(
        ({
            listingId,
            request,
        }: {
            listingId: number;
            request: UpdateDataListingRequest;
        }) => apiService.updateDataListing(listingId, request),
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries(["dataListings"]);
                toast.success("Data listing updated successfully");
            },
            onError: (error: any) => {
                toast.error(error.message || "Failed to update data listing");
            },
        }
    );

    // Cancel data listing mutation
    const cancelListingMutation = useMutation(
        ({
            listingId,
            request,
        }: {
            listingId: number;
            request: CancelDataListingRequest;
        }) => apiService.cancelDataListing(listingId, request),
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries(["dataListings"]);
                toast.success("Data listing cancelled successfully");
            },
            onError: (error: any) => {
                toast.error(error.message || "Failed to cancel data listing");
            },
        }
    );

    return {
        listings: listings?.data || [],
        pagination: listings?.pagination,
        isLoading,
        error,
        refetch,
        createListing: createListingMutation.mutate,
        updateListing: updateListingMutation.mutate,
        cancelListing: cancelListingMutation.mutate,
        isCreating: createListingMutation.isLoading,
        isUpdating: updateListingMutation.isLoading,
        isCancelling: cancelListingMutation.isLoading,
    };
};

export const useDataListing = (listingId: number) => {
    return useQuery(
        ["dataListing", listingId],
        () => apiService.getDataListing(listingId),
        {
            enabled: !!listingId,
            staleTime: 30000,
        }
    );
};

export const useDataPurchase = () => {
    const queryClient = useQueryClient();

    const purchaseMutation = useMutation(
        (request: any) => apiService.purchaseData(request),
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries(["dataListings"]);
                queryClient.invalidateQueries(["dataPurchases"]);
                toast.success("Data purchased successfully");
            },
            onError: (error: any) => {
                toast.error(error.message || "Failed to purchase data");
            },
        }
    );

    return {
        purchaseData: purchaseMutation.mutate,
        isPurchasing: purchaseMutation.isLoading,
    };
};
