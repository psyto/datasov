/**
 * Cross-Chain Bridge Service
 *
 * Handles cross-chain communication between Corda and Solana,
 * including identity proof validation, state synchronization, and event bridging.
 */
import { IdentityProof, AccessProof, SyncResult, ProofValidationResult, StateSnapshot, BridgeConfig } from "@/types";
import { CordaService } from "./CordaService";
import { SolanaService } from "./SolanaService";
import { EventEmitter } from "events";
import { Keypair, PublicKey } from "@solana/web3.js";
export declare class CrossChainBridge extends EventEmitter {
    private cordaService;
    private solanaService;
    private config;
    private logger;
    private isRunning;
    private syncInterval?;
    private eventHandlers;
    constructor(cordaService: CordaService, solanaService: SolanaService, config: BridgeConfig);
    /**
     * Start the cross-chain bridge
     */
    start(): Promise<void>;
    /**
     * Stop the cross-chain bridge
     */
    stop(): Promise<void>;
    /**
     * Validate identity proof from Corda for Solana usage
     */
    validateIdentityProof(proof: IdentityProof): Promise<ProofValidationResult>;
    /**
     * Generate identity proof for cross-chain usage
     */
    generateIdentityProof(identityId: string): Promise<IdentityProof>;
    /**
     * Generate access proof for data access
     */
    generateAccessProof(identityId: string, consumer: string, dataType: string): Promise<AccessProof>;
    /**
     * Create data listing on Solana with Corda identity validation
     */
    createDataListing(owner: Keypair, listingId: number, price: number, dataType: string, description: string, cordaIdentityId: string, accessProof?: AccessProof): Promise<string>;
    /**
     * Purchase data with access validation
     */
    purchaseData(buyer: Keypair, listingId: number, tokenMint: PublicKey, cordaIdentityId: string): Promise<any>;
    /**
     * Synchronize state between Corda and Solana
     */
    synchronizeState(): Promise<SyncResult>;
    /**
     * Get current state snapshot
     */
    getStateSnapshot(): Promise<StateSnapshot>;
    /**
     * Setup event handlers for cross-chain communication
     */
    private setupEventHandlers;
    /**
     * Handle Corda events
     */
    private handleCordaEvent;
    /**
     * Handle Solana events
     */
    private handleSolanaEvent;
    /**
     * Start event monitoring
     */
    private startEventMonitoring;
    /**
     * Start periodic synchronization
     */
    private startPeriodicSync;
    /**
     * Validate proof format
     */
    private validateProofFormat;
    /**
     * Enable data trading for identity
     */
    private enableDataTrading;
    /**
     * Disable data trading for identity
     */
    private disableDataTrading;
    /**
     * Update access permissions
     */
    private updateAccessPermissions;
    /**
     * Revoke access permissions
     */
    private revokeAccessPermissions;
    /**
     * Update access log
     */
    private updateAccessLog;
    /**
     * Record fee distribution
     */
    private recordFeeDistribution;
    /**
     * Get bridge status
     */
    getStatus(): Record<string, any>;
}
//# sourceMappingURL=CrossChainBridge.d.ts.map