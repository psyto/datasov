/**
 * DataSov Integration Layer API Gateway
 *
 * Provides REST API endpoints for cross-chain operations
 * between Corda and Solana networks.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import {
    ApiResponse,
    PaginatedResponse,
    HealthCheckResponse,
    BridgeConfig,
} from "@/types";
import { Logger } from "@/utils/Logger";
import { CrossChainBridge } from "@/services/CrossChainBridge";
import { CordaService } from "@/services/CordaService";
import { SolanaService } from "@/services/SolanaService";

export class ApiGateway {
    private app: express.Application;
    private bridge: CrossChainBridge;
    private cordaService: CordaService;
    private solanaService: SolanaService;
    private config: BridgeConfig;
    private logger: Logger;

    constructor(
        bridge: CrossChainBridge,
        cordaService: CordaService,
        solanaService: SolanaService,
        config: BridgeConfig
    ) {
        this.bridge = bridge;
        this.cordaService = cordaService;
        this.solanaService = solanaService;
        this.config = config;
        this.logger = new Logger("ApiGateway");

        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }

    /**
     * Setup middleware
     */
    private setupMiddleware(): void {
        // Security middleware
        if (this.config.security.enableHelmet) {
            this.app.use(helmet());
        }

        // CORS middleware
        if (this.config.security.enableCors) {
            this.app.use(
                cors({
                    origin: this.config.security.allowedOrigins,
                    credentials: true,
                })
            );
        }

        // Compression middleware
        this.app.use(compression());

        // JSON parsing
        this.app.use(express.json({ limit: "10mb" }));
        this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

        // Request logging
        this.app.use((req, res, next) => {
            this.logger.info(`${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });
            next();
        });
    }

    /**
     * Setup API routes
     */
    private setupRoutes(): void {
        // Health check endpoint
        this.app.get("/health", this.healthCheck.bind(this));

        // Bridge status
        this.app.get("/bridge/status", this.getBridgeStatus.bind(this));

        // Identity endpoints
        this.app.get("/identity/:id", this.getIdentity.bind(this));
        this.app.get(
            "/identity/:id/proof",
            this.generateIdentityProof.bind(this)
        );
        this.app.post(
            "/identity/:id/validate",
            this.validateIdentityProof.bind(this)
        );

        // Access control endpoints
        this.app.post("/access/generate", this.generateAccessProof.bind(this));
        this.app.post("/access/validate", this.validateAccessProof.bind(this));

        // Data listing endpoints
        this.app.post("/data/listing", this.createDataListing.bind(this));
        this.app.get("/data/listing/:id", this.getDataListing.bind(this));
        this.app.get("/data/listings", this.getDataListings.bind(this));
        this.app.put("/data/listing/:id", this.updateDataListing.bind(this));
        this.app.delete("/data/listing/:id", this.cancelDataListing.bind(this));

        // Data purchase endpoints
        this.app.post("/data/purchase", this.purchaseData.bind(this));

        // Synchronization endpoints
        this.app.post("/sync/start", this.startSync.bind(this));
        this.app.post("/sync/stop", this.stopSync.bind(this));
        this.app.get("/sync/status", this.getSyncStatus.bind(this));

        // State endpoints
        this.app.get("/state/snapshot", this.getStateSnapshot.bind(this));

        // Error handling middleware
        this.app.use(this.errorHandler.bind(this));

        // 404 handler
        this.app.use(this.notFoundHandler.bind(this));
    }

    /**
     * Health check endpoint
     */
    private async healthCheck(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            const cordaMetrics = this.cordaService.getMetrics();
            const solanaMetrics = await this.solanaService.getMetrics();
            const bridgeStatus = this.bridge.getStatus();

            const response: HealthCheckResponse = {
                status: this.determineOverallStatus(
                    cordaMetrics,
                    solanaMetrics,
                    bridgeStatus
                ),
                timestamp: Date.now(),
                services: {
                    corda: {
                        status: cordaMetrics.isConnected ? "up" : "down",
                        responseTime: cordaMetrics.connectionTime,
                        lastCheck: Date.now(),
                    },
                    solana: {
                        status: solanaMetrics.isConnected ? "up" : "down",
                        responseTime: 0,
                        lastCheck: Date.now(),
                    },
                    bridge: {
                        status: bridgeStatus.isRunning ? "up" : "down",
                        responseTime: 0,
                        lastCheck: Date.now(),
                    },
                    database: {
                        status: "up", // Would check actual database
                        responseTime: 0,
                        lastCheck: Date.now(),
                    },
                },
                metrics: {
                    uptime: process.uptime(),
                    memoryUsage: process.memoryUsage(),
                    cpuUsage: process.cpuUsage(),
                    activeConnections: 1,
                },
            };

            res.json(this.createApiResponse(response));
        } catch (error) {
            this.logger.error("Health check failed", error);
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Health check failed",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Get bridge status
     */
    private async getBridgeStatus(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            const status = this.bridge.getStatus();
            res.json(this.createApiResponse(status));
        } catch (error) {
            this.logger.error("Failed to get bridge status", error);
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Failed to get bridge status",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Get identity by ID
     */
    private async getIdentity(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            const { id } = req.params;
            const identity = await this.cordaService.getIdentity(id);

            if (!identity) {
                res.status(404).json(
                    this.createApiResponse(null, "Identity not found")
                );
                return;
            }

            res.json(this.createApiResponse(identity));
        } catch (error) {
            this.logger.error(`Failed to get identity ${req.params.id}`, error);
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Failed to get identity",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Generate identity proof
     */
    private async generateIdentityProof(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            const { id } = req.params;
            const proof = await this.bridge.generateIdentityProof(id);
            res.json(this.createApiResponse(proof));
        } catch (error) {
            this.logger.error(
                `Failed to generate identity proof for ${req.params.id}`,
                error
            );
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Failed to generate identity proof",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Validate identity proof
     */
    private async validateIdentityProof(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            const proof = req.body;
            const result = await this.bridge.validateIdentityProof(proof);
            res.json(this.createApiResponse(result));
        } catch (error) {
            this.logger.error("Failed to validate identity proof", error);
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Failed to validate identity proof",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Generate access proof
     */
    private async generateAccessProof(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            const { identityId, consumer, dataType } = req.body;
            const proof = await this.bridge.generateAccessProof(
                identityId,
                consumer,
                dataType
            );
            res.json(this.createApiResponse(proof));
        } catch (error) {
            this.logger.error("Failed to generate access proof", error);
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Failed to generate access proof",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Create data listing
     */
    private async createDataListing(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            const {
                owner,
                listingId,
                price,
                dataType,
                description,
                cordaIdentityId,
                accessProof,
            } = req.body;

            const tx = await this.bridge.createDataListing(
                owner,
                listingId,
                price,
                dataType,
                description,
                cordaIdentityId,
                accessProof
            );

            res.json(this.createApiResponse({ transactionHash: tx }));
        } catch (error) {
            this.logger.error("Failed to create data listing", error);
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Failed to create data listing",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Get data listing
     */
    private async getDataListing(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            const { id } = req.params;
            const listing = await this.solanaService.getDataListing(
                parseInt(id)
            );

            if (!listing) {
                res.status(404).json(
                    this.createApiResponse(null, "Listing not found")
                );
                return;
            }

            res.json(this.createApiResponse(listing));
        } catch (error) {
            this.logger.error(
                `Failed to get data listing ${req.params.id}`,
                error
            );
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Failed to get data listing",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Get data listings
     */
    private async getDataListings(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            const { owner, page = 1, limit = 10 } = req.query;

            let listings;
            if (owner) {
                listings = await this.solanaService.getDataListingsByOwner(
                    owner as string
                );
            } else {
                listings = await this.solanaService.getActiveDataListings();
            }

            // Pagination
            const startIndex =
                (parseInt(page as string) - 1) * parseInt(limit as string);
            const endIndex = startIndex + parseInt(limit as string);
            const paginatedListings = listings.slice(startIndex, endIndex);

            const response: PaginatedResponse<any> = {
                success: true,
                data: paginatedListings,
                timestamp: Date.now(),
                requestId: (req.headers["x-request-id"] as string) || "unknown",
                pagination: {
                    page: parseInt(page as string),
                    limit: parseInt(limit as string),
                    total: listings.length,
                    totalPages: Math.ceil(
                        listings.length / parseInt(limit as string)
                    ),
                },
            };

            res.json(response);
        } catch (error) {
            this.logger.error("Failed to get data listings", error);
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Failed to get data listings",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Update data listing
     */
    private async updateDataListing(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            const { id } = req.params;
            const { owner, newPrice, cordaIdentityId } = req.body;

            const tx = await this.solanaService.updateDataListing(
                owner,
                parseInt(id),
                newPrice,
                cordaIdentityId
            );

            res.json(this.createApiResponse({ transactionHash: tx }));
        } catch (error) {
            this.logger.error(
                `Failed to update data listing ${req.params.id}`,
                error
            );
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Failed to update data listing",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Cancel data listing
     */
    private async cancelDataListing(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            const { id } = req.params;
            const { owner, cordaIdentityId } = req.body;

            const tx = await this.solanaService.cancelDataListing(
                owner,
                parseInt(id),
                cordaIdentityId
            );

            res.json(this.createApiResponse({ transactionHash: tx }));
        } catch (error) {
            this.logger.error(
                `Failed to cancel data listing ${req.params.id}`,
                error
            );
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Failed to cancel data listing",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Purchase data
     */
    private async purchaseData(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            const { buyer, listingId, tokenMint, cordaIdentityId } = req.body;

            const purchase = await this.bridge.purchaseData(
                buyer,
                listingId,
                tokenMint,
                cordaIdentityId
            );

            res.json(this.createApiResponse(purchase));
        } catch (error) {
            this.logger.error("Failed to purchase data", error);
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Failed to purchase data",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Start synchronization
     */
    private async startSync(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            const result = await this.bridge.synchronizeState();
            res.json(this.createApiResponse(result));
        } catch (error) {
            this.logger.error("Failed to start sync", error);
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Failed to start sync",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Get state snapshot
     */
    private async getStateSnapshot(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            const snapshot = await this.bridge.getStateSnapshot();
            res.json(this.createApiResponse(snapshot));
        } catch (error) {
            this.logger.error("Failed to get state snapshot", error);
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Failed to get state snapshot",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Error handler middleware
     */
    private errorHandler(
        error: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ): void {
        this.logger.error("API Error", {
            error: error.message,
            stack: error.stack,
            path: req.path,
            method: req.method,
        });

        res.status(500).json(
            this.createApiResponse(null, "Internal server error", error.message)
        );
    }

    /**
     * 404 handler
     */
    private notFoundHandler(req: express.Request, res: express.Response): void {
        res.status(404).json(
            this.createApiResponse(null, "Endpoint not found")
        );
    }

    /**
     * Validate access proof
     */
    private async validateAccessProof(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            const { proof } = req.body;

            if (!proof) {
                res.status(400).json(
                    this.createApiResponse(null, "Access proof is required")
                );
                return;
            }

            const isValid = await this.cordaService.validateAccessProof(proof);

            res.json(
                this.createApiResponse(
                    { isValid },
                    "Access proof validation completed"
                )
            );
        } catch (error) {
            this.logger.error("Validate access proof error", {
                error: error instanceof Error ? error.message : String(error),
            });
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Failed to validate access proof",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Stop synchronization
     */
    private async stopSync(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            await this.bridge.stopSync();

            res.json(
                this.createApiResponse(
                    { stopped: true },
                    "Synchronization stopped"
                )
            );
        } catch (error) {
            this.logger.error("Stop sync error", {
                error: error instanceof Error ? error.message : String(error),
            });
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Failed to stop synchronization",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Get synchronization status
     */
    private async getSyncStatus(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        try {
            const status = this.bridge.getSyncStatus();

            res.json(
                this.createApiResponse(
                    status,
                    "Synchronization status retrieved"
                )
            );
        } catch (error) {
            this.logger.error("Get sync status error", {
                error: error instanceof Error ? error.message : String(error),
            });
            res.status(500).json(
                this.createApiResponse(
                    null,
                    "Failed to get synchronization status",
                    error instanceof Error ? error.message : String(error)
                )
            );
        }
    }

    /**
     * Create standardized API response
     */
    private createApiResponse<T>(
        data?: T,
        message?: string,
        error?: string
    ): ApiResponse<T> {
        return {
            success: !error,
            data,
            error,
            message,
            timestamp: Date.now(),
            requestId: "api_request",
        };
    }

    /**
     * Determine overall system status
     */
    private determineOverallStatus(
        cordaMetrics: any,
        solanaMetrics: any,
        bridgeStatus: any
    ): "healthy" | "degraded" | "unhealthy" {
        const cordaHealthy = cordaMetrics.isConnected;
        const solanaHealthy = solanaMetrics.isConnected;
        const bridgeHealthy = bridgeStatus.isRunning;

        if (cordaHealthy && solanaHealthy && bridgeHealthy) {
            return "healthy";
        } else if (cordaHealthy || solanaHealthy) {
            return "degraded";
        } else {
            return "unhealthy";
        }
    }

    /**
     * Get Express app
     */
    getApp(): express.Application {
        return this.app;
    }

    /**
     * Start the API server
     */
    start(port: number): void {
        this.app.listen(port, () => {
            this.logger.info(`API Gateway started on port ${port}`);
        });
    }
}
