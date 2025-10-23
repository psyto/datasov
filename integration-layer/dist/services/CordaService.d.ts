/**
 * Corda Service
 *
 * Handles communication with the Corda network for identity management
 * and access control operations.
 */
import { DigitalIdentity, IdentityProof, AccessProof, CordaConfig, ValidationResult } from "@/types";
import { EventEmitter } from "events";
export declare class CordaService extends EventEmitter {
    private rpcClient;
    private config;
    private logger;
    private isConnected;
    constructor(config: CordaConfig);
    /**
     * Initialize connection to Corda network
     */
    connect(): Promise<void>;
    /**
     * Disconnect from Corda network
     */
    disconnect(): Promise<void>;
    /**
     * Get digital identity by ID
     */
    getIdentity(identityId: string): Promise<DigitalIdentity | null>;
    /**
     * Get all identities for a party
     */
    getIdentitiesByOwner(owner: string): Promise<DigitalIdentity[]>;
    /**
     * Get all identities where party is the identity provider
     */
    getIdentitiesAsProvider(provider: string): Promise<DigitalIdentity[]>;
    /**
     * Generate identity proof for cross-chain validation
     */
    generateIdentityProof(identityId: string): Promise<IdentityProof>;
    /**
     * Generate access proof for data access permissions
     */
    generateAccessProof(identityId: string, consumer: string, dataType: string): Promise<AccessProof>;
    /**
     * Validate identity proof from external source
     */
    validateIdentityProof(proof: IdentityProof): Promise<ValidationResult>;
    /**
     * Start listening for Corda events
     */
    private startEventListening;
    /**
     * Map Corda identity to DigitalIdentity format
     */
    private mapCordaIdentityToDigitalIdentity;
    /**
     * Calculate proof validity period based on verification level
     */
    private calculateValidUntil;
    /**
     * Validate connection status
     */
    private validateConnection;
    /**
     * Get connection status
     */
    isHealthy(): boolean;
    /**
     * Get service metrics
     */
    getMetrics(): Record<string, any>;
}
//# sourceMappingURL=CordaService.d.ts.map