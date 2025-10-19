/**
 * Solana Service
 *
 * Handles communication with the Solana network for data marketplace
 * operations and NFT management.
 */

import {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Program, AnchorProvider, Wallet, BN } from "@coral-xyz/anchor";
import {
    DataListing,
    DataPurchase,
    FeeDistribution,
    SolanaEvent,
    SolanaConfig,
    SolanaError,
    ValidationResult,
} from "@/types";
import { Logger } from "@/utils/Logger";
import { EventEmitter } from "events";
import { DataSovClient } from "./DataSovClient";

export class SolanaService extends EventEmitter {
    private connection: Connection;
    private program: Program;
    private client: DataSovClient;
    private config: SolanaConfig;
    private logger: Logger;
    private isConnected: boolean = false;
    private wallet: Wallet;

    constructor(config: SolanaConfig) {
        super();
        this.config = config;
        this.logger = new Logger("SolanaService");

        // Initialize connection
        this.connection = new Connection(config.rpcUrl, "confirmed");

        // Initialize wallet
        const keypair = Keypair.fromSecretKey(
            Buffer.from(config.privateKey, "base64")
        );
        this.wallet = new Wallet(keypair);

        // Initialize program (would need actual IDL)
        const provider = new AnchorProvider(this.connection, this.wallet, {});
        this.program = new Program(
            {} as any,
            new PublicKey(config.programId),
            provider
        );

        // Initialize DataSov client
        this.client = new DataSovClient({
            rpcUrl: config.rpcUrl,
            programId: new PublicKey(config.programId),
        });
    }

    /**
     * Initialize connection to Solana network
     */
    async connect(): Promise<void> {
        try {
            // Test connection
            const version = await this.connection.getVersion();
            this.isConnected = true;
            this.logger.info("Connected to Solana network", { version });

            // Start listening for events
            this.startEventListening();
        } catch (error) {
            this.logger.error("Failed to connect to Solana network", error);
            throw new SolanaError("Connection failed", {
                error: error.message,
            });
        }
    }

    /**
     * Disconnect from Solana network
     */
    async disconnect(): Promise<void> {
        try {
            this.isConnected = false;
            this.logger.info("Disconnected from Solana network");
        } catch (error) {
            this.logger.error("Error disconnecting from Solana", error);
        }
    }

    /**
     * Create a data listing on Solana
     */
    async createDataListing(
        owner: Keypair,
        listingId: number,
        price: number,
        dataType: string,
        description: string,
        cordaIdentityId: string,
        accessProof?: any
    ): Promise<string> {
        try {
            this.validateConnection();

            const tx = await this.client.createDataListing(
                owner,
                listingId,
                price,
                dataType as any,
                description
            );

            // Emit event
            this.emit("solanaEvent", {
                type: "DATA_LISTING_CREATED",
                identityId: cordaIdentityId,
                timestamp: Date.now(),
                transactionHash: tx,
                details: {
                    listingId,
                    price,
                    dataType,
                    description,
                    cordaIdentityId,
                    accessProof,
                },
            } as SolanaEvent);

            this.logger.info(
                `Created data listing ${listingId} for identity ${cordaIdentityId}`
            );
            return tx;
        } catch (error) {
            this.logger.error(
                `Failed to create data listing ${listingId}`,
                error
            );
            throw new SolanaError("Failed to create data listing", {
                listingId,
                cordaIdentityId,
                error: error.message,
            });
        }
    }

    /**
     * Purchase data from a listing
     */
    async purchaseData(
        buyer: Keypair,
        listingId: number,
        tokenMint: PublicKey,
        cordaIdentityId: string
    ): Promise<DataPurchase> {
        try {
            this.validateConnection();

            const tx = await this.client.purchaseData(
                buyer,
                listingId,
                tokenMint
            );

            // Get listing details for purchase record
            const listing = await this.client.getListing(listingId);
            if (!listing) {
                throw new SolanaError("Listing not found", { listingId });
            }

            const purchase: DataPurchase = {
                listingId,
                buyer: buyer.publicKey.toString(),
                amount: listing.price,
                timestamp: Date.now(),
                transactionHash: tx,
                cordaIdentityId,
                accessGranted: true,
            };

            // Emit event
            this.emit("solanaEvent", {
                type: "DATA_PURCHASED",
                identityId: cordaIdentityId,
                timestamp: Date.now(),
                transactionHash: tx,
                details: purchase,
            } as SolanaEvent);

            this.logger.info(
                `Data purchased for listing ${listingId} by identity ${cordaIdentityId}`
            );
            return purchase;
        } catch (error) {
            this.logger.error(
                `Failed to purchase data for listing ${listingId}`,
                error
            );
            throw new SolanaError("Failed to purchase data", {
                listingId,
                cordaIdentityId,
                error: error.message,
            });
        }
    }

    /**
     * Update data listing
     */
    async updateDataListing(
        owner: Keypair,
        listingId: number,
        newPrice: number,
        cordaIdentityId: string
    ): Promise<string> {
        try {
            this.validateConnection();

            const tx = await this.client.updateListingPrice(
                owner,
                listingId,
                newPrice
            );

            // Emit event
            this.emit("solanaEvent", {
                type: "DATA_LISTING_UPDATED",
                identityId: cordaIdentityId,
                timestamp: Date.now(),
                transactionHash: tx,
                details: {
                    listingId,
                    newPrice,
                    cordaIdentityId,
                },
            } as SolanaEvent);

            this.logger.info(
                `Updated data listing ${listingId} for identity ${cordaIdentityId}`
            );
            return tx;
        } catch (error) {
            this.logger.error(
                `Failed to update data listing ${listingId}`,
                error
            );
            throw new SolanaError("Failed to update data listing", {
                listingId,
                cordaIdentityId,
                error: error.message,
            });
        }
    }

    /**
     * Cancel data listing
     */
    async cancelDataListing(
        owner: Keypair,
        listingId: number,
        cordaIdentityId: string
    ): Promise<string> {
        try {
            this.validateConnection();

            const tx = await this.client.cancelListing(owner, listingId);

            // Emit event
            this.emit("solanaEvent", {
                type: "DATA_LISTING_CANCELLED",
                identityId: cordaIdentityId,
                timestamp: Date.now(),
                transactionHash: tx,
                details: {
                    listingId,
                    cordaIdentityId,
                },
            } as SolanaEvent);

            this.logger.info(
                `Cancelled data listing ${listingId} for identity ${cordaIdentityId}`
            );
            return tx;
        } catch (error) {
            this.logger.error(
                `Failed to cancel data listing ${listingId}`,
                error
            );
            throw new SolanaError("Failed to cancel data listing", {
                listingId,
                cordaIdentityId,
                error: error.message,
            });
        }
    }

    /**
     * Get data listing by ID
     */
    async getDataListing(listingId: number): Promise<DataListing | null> {
        try {
            this.validateConnection();

            const listing = await this.client.getListing(listingId);
            if (!listing) {
                return null;
            }

            return {
                id: listing.id,
                owner: listing.owner.toString(),
                price: listing.price,
                dataType: listing.dataType,
                description: listing.description,
                isActive: listing.isActive,
                createdAt: listing.createdAt,
                soldAt: listing.soldAt,
                cancelledAt: listing.cancelledAt,
                buyer: listing.buyer?.toString(),
                cordaIdentityId: "", // Would be populated from metadata
                accessProof: undefined,
            };
        } catch (error) {
            this.logger.error(`Failed to get data listing ${listingId}`, error);
            throw new SolanaError("Failed to get data listing", {
                listingId,
                error: error.message,
            });
        }
    }

    /**
     * Get all active data listings
     */
    async getActiveDataListings(): Promise<DataListing[]> {
        try {
            this.validateConnection();

            const listings = await this.client.getActiveListings();
            return listings.map((listing) => ({
                id: listing.id,
                owner: listing.owner.toString(),
                price: listing.price,
                dataType: listing.dataType,
                description: listing.description,
                isActive: listing.isActive,
                createdAt: listing.createdAt,
                soldAt: listing.soldAt,
                cancelledAt: listing.cancelledAt,
                buyer: listing.buyer?.toString(),
                cordaIdentityId: "", // Would be populated from metadata
                accessProof: undefined,
            }));
        } catch (error) {
            this.logger.error("Failed to get active data listings", error);
            throw new SolanaError("Failed to get active data listings", {
                error: error.message,
            });
        }
    }

    /**
     * Get data listings by owner
     */
    async getDataListingsByOwner(owner: string): Promise<DataListing[]> {
        try {
            this.validateConnection();

            const listings = await this.client.getListingsByOwner(
                new PublicKey(owner)
            );
            return listings.map((listing) => ({
                id: listing.id,
                owner: listing.owner.toString(),
                price: listing.price,
                dataType: listing.dataType,
                description: listing.description,
                isActive: listing.isActive,
                createdAt: listing.createdAt,
                soldAt: listing.soldAt,
                cancelledAt: listing.cancelledAt,
                buyer: listing.buyer?.toString(),
                cordaIdentityId: "", // Would be populated from metadata
                accessProof: undefined,
            }));
        } catch (error) {
            this.logger.error(
                `Failed to get data listings for owner ${owner}`,
                error
            );
            throw new SolanaError("Failed to get data listings by owner", {
                owner,
                error: error.message,
            });
        }
    }

    /**
     * Validate identity proof from Corda
     */
    async validateIdentityProof(proof: any): Promise<ValidationResult> {
        try {
            this.validateConnection();

            // In a real implementation, this would validate the proof against Corda
            // For now, we'll do basic validation
            if (
                !proof.identityId ||
                !proof.signature ||
                !proof.verificationLevel
            ) {
                return {
                    isValid: false,
                    errors: ["Invalid proof format"],
                    warnings: [],
                };
            }

            // Check if proof is still valid
            if (proof.validUntil && proof.validUntil < Date.now()) {
                return {
                    isValid: false,
                    errors: ["Proof has expired"],
                    warnings: [],
                };
            }

            this.logger.info(
                `Identity proof validated for ${proof.identityId}`
            );
            return {
                isValid: true,
                errors: [],
                warnings: [],
            };
        } catch (error) {
            this.logger.error(`Failed to validate identity proof`, error);
            return {
                isValid: false,
                errors: [error.message],
                warnings: [],
            };
        }
    }

    /**
     * Start listening for Solana events
     */
    private startEventListening(): void {
        // In a real implementation, this would listen to Solana program events
        // For now, we'll simulate event listening
        setInterval(() => {
            // Simulate periodic health check
            this.emit("solanaEvent", {
                type: "HEALTH_CHECK",
                identityId: "system",
                timestamp: Date.now(),
                transactionHash: "health_check",
                details: { status: "healthy" },
            } as SolanaEvent);
        }, 30000); // Every 30 seconds
    }

    /**
     * Validate connection status
     */
    private validateConnection(): void {
        if (!this.isConnected) {
            throw new SolanaError("Not connected to Solana network");
        }
    }

    /**
     * Get connection status
     */
    isHealthy(): boolean {
        return this.isConnected;
    }

    /**
     * Get service metrics
     */
    async getMetrics(): Promise<Record<string, any>> {
        try {
            const balance = await this.connection.getBalance(
                this.wallet.publicKey
            );
            const slot = await this.connection.getSlot();

            return {
                isConnected: this.isConnected,
                balance: balance / LAMPORTS_PER_SOL,
                currentSlot: slot,
                rpcUrl: this.config.rpcUrl,
            };
        } catch (error) {
            this.logger.error("Failed to get Solana metrics", error);
            return {
                isConnected: this.isConnected,
                error: error.message,
            };
        }
    }
}
