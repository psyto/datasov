import { useQuery } from "react-query";
import { HealthCheckResponse } from "../types";
import apiService from "../services/api";

export const useSystemHealth = () => {
    return useQuery("systemHealth", () => apiService.getHealth(), {
        refetchInterval: 30000, // 30 seconds
        staleTime: 10000, // 10 seconds
    });
};

export const useBridgeStatus = () => {
    return useQuery("bridgeStatus", () => apiService.getBridgeStatus(), {
        refetchInterval: 15000, // 15 seconds
        staleTime: 5000, // 5 seconds
    });
};

export const useSyncStatus = () => {
    return useQuery("syncStatus", () => apiService.getSyncStatus(), {
        refetchInterval: 10000, // 10 seconds
        staleTime: 5000, // 5 seconds
    });
};

export const useStateSnapshot = () => {
    return useQuery("stateSnapshot", () => apiService.getStateSnapshot(), {
        staleTime: 60000, // 1 minute
    });
};
