/**
 * Solana Service
 *
 * Handles communication with the Solana network for data marketplace
 * operations and NFT management.
 */
import { PublicKey, Keypair } from "@solana/web3.js";
import { DataListing, DataPurchase, SolanaConfig, ValidationResult } from "@/types";
import { EventEmitter } from "events";
export declare class SolanaService extends EventEmitter {
    private connection;
    private program;
    private client;
    private config;
    private logger;
    private isConnected;
    private wallet;
    constructor(config: SolanaConfig);
    /**
     * Initialize connection to Solana network
     */
    connect(): Promise<void>;
    /**
     * Disconnect from Solana network
     */
    disconnect(): Promise<void>;
    /**
     * Create a data listing on Solana
     */
    createDataListing(owner: Keypair, listingId: number, price: number, dataType: string, description: string, cordaIdentityId: string, accessProof?: any): Promise<string>;
    /**
     * Purchase data from a listing
     */
    purchaseData(buyer: Keypair, listingId: number, tokenMint: PublicKey, cordaIdentityId: string): Promise<DataPurchase>;
    /**
     * Update data listing
     */
    updateDataListing(owner: Keypair, listingId: number, newPrice: number, cordaIdentityId: string): Promise<string>;
    /**
     * Cancel data listing
     */
    cancelDataListing(owner: Keypair, listingId: number, cordaIdentityId: string): Promise<string>;
    /**
     * Get data listing by ID
     */
    getDataListing(listingId: number): Promise<DataListing | null>;
    /**
     * Get all active data listings
     */
    getActiveDataListings(): Promise<DataListing[]>;
    /**
     * Get data listings by owner
     */
    getDataListingsByOwner(owner: string): Promise<DataListing[]>;
    /**
     * Validate identity proof from Corda
     */
    validateIdentityProof(proof: any): Promise<ValidationResult>;
    /**
     * Start listening for Solana events
     */
    private startEventListening;
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
    getMetrics(): Promise<Record<string, any>>;
}
//# sourceMappingURL=SolanaService.d.ts.map