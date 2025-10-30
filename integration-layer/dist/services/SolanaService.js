"use strict";
/**
 * Solana Service
 *
 * Handles communication with the Solana network for data marketplace
 * operations and NFT management.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolanaService = void 0;
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@coral-xyz/anchor");
const types_1 = require("@/types");
const Logger_1 = require("@/utils/Logger");
const events_1 = require("events");
const DataSovClient_1 = require("./DataSovClient");
class SolanaService extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.isConnected = false;
        this.config = config;
        this.logger = new Logger_1.Logger("SolanaService");
        // Initialize connection
        this.connection = new web3_js_1.Connection(config.rpcUrl, "confirmed");
        // Initialize wallet
        const keypair = web3_js_1.Keypair.fromSecretKey(Buffer.from(config.privateKey, "base64"));
        this.wallet = new anchor_1.Wallet(keypair);
        // Initialize program (would need actual IDL)
        const provider = new anchor_1.AnchorProvider(this.connection, this.wallet, {});
        this.program = new anchor_1.Program({}, new web3_js_1.PublicKey(config.programId), provider);
        // Initialize DataSov client
        this.client = new DataSovClient_1.DataSovClient({
            rpcUrl: config.rpcUrl,
            programId: new web3_js_1.PublicKey(config.programId),
        });
    }
    /**
     * Initialize connection to Solana network
     */
    async connect() {
        try {
            // Test connection
            const version = await this.connection.getVersion();
            this.isConnected = true;
            this.logger.info("Connected to Solana network", { version });
            // Start listening for events
            this.startEventListening();
        }
        catch (error) {
            this.logger.error("Failed to connect to Solana network", error);
            throw new types_1.SolanaError("Connection failed", {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * Disconnect from Solana network
     */
    async disconnect() {
        try {
            this.isConnected = false;
            this.logger.info("Disconnected from Solana network");
        }
        catch (error) {
            this.logger.error("Error disconnecting from Solana", error);
        }
    }
    /**
     * Create a data listing on Solana
     */
    async createDataListing(owner, listingId, price, dataType, description, cordaIdentityId, accessProof) {
        try {
            this.validateConnection();
            const tx = await this.client.createDataListing(owner, listingId, price, dataType, description);
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
            });
            this.logger.info(`Created data listing ${listingId} for identity ${cordaIdentityId}`);
            return tx;
        }
        catch (error) {
            this.logger.error(`Failed to create data listing ${listingId}`, error);
            throw new types_1.SolanaError("Failed to create data listing", {
                listingId,
                cordaIdentityId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * Purchase data from a listing
     */
    async purchaseData(buyer, listingId, tokenMint, cordaIdentityId) {
        try {
            this.validateConnection();
            const tx = await this.client.purchaseData(buyer, listingId, tokenMint);
            // Get listing details for purchase record
            const listing = await this.client.getListing(listingId);
            if (!listing) {
                throw new types_1.SolanaError("Listing not found", { listingId });
            }
            const purchase = {
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
            });
            this.logger.info(`Data purchased for listing ${listingId} by identity ${cordaIdentityId}`);
            return purchase;
        }
        catch (error) {
            this.logger.error(`Failed to purchase data for listing ${listingId}`, error);
            throw new types_1.SolanaError("Failed to purchase data", {
                listingId,
                cordaIdentityId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * Update data listing
     */
    async updateDataListing(owner, listingId, newPrice, cordaIdentityId) {
        try {
            this.validateConnection();
            const tx = await this.client.updateListingPrice(owner, listingId, newPrice);
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
            });
            this.logger.info(`Updated data listing ${listingId} for identity ${cordaIdentityId}`);
            return tx;
        }
        catch (error) {
            this.logger.error(`Failed to update data listing ${listingId}`, error);
            throw new types_1.SolanaError("Failed to update data listing", {
                listingId,
                cordaIdentityId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * Cancel data listing
     */
    async cancelDataListing(owner, listingId, cordaIdentityId) {
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
            });
            this.logger.info(`Cancelled data listing ${listingId} for identity ${cordaIdentityId}`);
            return tx;
        }
        catch (error) {
            this.logger.error(`Failed to cancel data listing ${listingId}`, error);
            throw new types_1.SolanaError("Failed to cancel data listing", {
                listingId,
                cordaIdentityId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * Get data listing by ID
     */
    async getDataListing(listingId) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get data listing ${listingId}`, error);
            throw new types_1.SolanaError("Failed to get data listing", {
                listingId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * Get all active data listings
     */
    async getActiveDataListings() {
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
        }
        catch (error) {
            this.logger.error("Failed to get active data listings", error);
            throw new types_1.SolanaError("Failed to get active data listings", {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * Get data listings by owner
     */
    async getDataListingsByOwner(owner) {
        try {
            this.validateConnection();
            const listings = await this.client.getListingsByOwner(new web3_js_1.PublicKey(owner));
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
        }
        catch (error) {
            this.logger.error(`Failed to get data listings for owner ${owner}`, error);
            throw new types_1.SolanaError("Failed to get data listings by owner", {
                owner,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * Validate identity proof from Corda
     */
    async validateIdentityProof(proof) {
        try {
            this.validateConnection();
            // In a real implementation, this would validate the proof against Corda
            // For now, we'll do basic validation
            if (!proof.identityId ||
                !proof.signature ||
                !proof.verificationLevel) {
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
            this.logger.info(`Identity proof validated for ${proof.identityId}`);
            return {
                isValid: true,
                errors: [],
                warnings: [],
            };
        }
        catch (error) {
            this.logger.error(`Failed to validate identity proof`, error);
            return {
                isValid: false,
                errors: [error instanceof Error ? error.message : String(error)],
                warnings: [],
            };
        }
    }
    /**
     * Start listening for Solana events
     */
    startEventListening() {
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
            });
        }, 30000); // Every 30 seconds
    }
    /**
     * Validate connection status
     */
    validateConnection() {
        if (!this.isConnected) {
            throw new types_1.SolanaError("Not connected to Solana network");
        }
    }
    /**
     * Get connection status
     */
    isHealthy() {
        return this.isConnected;
    }
    /**
     * Get service metrics
     */
    async getMetrics() {
        try {
            const balance = await this.connection.getBalance(this.wallet.publicKey);
            const slot = await this.connection.getSlot();
            return {
                isConnected: this.isConnected,
                balance: balance / web3_js_1.LAMPORTS_PER_SOL,
                currentSlot: slot,
                rpcUrl: this.config.rpcUrl,
            };
        }
        catch (error) {
            this.logger.error("Failed to get Solana metrics", error);
            return {
                isConnected: this.isConnected,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}
exports.SolanaService = SolanaService;
//# sourceMappingURL=SolanaService.js.map