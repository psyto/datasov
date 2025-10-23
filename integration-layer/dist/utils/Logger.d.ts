/**
 * Logger Utility
 *
 * Provides structured logging for the DataSov Integration Layer
 */
export declare class Logger {
    private logger;
    constructor(service: string);
    /**
     * Log info message
     */
    info(message: string, meta?: any): void;
    /**
     * Log warning message
     */
    warn(message: string, meta?: any): void;
    /**
     * Log error message
     */
    error(message: string, error?: any, meta?: any): void;
    /**
     * Log debug message
     */
    debug(message: string, meta?: any): void;
    /**
     * Log with custom level
     */
    log(level: string, message: string, meta?: any): void;
}
//# sourceMappingURL=Logger.d.ts.map