/**
 * Corda Service
 *
 * Handles communication with the Corda network for identity management
 * and access control operations.
 */

import { CordaRPCClient } from "corda-rpc";
import {
    DigitalIdentity,
    IdentityProof,
    AccessProof,
    CordaEvent,
    CordaConfig,
    CordaError,
    ValidationResult,
} from "@/types";
import { Logger } from "@/utils/Logger";
import { EventEmitter } from "events";

export class CordaService extends EventEmitter {
    private rpcClient: CordaRPCClient;
    private config: CordaConfig;
    private logger: Logger;
    private isConnected: boolean = false;

    constructor(config: CordaConfig) {
        super();
        this.config = config;
        this.logger = new Logger("CordaService");
        this.rpcClient = new CordaRPCClient({
            host: config.rpcHost,
            port: config.rpcPort,
            username: config.username,
            password: config.password,
            timeout: config.timeout,
        });
    }

    /**
     * Initialize connection to Corda network
     */
    async connect(): Promise<void> {
        try {
            await this.rpcClient.connect();
            this.isConnected = true;
            this.logger.info("Connected to Corda network");

            // Start listening for events
            this.startEventListening();
        } catch (error) {
            this.logger.error("Failed to connect to Corda network", error);
            throw new CordaError("Connection failed", { error: error.message });
        }
    }

    /**
     * Disconnect from Corda network
     */
    async disconnect(): Promise<void> {
        try {
            await this.rpcClient.disconnect();
            this.isConnected = false;
            this.logger.info("Disconnected from Corda network");
        } catch (error) {
            this.logger.error("Error disconnecting from Corda", error);
        }
    }

    /**
     * Get digital identity by ID
     */
    async getIdentity(identityId: string): Promise<DigitalIdentity | null> {
        try {
            this.validateConnection();

            const identity = await this.rpcClient.queryIdentity(identityId);
            if (!identity) {
                return null;
            }

            return this.mapCordaIdentityToDigitalIdentity(identity);
        } catch (error) {
            this.logger.error(`Failed to get identity ${identityId}`, error);
            throw new CordaError("Failed to get identity", {
                identityId,
                error: error.message,
            });
        }
    }

    /**
     * Get all identities for a party
     */
    async getIdentitiesByOwner(owner: string): Promise<DigitalIdentity[]> {
        try {
            this.validateConnection();

            const identities = await this.rpcClient.queryIdentitiesByOwner(
                owner
            );
            return identities.map((identity) =>
                this.mapCordaIdentityToDigitalIdentity(identity)
            );
        } catch (error) {
            this.logger.error(
                `Failed to get identities for owner ${owner}`,
                error
            );
            throw new CordaError("Failed to get identities by owner", {
                owner,
                error: error.message,
            });
        }
    }

    /**
     * Get all identities where party is the identity provider
     */
    async getIdentitiesAsProvider(
        provider: string
    ): Promise<DigitalIdentity[]> {
        try {
            this.validateConnection();

            const identities = await this.rpcClient.queryIdentitiesAsProvider(
                provider
            );
            return identities.map((identity) =>
                this.mapCordaIdentityToDigitalIdentity(identity)
            );
        } catch (error) {
            this.logger.error(
                `Failed to get identities for provider ${provider}`,
                error
            );
            throw new CordaError("Failed to get identities as provider", {
                provider,
                error: error.message,
            });
        }
    }

    /**
     * Generate identity proof for cross-chain validation
     */
    async generateIdentityProof(identityId: string): Promise<IdentityProof> {
        try {
            this.validateConnection();

            const identity = await this.getIdentity(identityId);
            if (!identity) {
                throw new CordaError("Identity not found", { identityId });
            }

            if (identity.status !== "VERIFIED") {
                throw new CordaError("Identity not verified", {
                    identityId,
                    status: identity.status,
                });
            }

            // Generate cryptographic proof
            const proof = await this.rpcClient.generateIdentityProof(
                identityId
            );

            const identityProof: IdentityProof = {
                identityId: identity.identityId,
                owner: identity.owner,
                verificationLevel: identity.verificationLevel,
                verificationTimestamp: identity.verifiedAt || Date.now(),
                cordaTransactionHash: proof.transactionHash,
                signature: proof.signature,
                validUntil: this.calculateValidUntil(
                    identity.verificationLevel
                ),
                metadata: {
                    identityType: identity.identityType,
                    verificationMethod: identity.verificationMethod,
                    createdAt: identity.createdAt,
                },
            };

            this.logger.info(`Generated identity proof for ${identityId}`);
            return identityProof;
        } catch (error) {
            this.logger.error(
                `Failed to generate identity proof for ${identityId}`,
                error
            );
            throw new CordaError("Failed to generate identity proof", {
                identityId,
                error: error.message,
            });
        }
    }

    /**
     * Generate access proof for data access permissions
     */
    async generateAccessProof(
        identityId: string,
        consumer: string,
        dataType: string
    ): Promise<AccessProof> {
        try {
            this.validateConnection();

            const identity = await this.getIdentity(identityId);
            if (!identity) {
                throw new CordaError("Identity not found", { identityId });
            }

            // Check if consumer has access
            const hasAccess = identity.accessPermissions.some(
                (permission) =>
                    permission.consumer === consumer &&
                    permission.dataTypes.includes(dataType as any) &&
                    permission.isActive &&
                    (!permission.expiresAt || permission.expiresAt > Date.now())
            );

            if (!hasAccess) {
                throw new CordaError("Access not granted", {
                    identityId,
                    consumer,
                    dataType,
                });
            }

            const accessProof = await this.rpcClient.generateAccessProof(
                identityId,
                consumer,
                dataType
            );

            const proof: AccessProof = {
                identityId,
                consumer,
                permissionType:
                    identity.accessPermissions.find(
                        (p) => p.consumer === consumer
                    )?.permissionType || "READ_ONLY",
                dataTypes: [dataType as any],
                grantedAt:
                    identity.accessPermissions.find(
                        (p) => p.consumer === consumer
                    )?.grantedAt || Date.now(),
                expiresAt: identity.accessPermissions.find(
                    (p) => p.consumer === consumer
                )?.expiresAt,
                isActive: true,
                grantedBy: identity.owner,
                signature: accessProof.signature,
                cordaTransactionHash: accessProof.transactionHash,
            };

            this.logger.info(
                `Generated access proof for ${identityId} -> ${consumer}`
            );
            return proof;
        } catch (error) {
            this.logger.error(
                `Failed to generate access proof for ${identityId}`,
                error
            );
            throw new CordaError("Failed to generate access proof", {
                identityId,
                consumer,
                dataType,
                error: error.message,
            });
        }
    }

    /**
     * Validate identity proof from external source
     */
    async validateIdentityProof(
        proof: IdentityProof
    ): Promise<ValidationResult> {
        try {
            this.validateConnection();

            const result = await this.rpcClient.validateIdentityProof(proof);

            if (result.isValid) {
                this.logger.info(
                    `Identity proof validated for ${proof.identityId}`
                );
                return {
                    isValid: true,
                    errors: [],
                    warnings: result.warnings || [],
                };
            } else {
                this.logger.warn(
                    `Identity proof validation failed for ${proof.identityId}`,
                    result.errors
                );
                return {
                    isValid: false,
                    errors: result.errors || ["Proof validation failed"],
                    warnings: [],
                };
            }
        } catch (error) {
            this.logger.error(
                `Failed to validate identity proof for ${proof.identityId}`,
                error
            );
            return {
                isValid: false,
                errors: [error.message],
                warnings: [],
            };
        }
    }

    /**
     * Start listening for Corda events
     */
    private startEventListening(): void {
        this.rpcClient.on("identityRegistered", (event) => {
            this.emit("cordaEvent", {
                type: "IDENTITY_REGISTERED",
                identityId: event.identityId,
                timestamp: Date.now(),
                transactionHash: event.transactionHash,
                details: event,
            } as CordaEvent);
        });

        this.rpcClient.on("identityVerified", (event) => {
            this.emit("cordaEvent", {
                type: "IDENTITY_VERIFIED",
                identityId: event.identityId,
                timestamp: Date.now(),
                transactionHash: event.transactionHash,
                details: event,
            } as CordaEvent);
        });

        this.rpcClient.on("identityUpdated", (event) => {
            this.emit("cordaEvent", {
                type: "IDENTITY_UPDATED",
                identityId: event.identityId,
                timestamp: Date.now(),
                transactionHash: event.transactionHash,
                details: event,
            } as CordaEvent);
        });

        this.rpcClient.on("identityRevoked", (event) => {
            this.emit("cordaEvent", {
                type: "IDENTITY_REVOKED",
                identityId: event.identityId,
                timestamp: Date.now(),
                transactionHash: event.transactionHash,
                details: event,
            } as CordaEvent);
        });

        this.rpcClient.on("accessGranted", (event) => {
            this.emit("cordaEvent", {
                type: "ACCESS_GRANTED",
                identityId: event.identityId,
                timestamp: Date.now(),
                transactionHash: event.transactionHash,
                details: event,
            } as CordaEvent);
        });

        this.rpcClient.on("accessRevoked", (event) => {
            this.emit("cordaEvent", {
                type: "ACCESS_REVOKED",
                identityId: event.identityId,
                timestamp: Date.now(),
                transactionHash: event.transactionHash,
                details: event,
            } as CordaEvent);
        });
    }

    /**
     * Map Corda identity to DigitalIdentity format
     */
    private mapCordaIdentityToDigitalIdentity(
        cordaIdentity: any
    ): DigitalIdentity {
        return {
            identityId: cordaIdentity.identityId,
            owner: cordaIdentity.owner,
            identityProvider: cordaIdentity.identityProvider,
            identityType: cordaIdentity.identityType,
            status: cordaIdentity.status,
            verificationLevel: cordaIdentity.verificationLevel,
            personalInfo: cordaIdentity.personalInfo,
            accessPermissions: cordaIdentity.accessPermissions || [],
            createdAt: cordaIdentity.createdAt,
            verifiedAt: cordaIdentity.verifiedAt,
            updatedAt: cordaIdentity.updatedAt,
            revokedAt: cordaIdentity.revokedAt,
            revocationReason: cordaIdentity.revocationReason,
            verificationMethod: cordaIdentity.verificationMethod,
            metadata: cordaIdentity.metadata || {},
        };
    }

    /**
     * Calculate proof validity period based on verification level
     */
    private calculateValidUntil(verificationLevel: string): number {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        switch (verificationLevel) {
            case "CREDENTIAL":
                return now + 365 * oneDay; // 1 year
            case "HIGH":
                return now + 180 * oneDay; // 6 months
            case "ENHANCED":
                return now + 90 * oneDay; // 3 months
            case "BASIC":
                return now + 30 * oneDay; // 1 month
            default:
                return now + 7 * oneDay; // 1 week
        }
    }

    /**
     * Validate connection status
     */
    private validateConnection(): void {
        if (!this.isConnected) {
            throw new CordaError("Not connected to Corda network");
        }
    }

    /**
     * Get connection status
     */
    isHealthy(): boolean {
        return this.isConnected && this.rpcClient.isConnected();
    }

    /**
     * Get service metrics
     */
    getMetrics(): Record<string, any> {
        return {
            isConnected: this.isConnected,
            connectionTime: this.rpcClient.getConnectionTime(),
            requestCount: this.rpcClient.getRequestCount(),
            errorCount: this.rpcClient.getErrorCount(),
        };
    }
}
