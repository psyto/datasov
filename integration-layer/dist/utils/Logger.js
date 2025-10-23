"use strict";
/**
 * Logger Utility
 *
 * Provides structured logging for the DataSov Integration Layer
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
class Logger {
    constructor(service) {
        this.logger = winston_1.default.createLogger({
            level: process.env.LOG_LEVEL || "info",
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.printf(({ timestamp, level, message, service, ...meta }) => {
                return JSON.stringify({
                    timestamp,
                    level,
                    service,
                    message,
                    ...meta,
                });
            })),
            defaultMeta: { service },
            transports: [
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
                }),
            ],
        });
        // Add file transport in production
        if (process.env.NODE_ENV === "production") {
            this.logger.add(new winston_1.default.transports.File({
                filename: "logs/error.log",
                level: "error",
            }));
            this.logger.add(new winston_1.default.transports.File({
                filename: "logs/combined.log",
            }));
        }
    }
    /**
     * Log info message
     */
    info(message, meta) {
        this.logger.info(message, meta);
    }
    /**
     * Log warning message
     */
    warn(message, meta) {
        this.logger.warn(message, meta);
    }
    /**
     * Log error message
     */
    error(message, error, meta) {
        this.logger.error(message, { error, ...meta });
    }
    /**
     * Log debug message
     */
    debug(message, meta) {
        this.logger.debug(message, meta);
    }
    /**
     * Log with custom level
     */
    log(level, message, meta) {
        this.logger.log(level, message, meta);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map