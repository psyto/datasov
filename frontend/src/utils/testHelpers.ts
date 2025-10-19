// Test utilities and helpers for DataSov Frontend

export const mockUser = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    avatar: undefined,
    identities: [],
    dataListings: [],
    purchases: [],
    createdAt: Date.now() - 86400000, // 1 day ago
    lastLoginAt: Date.now() - 3600000, // 1 hour ago
};

export const mockIdentity = {
    identityId: "ID_001",
    owner: "user-123",
    identityProvider: "NTT DOCOMO",
    identityType: "NTT_DOCOMO_USER_ID" as const,
    status: "VERIFIED" as const,
    verificationLevel: "HIGH" as const,
    personalInfo: {
        firstName: "Taro",
        lastName: "Yamada",
        emailAddress: "taro.yamada@example.com",
        encryptedData: {},
    },
    accessPermissions: [],
    createdAt: Date.now() - 86400000,
    verifiedAt: Date.now() - 3600000,
};

export const mockDataListing = {
    id: 1,
    owner: "user-123",
    price: "0.5",
    dataType: "LOCATION_HISTORY" as const,
    description: "Anonymized location data from verified NTT DOCOMO user",
    isActive: true,
    createdAt: Date.now() - 3600000,
    cordaIdentityId: "ID_001",
};

export const mockApiResponse = <T>(data: T) => ({
    success: true,
    data,
    timestamp: Date.now(),
    requestId: "test-request-id",
});

export const mockErrorResponse = (message: string) => ({
    success: false,
    error: message,
    timestamp: Date.now(),
    requestId: "test-request-id",
});

// Mock API delay for testing loading states
export const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

// Test data generators
export const generateMockListings = (count: number) => {
    return Array.from({ length: count }, (_, index) => ({
        ...mockDataListing,
        id: index + 1,
        price: (Math.random() * 2 + 0.1).toFixed(3),
        description: `Sample data listing ${index + 1}`,
        createdAt: Date.now() - Math.random() * 86400000 * 7, // Random time in last week
    }));
};

export const generateMockIdentities = (count: number) => {
    return Array.from({ length: count }, (_, index) => ({
        ...mockIdentity,
        identityId: `ID_${String(index + 1).padStart(3, "0")}`,
        personalInfo: {
            ...mockIdentity.personalInfo,
            firstName: `User${index + 1}`,
            lastName: "Test",
        },
    }));
};
