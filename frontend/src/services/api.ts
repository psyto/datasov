import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
    ApiResponse,
    DigitalIdentity,
    DataListing,
    DataPurchase,
    CreateDataListingRequest,
    PurchaseDataRequest,
    UpdateDataListingRequest,
    CancelDataListingRequest,
    HealthCheckResponse,
    IdentityProof,
    AccessProof,
    PaginatedResponse,
} from "@/types";

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
            timeout: 30000,
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Request interceptor
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem("auth_token");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.api.interceptors.response.use(
            (response: AxiosResponse) => {
                return response;
            },
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem("auth_token");
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            }
        );
    }

    // Health & Status
    async getHealth(): Promise<HealthCheckResponse> {
        const response = await this.api.get<ApiResponse<HealthCheckResponse>>(
            "/health"
        );
        return response.data.data!;
    }

    async getBridgeStatus(): Promise<any> {
        const response = await this.api.get<ApiResponse>("/bridge/status");
        return response.data.data;
    }

    // Identity Management
    async getIdentity(identityId: string): Promise<DigitalIdentity> {
        const response = await this.api.get<ApiResponse<DigitalIdentity>>(
            `/identity/${identityId}`
        );
        return response.data.data!;
    }

    async generateIdentityProof(identityId: string): Promise<IdentityProof> {
        const response = await this.api.get<ApiResponse<IdentityProof>>(
            `/identity/${identityId}/proof`
        );
        return response.data.data!;
    }

    async validateIdentityProof(proof: IdentityProof): Promise<boolean> {
        const response = await this.api.post<ApiResponse<boolean>>(
            `/identity/${proof.identityId}/validate`,
            proof
        );
        return response.data.data!;
    }

    // Access Control
    async generateAccessProof(
        identityId: string,
        consumer: string,
        dataType: string
    ): Promise<AccessProof> {
        const response = await this.api.post<ApiResponse<AccessProof>>(
            "/access/generate",
            {
                identityId,
                consumer,
                dataType,
            }
        );
        return response.data.data!;
    }

    async validateAccessProof(proof: AccessProof): Promise<boolean> {
        const response = await this.api.post<ApiResponse<boolean>>(
            "/access/validate",
            proof
        );
        return response.data.data!;
    }

    // Data Listings
    async createDataListing(
        request: CreateDataListingRequest
    ): Promise<{ transactionHash: string }> {
        const response = await this.api.post<
            ApiResponse<{ transactionHash: string }>
        >("/data/listing", request);
        return response.data.data!;
    }

    async getDataListing(listingId: number): Promise<DataListing> {
        const response = await this.api.get<ApiResponse<DataListing>>(
            `/data/listing/${listingId}`
        );
        return response.data.data!;
    }

    async getDataListings(params?: {
        owner?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<DataListing>> {
        const response = await this.api.get<PaginatedResponse<DataListing>>(
            "/data/listings",
            {
                params,
            }
        );
        return response.data;
    }

    async updateDataListing(
        listingId: number,
        request: UpdateDataListingRequest
    ): Promise<{ transactionHash: string }> {
        const response = await this.api.put<
            ApiResponse<{ transactionHash: string }>
        >(`/data/listing/${listingId}`, request);
        return response.data.data!;
    }

    async cancelDataListing(
        listingId: number,
        request: CancelDataListingRequest
    ): Promise<{ transactionHash: string }> {
        const response = await this.api.delete<
            ApiResponse<{ transactionHash: string }>
        >(`/data/listing/${listingId}`, {
            data: request,
        });
        return response.data.data!;
    }

    // Data Purchases
    async purchaseData(request: PurchaseDataRequest): Promise<DataPurchase> {
        const response = await this.api.post<ApiResponse<DataPurchase>>(
            "/data/purchase",
            request
        );
        return response.data.data!;
    }

    // Synchronization
    async startSync(): Promise<any> {
        const response = await this.api.post<ApiResponse>("/sync/start");
        return response.data.data;
    }

    async stopSync(): Promise<any> {
        const response = await this.api.post<ApiResponse>("/sync/stop");
        return response.data.data;
    }

    async getSyncStatus(): Promise<any> {
        const response = await this.api.get<ApiResponse>("/sync/status");
        return response.data.data;
    }

    async getStateSnapshot(): Promise<any> {
        const response = await this.api.get<ApiResponse>("/state/snapshot");
        return response.data.data;
    }

    // Utility methods
    setAuthToken(token: string): void {
        localStorage.setItem("auth_token", token);
        this.api.defaults.headers.Authorization = `Bearer ${token}`;
    }

    removeAuthToken(): void {
        localStorage.removeItem("auth_token");
        delete this.api.defaults.headers.Authorization;
    }

    getAuthToken(): string | null {
        return localStorage.getItem("auth_token");
    }
}

export const apiService = new ApiService();
export default apiService;
