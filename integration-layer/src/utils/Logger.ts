/**
 * Logger Utility
 *
 * Provides structured logging for the DataSov Integration Layer
 */

import winston from "winston";

export class Logger {
    private logger: winston.Logger;

    constructor(service: string) {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json(),
                winston.format.printf(
                    ({ timestamp, level, message, service, ...meta }) => {
                        return JSON.stringify({
                            timestamp,
                            level,
                            service,
                            message,
                            ...meta,
                        });
                    }
                )
            ),
            defaultMeta: { service },
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    ),
                }),
            ],
        });

        // Add file transport in production
        if (process.env.NODE_ENV === "production") {
            this.logger.add(
                new winston.transports.File({
                    filename: "logs/error.log",
                    level: "error",
                })
            );
            this.logger.add(
                new winston.transports.File({
                    filename: "logs/combined.log",
                })
            );
        }
    }

    /**
     * Log info message
     */
    info(message: string, meta?: any): void {
        this.logger.info(message, meta);
    }

    /**
     * Log warning message
     */
    warn(message: string, meta?: any): void {
        this.logger.warn(message, meta);
    }

    /**
     * Log error message
     */
    error(message: string, error?: any, meta?: any): void {
        this.logger.error(message, { error, ...meta });
    }

    /**
     * Log debug message
     */
    debug(message: string, meta?: any): void {
        this.logger.debug(message, meta);
    }

    /**
     * Log with custom level
     */
    log(level: string, message: string, meta?: any): void {
        this.logger.log(level, message, meta);
    }
}
