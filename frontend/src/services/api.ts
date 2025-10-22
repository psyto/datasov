import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
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
    User,
    IdentityType,
    IdentityStatus,
    VerificationLevel,
    DataType,
} from "../types";

interface RetryConfig {
    retries: number;
    retryDelay: number;
    retryCondition: (error: AxiosError) => boolean;
}

class ApiService {
    private api: AxiosInstance;
    private mockMode: boolean;
    private retryConfig: RetryConfig;

    constructor() {
        this.mockMode = process.env.REACT_APP_MOCK_MODE === "true";

        this.retryConfig = {
            retries: 3,
            retryDelay: 1000,
            retryCondition: (error: AxiosError) => {
                return (
                    error.response?.status === 500 ||
                    error.response?.status === 502 ||
                    error.response?.status === 503 ||
                    error.code === "NETWORK_ERROR"
                );
            },
        };

        this.api = axios.create({
            baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
            timeout: 30000,
            headers: {
                "Content-Type": "application/json",
            },
            validateStatus: (status) => {
                // Accept all status codes to handle errors manually
                return status >= 200 && status < 500;
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem("auth_token");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Add request ID for tracking
                config.headers["X-Request-ID"] = this.generateRequestId();

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor with retry logic
        this.api.interceptors.response.use(
            (response: AxiosResponse) => {
                return response;
            },
            async (error: AxiosError) => {
                // Handle authentication errors
                if (error.response?.status === 401) {
                    localStorage.removeItem("auth_token");
                    window.location.href = "/login";
                    return Promise.reject(error);
                }

                // Retry logic for network errors
                if (this.shouldRetry(error)) {
                    const config = error.config as any;
                    if (!config._retryCount) {
                        config._retryCount = 0;
                    }

                    if (config._retryCount < this.retryConfig.retries) {
                        config._retryCount++;
                        await this.delay(
                            this.retryConfig.retryDelay * config._retryCount
                        );
                        return this.api(config);
                    }
                }

                return Promise.reject(this.enhanceError(error));
            }
        );
    }

    private shouldRetry(error: AxiosError): boolean {
        return this.retryConfig.retryCondition(error);
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private enhanceError(error: AxiosError): Error {
        const enhancedError = new Error();
        enhancedError.name = "ApiError";
        enhancedError.message =
            (error.response?.data as any)?.message ||
            error.message ||
            "Unknown error occurred";

        // Add additional error information
        (enhancedError as any).status = error.response?.status;
        (enhancedError as any).code = error.code;
        (enhancedError as any).config = error.config;

        return enhancedError;
    }

    // Authentication
    async login(
        email: string,
        password: string
    ): Promise<{ user: User; token: string }> {
        if (this.mockMode) {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const mockUser: User = {
                id: "user_123",
                email: email,
                name: "Demo User",
                avatar: "https://via.placeholder.com/40",
                identities: this.getMockIdentities(),
                dataListings: this.getMockDataListings(),
                purchases: this.getMockPurchases(),
                createdAt: Date.now() - 86400000 * 30,
                lastLoginAt: Date.now(),
            };

            const token = `mock_token_${Date.now()}`;
            this.setAuthToken(token);

            return { user: mockUser, token };
        }

        const response = await this.api.post<
            ApiResponse<{ user: User; token: string }>
        >("/auth/login", { email, password });

        const { user, token } = response.data.data!;
        this.setAuthToken(token);
        return { user, token };
    }

    async register(userData: {
        name: string;
        email: string;
        password: string;
    }): Promise<{ user: User; token: string }> {
        if (this.mockMode) {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const mockUser: User = {
                id: `user_${Date.now()}`,
                email: userData.email,
                name: userData.name,
                avatar: "https://via.placeholder.com/40",
                identities: [],
                dataListings: [],
                purchases: [],
                createdAt: Date.now(),
            };

            const token = `mock_token_${Date.now()}`;
            this.setAuthToken(token);

            return { user: mockUser, token };
        }

        const response = await this.api.post<
            ApiResponse<{ user: User; token: string }>
        >("/auth/register", userData);

        const { user, token } = response.data.data!;
        this.setAuthToken(token);
        return { user, token };
    }

    async logout(): Promise<void> {
        if (!this.mockMode) {
            try {
                await this.api.post("/auth/logout");
            } catch (error) {
                // Ignore logout errors
            }
        }

        this.removeAuthToken();
    }

    async getCurrentUser(): Promise<User> {
        if (this.mockMode) {
            await new Promise((resolve) => setTimeout(resolve, 500));

            return {
                id: "user_123",
                email: "demo@datasov.com",
                name: "Demo User",
                avatar: "https://via.placeholder.com/40",
                identities: this.getMockIdentities(),
                dataListings: this.getMockDataListings(),
                purchases: this.getMockPurchases(),
                createdAt: Date.now() - 86400000 * 30,
                lastLoginAt: Date.now(),
            };
        }

        const response = await this.api.get<ApiResponse<User>>("/auth/me");
        return response.data.data!;
    }

    // Health & Status
    async getHealth(): Promise<HealthCheckResponse> {
        if (this.mockMode) {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            return {
                status: "healthy",
                timestamp: Date.now(),
                services: {
                    corda: { status: "up", lastCheck: Date.now() },
                    solana: { status: "up", lastCheck: Date.now() },
                    bridge: { status: "up", lastCheck: Date.now() },
                    database: { status: "up", lastCheck: Date.now() },
                },
                metrics: {
                    uptime: 3600,
                    memoryUsage: 75.5,
                    cpuUsage: 45.2,
                    activeConnections: 25,
                },
            };
        }

        const response =
            await this.api.get<ApiResponse<HealthCheckResponse>>("/health");
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
        if (this.mockMode) {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 800));

            const mockListings = this.getMockDataListings();

            // Filter by owner if specified
            const filteredListings = params?.owner
                ? mockListings.filter(
                      (listing) => listing.owner === params.owner
                  )
                : mockListings;

            // Pagination
            const page = params?.page || 1;
            const limit = params?.limit || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedListings = filteredListings.slice(
                startIndex,
                endIndex
            );

            return {
                success: true,
                data: paginatedListings,
                timestamp: Date.now(),
                requestId: "mock-request-" + Date.now(),
                pagination: {
                    page,
                    limit,
                    total: filteredListings.length,
                    totalPages: Math.ceil(filteredListings.length / limit),
                },
            };
        }

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

    // Mock data generators
    private getMockIdentities(): DigitalIdentity[] {
        return [
            {
                identityId: "ID_001",
                owner: "demo@datasov.com",
                identityProvider: "NTT DOCOMO",
                identityType: IdentityType.NTT_DOCOMO_USER_ID,
                status: IdentityStatus.VERIFIED,
                verificationLevel: VerificationLevel.HIGH,
                personalInfo: {
                    firstName: "Taro",
                    lastName: "Yamada",
                    emailAddress: "taro.yamada@example.com",
                    encryptedData: {},
                },
                accessPermissions: [],
                createdAt: Date.now() - 86400000,
                verifiedAt: Date.now() - 3600000,
                metadata: {},
            },
            {
                identityId: "ID_002",
                owner: "demo@datasov.com",
                identityProvider: "Government",
                identityType: IdentityType.GOVERNMENT_DIGITAL_ID,
                status: IdentityStatus.PENDING,
                verificationLevel: VerificationLevel.BASIC,
                personalInfo: {
                    firstName: "Hanako",
                    lastName: "Sato",
                    emailAddress: "hanako.sato@example.com",
                    encryptedData: {},
                },
                accessPermissions: [],
                createdAt: Date.now() - 172800000,
                metadata: {},
            },
        ];
    }

    private getMockDataListings(): DataListing[] {
        return [
            {
                id: 1,
                owner: "demo@datasov.com",
                price: "0.1",
                dataType: DataType.LOCATION_HISTORY,
                description:
                    "Anonymized location data from verified NTT DOCOMO user",
                isActive: true,
                createdAt: Date.now() - 86400000,
                cordaIdentityId: "ID_001",
                accessProof: undefined,
            },
            {
                id: 2,
                owner: "demo@datasov.com",
                price: "0.25",
                dataType: DataType.APP_USAGE,
                description: "Mobile app usage patterns and statistics",
                isActive: true,
                createdAt: Date.now() - 172800000,
                cordaIdentityId: "ID_001",
                accessProof: undefined,
            },
            {
                id: 3,
                owner: "demo@datasov.com",
                price: "0.5",
                dataType: DataType.PURCHASE_HISTORY,
                description: "Shopping and transaction history",
                isActive: true,
                createdAt: Date.now() - 259200000,
                cordaIdentityId: "ID_001",
                accessProof: undefined,
            },
            {
                id: 4,
                owner: "demo@datasov.com",
                price: "0.8",
                dataType: DataType.HEALTH_DATA,
                description: "Fitness and health metrics",
                isActive: true,
                createdAt: Date.now() - 345600000,
                cordaIdentityId: "ID_002",
                accessProof: undefined,
            },
            {
                id: 5,
                owner: "demo@datasov.com",
                price: "0.3",
                dataType: DataType.SOCIAL_MEDIA_ACTIVITY,
                description: "Social media engagement data",
                isActive: false,
                createdAt: Date.now() - 432000000,
                soldAt: Date.now() - 3600000,
                buyer: "research@company.com",
                cordaIdentityId: "ID_001",
                accessProof: undefined,
            },
        ];
    }

    private getMockPurchases(): DataPurchase[] {
        return [
            {
                listingId: 5,
                buyer: "demo@datasov.com",
                amount: "0.3",
                timestamp: Date.now() - 3600000,
                transactionHash: "tx_123456789",
                cordaIdentityId: "ID_001",
                accessGranted: true,
            },
        ];
    }
}

export const apiService = new ApiService();
export default apiService;
