/**
 * DataSov Client for Integration Layer
 *
 * Simplified client for internal use within the integration layer
 */
import { PublicKey, Keypair } from "@solana/web3.js";
export interface DataSovConfig {
    rpcUrl: string;
    programId: PublicKey;
}
export declare class DataSovClient {
    private connection;
    private programId;
    constructor(config: DataSovConfig);
    /**
     * Create a data listing
     */
    createDataListing(owner: Keypair, listingId: number, price: number, dataType: string, description: string): Promise<string>;
    /**
     * Purchase data from a listing
     */
    purchaseData(buyer: Keypair, listingId: number, tokenMint: PublicKey): Promise<string>;
    /**
     * Get listing by ID
     */
    getListing(listingId: number): Promise<any>;
    /**
     * Get all active listings
     */
    getActiveListings(): Promise<any[]>;
    /**
     * Get listings by owner
     */
    getListingsByOwner(owner: PublicKey): Promise<any[]>;
    /**
     * Update listing price
     */
    updateListingPrice(owner: Keypair, listingId: number, newPrice: number): Promise<string>;
    /**
     * Cancel listing
     */
    cancelListing(owner: Keypair, listingId: number): Promise<string>;
}
//# sourceMappingURL=DataSovClient.d.ts.map