// DataSov Frontend Types
// Based on the integration layer API types

export interface DigitalIdentity {
    identityId: string;
    owner: string;
    identityProvider: string;
    identityType: IdentityType;
    status: IdentityStatus;
    verificationLevel: VerificationLevel;
    personalInfo: PersonalInfo;
    accessPermissions: AccessPermission[];
    createdAt: number;
    verifiedAt?: number;
    updatedAt?: number;
    revokedAt?: number;
    revocationReason?: string;
    verificationMethod?: VerificationMethod;
    metadata: Record<string, string>;
}

export enum IdentityType {
    NTT_DOCOMO_USER_ID = "NTT_DOCOMO_USER_ID",
    GOVERNMENT_DIGITAL_ID = "GOVERNMENT_DIGITAL_ID",
    PASSPORT = "PASSPORT",
    DRIVERS_LICENSE = "DRIVERS_LICENSE",
    NATIONAL_ID = "NATIONAL_ID",
    CUSTOM = "CUSTOM",
}

export enum IdentityStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    REVOKED = "REVOKED",
    SUSPENDED = "SUSPENDED",
}

export enum VerificationLevel {
    NONE = "NONE",
    BASIC = "BASIC",
    ENHANCED = "ENHANCED",
    HIGH = "HIGH",
    CREDENTIAL = "CREDENTIAL",
}

export interface PersonalInfo {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: string;
    phoneNumber?: string;
    emailAddress?: string;
    encryptedData: Record<string, string>;
}

export interface AccessPermission {
    consumer: string;
    permissionType: PermissionType;
    dataTypes: DataType[];
    grantedAt: number;
    expiresAt?: number;
    isActive: boolean;
    grantedBy: string;
}

export enum PermissionType {
    READ_ONLY = "READ_ONLY",
    READ_WRITE = "READ_WRITE",
    SHARE = "SHARE",
    ANALYZE = "ANALYZE",
    EXPORT = "EXPORT",
}

export enum DataType {
    LOCATION_HISTORY = "LOCATION_HISTORY",
    APP_USAGE = "APP_USAGE",
    PURCHASE_HISTORY = "PURCHASE_HISTORY",
    HEALTH_DATA = "HEALTH_DATA",
    SOCIAL_MEDIA_ACTIVITY = "SOCIAL_MEDIA_ACTIVITY",
    SEARCH_HISTORY = "SEARCH_HISTORY",
    FINANCIAL_DATA = "FINANCIAL_DATA",
    COMMUNICATION_DATA = "COMMUNICATION_DATA",
    CUSTOM = "CUSTOM",
}

export interface VerificationMethod {
    method: VerificationMethodType;
    provider: string;
    reference: string;
    performedAt: number;
    validUntil?: number;
}

export enum VerificationMethodType {
    DOCUMENT_VERIFICATION = "DOCUMENT_VERIFICATION",
    BIOMETRIC_VERIFICATION = "BIOMETRIC_VERIFICATION",
    KNOWLEDGE_BASED_VERIFICATION = "KNOWLEDGE_BASED_VERIFICATION",
    CREDENTIAL_VERIFICATION = "CREDENTIAL_VERIFICATION",
    THIRD_PARTY_VERIFICATION = "THIRD_PARTY_VERIFICATION",
    SELF_ATTESTATION = "SELF_ATTESTATION",
}

export interface DataListing {
    id: number;
    owner: string;
    price: string;
    dataType: DataType;
    description: string;
    isActive: boolean;
    createdAt: number;
    soldAt?: number;
    cancelledAt?: number;
    buyer?: string;
    cordaIdentityId: string;
    accessProof?: AccessProof;
}

export interface DataPurchase {
    listingId: number;
    buyer: string;
    amount: string;
    timestamp: number;
    transactionHash: string;
    cordaIdentityId: string;
    accessGranted: boolean;
}

export interface AccessProof {
    identityId: string;
    consumer: string;
    permissionType: PermissionType;
    dataTypes: DataType[];
    grantedAt: number;
    expiresAt?: number;
    isActive: boolean;
    grantedBy: string;
    signature: string;
    cordaTransactionHash: string;
}

export interface IdentityProof {
    identityId: string;
    owner: string;
    verificationLevel: VerificationLevel;
    verificationTimestamp: number;
    cordaTransactionHash: string;
    signature: string;
    validUntil?: number;
    metadata: Record<string, any>;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: number;
    requestId: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface HealthCheckResponse {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: number;
    services: {
        corda: ServiceStatus;
        solana: ServiceStatus;
        bridge: ServiceStatus;
        database: ServiceStatus;
    };
    metrics: {
        uptime: number;
        memoryUsage: number;
        cpuUsage: number;
        activeConnections: number;
    };
}

export interface ServiceStatus {
    status: "up" | "down" | "degraded";
    responseTime?: number;
    lastCheck: number;
    error?: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    identities: DigitalIdentity[];
    dataListings: DataListing[];
    purchases: DataPurchase[];
    createdAt: number;
    lastLoginAt?: number;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loading: boolean;
}

export interface CreateDataListingRequest {
    owner: string;
    listingId: number;
    price: string;
    dataType: DataType;
    description: string;
    cordaIdentityId: string;
    accessProof?: AccessProof;
}

export interface PurchaseDataRequest {
    buyer: string;
    listingId: number;
    tokenMint: string;
    cordaIdentityId: string;
}

export interface UpdateDataListingRequest {
    owner: string;
    listingId: number;
    newPrice: string;
    cordaIdentityId: string;
}

export interface CancelDataListingRequest {
    owner: string;
    listingId: number;
    cordaIdentityId: string;
}

// UI Component Types
export interface TableColumn<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: any, item: T) => React.ReactNode;
}

export interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    loading?: boolean;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}

export interface FormFieldProps {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    value?: any;
    onChange?: (value: any) => void;
    options?: { value: string; label: string }[];
}

export interface ChartData {
    name: string;
    value: number;
    color?: string;
}

export interface StatsCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeType?: "increase" | "decrease";
    icon?: React.ReactNode;
    description?: string;
}

// Navigation Types
export interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    current?: boolean;
    badge?: string | number;
}

export interface BreadcrumbItem {
    name: string;
    href?: string;
    current?: boolean;
}

// Error Types
export interface AppError {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: number;
}

export interface ValidationError {
    field: string;
    message: string;
}

// Theme Types
export interface ThemeConfig {
    mode: "light" | "dark";
    primaryColor: string;
    secondaryColor: string;
}

// Notification Types
export interface Notification {
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
}
