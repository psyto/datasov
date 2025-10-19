/**
 * DataSov Integration Layer Types
 *
 * This module defines all the types and interfaces used across the integration layer
 * for cross-chain communication between Corda and Solana.
 */

import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

// ============================================================================
// Core Identity Types
// ============================================================================

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

// ============================================================================
// Cross-Chain Communication Types
// ============================================================================

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

export interface CrossChainEvent {
    eventId: string;
    timestamp: number;
    chain: "Corda" | "Solana";
    eventType: string;
    identityId: string;
    details: Record<string, any>;
    crossChainReference?: string;
    signature: string;
}

export interface BridgeConfig {
    corda: CordaConfig;
    solana: SolanaConfig;
    bridge: BridgeSettings;
    security: SecurityConfig;
    monitoring: MonitoringConfig;
}

export interface CordaConfig {
    rpcHost: string;
    rpcPort: number;
    username: string;
    password: string;
    networkMapHost: string;
    networkMapPort: number;
    timeout: number;
    retryAttempts: number;
}

export interface SolanaConfig {
    rpcUrl: string;
    programId: string;
    privateKey: string;
    commitment: "processed" | "confirmed" | "finalized";
    timeout: number;
    retryAttempts: number;
}

export interface BridgeSettings {
    enabled: boolean;
    syncInterval: number;
    proofValidationTimeout: number;
    maxRetryAttempts: number;
    batchSize: number;
    enableEventStreaming: boolean;
}

export interface SecurityConfig {
    jwtSecret: string;
    encryptionKey: string;
    apiRateLimit: number;
    enableCors: boolean;
    allowedOrigins: string[];
    enableHelmet: boolean;
}

export interface MonitoringConfig {
    enableMetrics: boolean;
    metricsPort: number;
    healthCheckInterval: number;
    logLevel: string;
    enableTracing: boolean;
}

// ============================================================================
// Data Trading Types
// ============================================================================

export interface DataListing {
    id: number;
    owner: string;
    price: BN;
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
    amount: BN;
    timestamp: number;
    transactionHash: string;
    cordaIdentityId: string;
    accessGranted: boolean;
}

export interface FeeDistribution {
    identityId: string;
    owner: string;
    amount: BN;
    marketplaceFee: BN;
    ownerAmount: BN;
    timestamp: number;
    transactionHash: string;
}

// ============================================================================
// API Response Types
// ============================================================================

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

// ============================================================================
// Event Types
// ============================================================================

export interface CordaEvent {
    type:
        | "IDENTITY_REGISTERED"
        | "IDENTITY_VERIFIED"
        | "IDENTITY_UPDATED"
        | "IDENTITY_REVOKED"
        | "ACCESS_GRANTED"
        | "ACCESS_REVOKED";
    identityId: string;
    timestamp: number;
    transactionHash: string;
    details: Record<string, any>;
}

export interface SolanaEvent {
    type:
        | "DATA_LISTING_CREATED"
        | "DATA_PURCHASED"
        | "DATA_LISTING_UPDATED"
        | "DATA_LISTING_CANCELLED"
        | "FEE_DISTRIBUTED";
    identityId: string;
    timestamp: number;
    transactionHash: string;
    details: Record<string, any>;
}

export interface BridgeEvent {
    type:
        | "SYNC_STARTED"
        | "SYNC_COMPLETED"
        | "SYNC_FAILED"
        | "PROOF_VALIDATED"
        | "PROOF_INVALID"
        | "STATE_UPDATED";
    timestamp: number;
    details: Record<string, any>;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface SyncResult {
    success: boolean;
    syncedCount: number;
    failedCount: number;
    errors: string[];
    duration: number;
}

export interface ProofValidationResult {
    isValid: boolean;
    identityId: string;
    verificationLevel: VerificationLevel;
    validUntil?: number;
    errors: string[];
}

export interface StateSnapshot {
    timestamp: number;
    cordaIdentities: DigitalIdentity[];
    solanaListings: DataListing[];
    activeBridges: number;
    lastSyncTime: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class IntegrationError extends Error {
    constructor(
        message: string,
        public code: string,
        public chain: "Corda" | "Solana" | "Bridge",
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = "IntegrationError";
    }
}

export class ValidationError extends IntegrationError {
    constructor(message: string, details?: Record<string, any>) {
        super(message, "VALIDATION_ERROR", "Bridge", details);
        this.name = "ValidationError";
    }
}

export class CordaError extends IntegrationError {
    constructor(message: string, details?: Record<string, any>) {
        super(message, "CORDA_ERROR", "Corda", details);
        this.name = "CordaError";
    }
}

export class SolanaError extends IntegrationError {
    constructor(message: string, details?: Record<string, any>) {
        super(message, "SOLANA_ERROR", "Solana", details);
        this.name = "SolanaError";
    }
}

export class BridgeError extends IntegrationError {
    constructor(message: string, details?: Record<string, any>) {
        super(message, "BRIDGE_ERROR", "Bridge", details);
        this.name = "BridgeError";
    }
}
