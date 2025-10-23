/**
 * DataSov Integration Layer
 *
 * Main entry point for the cross-chain integration service
 * that bridges Corda and Solana networks.
 */
declare class DataSovIntegrationLayer {
    private logger;
    private config;
    private cordaService;
    private solanaService;
    private bridge;
    private apiGateway;
    private isRunning;
    constructor();
    /**
     * Load configuration from environment variables
     */
    private loadConfiguration;
    /**
     * Start the integration layer
     */
    start(): Promise<void>;
    /**
     * Stop the integration layer
     */
    stop(): Promise<void>;
    /**
     * Setup graceful shutdown handlers
     */
    private setupGracefulShutdown;
    /**
     * Get service status
     */
    getStatus(): Record<string, any>;
}
export { DataSovIntegrationLayer };
//# sourceMappingURL=index.d.ts.map