"use strict";
/**
 * DataSov Integration Layer
 *
 * Main entry point for the cross-chain integration service
 * that bridges Corda and Solana networks.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSovIntegrationLayer = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const Logger_1 = require("@/utils/Logger");
const CordaService_1 = require("@/services/CordaService");
const SolanaService_1 = require("@/services/SolanaService");
const CrossChainBridge_1 = require("@/services/CrossChainBridge");
const index_1 = require("@/api/index");
// Load environment variables
dotenv_1.default.config();
class DataSovIntegrationLayer {
    constructor() {
        this.isRunning = false;
        this.logger = new Logger_1.Logger("DataSovIntegrationLayer");
        this.config = this.loadConfiguration();
        // Initialize services
        this.cordaService = new CordaService_1.CordaService(this.config.corda);
        this.solanaService = new SolanaService_1.SolanaService(this.config.solana);
        this.bridge = new CrossChainBridge_1.CrossChainBridge(this.cordaService, this.solanaService, this.config);
        this.apiGateway = new index_1.ApiGateway(this.bridge, this.cordaService, this.solanaService, this.config);
    }
    /**
     * Load configuration from environment variables
     */
    loadConfiguration() {
        return {
            corda: {
                rpcHost: process.env.CORDA_RPC_HOST || "localhost",
                rpcPort: parseInt(process.env.CORDA_RPC_PORT || "10006"),
                username: process.env.CORDA_RPC_USERNAME || "user1",
                password: process.env.CORDA_RPC_PASSWORD || "test",
                networkMapHost: process.env.CORDA_NETWORK_MAP_HOST || "localhost",
                networkMapPort: parseInt(process.env.CORDA_NETWORK_MAP_PORT || "10002"),
                timeout: parseInt(process.env.CORDA_TIMEOUT || "30000"),
                retryAttempts: parseInt(process.env.CORDA_RETRY_ATTEMPTS || "3"),
            },
            solana: {
                rpcUrl: process.env.SOLANA_RPC_URL ||
                    "https://api.devnet.solana.com",
                programId: process.env.SOLANA_PROGRAM_ID ||
                    "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
                privateKey: process.env.SOLANA_PRIVATE_KEY || "",
                commitment: "confirmed",
                timeout: parseInt(process.env.SOLANA_TIMEOUT || "30000"),
                retryAttempts: parseInt(process.env.SOLANA_RETRY_ATTEMPTS || "3"),
            },
            bridge: {
                enabled: process.env.BRIDGE_ENABLED === "true",
                syncInterval: parseInt(process.env.SYNC_INTERVAL || "5000"),
                proofValidationTimeout: parseInt(process.env.PROOF_VALIDATION_TIMEOUT || "30000"),
                maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || "3"),
                batchSize: parseInt(process.env.BATCH_SIZE || "100"),
                enableEventStreaming: process.env.ENABLE_EVENT_STREAMING === "true",
            },
            security: {
                jwtSecret: process.env.JWT_SECRET || "your-secret-key",
                encryptionKey: process.env.ENCRYPTION_KEY || "your-encryption-key",
                apiRateLimit: parseInt(process.env.API_RATE_LIMIT || "100"),
                enableCors: process.env.ENABLE_CORS === "true",
                allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
                    "*",
                ],
                enableHelmet: process.env.ENABLE_HELMET === "true",
            },
            monitoring: {
                enableMetrics: process.env.ENABLE_METRICS === "true",
                metricsPort: parseInt(process.env.METRICS_PORT || "9090"),
                healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || "30000"),
                logLevel: process.env.LOG_LEVEL || "info",
                enableTracing: process.env.ENABLE_TRACING === "true",
            },
        };
    }
    /**
     * Start the integration layer
     */
    async start() {
        try {
            this.logger.info("Starting DataSov Integration Layer...");
            // Start the cross-chain bridge
            await this.bridge.start();
            // Start the API gateway
            const port = parseInt(process.env.PORT || "3000");
            this.apiGateway.start(port);
            this.isRunning = true;
            this.logger.info(`DataSov Integration Layer started successfully on port ${port}`);
            // Setup graceful shutdown
            this.setupGracefulShutdown();
        }
        catch (error) {
            this.logger.error("Failed to start DataSov Integration Layer", error);
            throw error;
        }
    }
    /**
     * Stop the integration layer
     */
    async stop() {
        try {
            this.logger.info("Stopping DataSov Integration Layer...");
            this.isRunning = false;
            // Stop the bridge
            await this.bridge.stop();
            this.logger.info("DataSov Integration Layer stopped successfully");
        }
        catch (error) {
            this.logger.error("Error stopping DataSov Integration Layer", error);
        }
    }
    /**
     * Setup graceful shutdown handlers
     */
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            this.logger.info(`Received ${signal}, shutting down gracefully...`);
            await this.stop();
            process.exit(0);
        };
        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGUSR2", () => shutdown("SIGUSR2")); // For nodemon
        // Handle uncaught exceptions
        process.on("uncaughtException", (error) => {
            this.logger.error("Uncaught Exception", error);
            this.stop().then(() => process.exit(1));
        });
        process.on("unhandledRejection", (reason, promise) => {
            this.logger.error("Unhandled Rejection", { reason, promise });
            this.stop().then(() => process.exit(1));
        });
    }
    /**
     * Get service status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            bridge: this.bridge.getStatus(),
            corda: this.cordaService.isHealthy(),
            solana: this.solanaService.isHealthy(),
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            version: process.env.npm_package_version || "1.0.0",
        };
    }
}
exports.DataSovIntegrationLayer = DataSovIntegrationLayer;
// Create and start the integration layer
const integrationLayer = new DataSovIntegrationLayer();
// Start the service
integrationLayer.start().catch((error) => {
    console.error("Failed to start DataSov Integration Layer:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map