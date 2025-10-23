"use strict";
/**
 * DataSov Integration Layer Types
 *
 * This module defines all the types and interfaces used across the integration layer
 * for cross-chain communication between Corda and Solana.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeError = exports.SolanaError = exports.CordaError = exports.ValidationError = exports.IntegrationError = exports.VerificationMethodType = exports.DataType = exports.PermissionType = exports.VerificationLevel = exports.IdentityStatus = exports.IdentityType = void 0;
var IdentityType;
(function (IdentityType) {
    IdentityType["NTT_DOCOMO_USER_ID"] = "NTT_DOCOMO_USER_ID";
    IdentityType["GOVERNMENT_DIGITAL_ID"] = "GOVERNMENT_DIGITAL_ID";
    IdentityType["PASSPORT"] = "PASSPORT";
    IdentityType["DRIVERS_LICENSE"] = "DRIVERS_LICENSE";
    IdentityType["NATIONAL_ID"] = "NATIONAL_ID";
    IdentityType["CUSTOM"] = "CUSTOM";
})(IdentityType || (exports.IdentityType = IdentityType = {}));
var IdentityStatus;
(function (IdentityStatus) {
    IdentityStatus["PENDING"] = "PENDING";
    IdentityStatus["VERIFIED"] = "VERIFIED";
    IdentityStatus["REVOKED"] = "REVOKED";
    IdentityStatus["SUSPENDED"] = "SUSPENDED";
})(IdentityStatus || (exports.IdentityStatus = IdentityStatus = {}));
var VerificationLevel;
(function (VerificationLevel) {
    VerificationLevel["NONE"] = "NONE";
    VerificationLevel["BASIC"] = "BASIC";
    VerificationLevel["ENHANCED"] = "ENHANCED";
    VerificationLevel["HIGH"] = "HIGH";
    VerificationLevel["CREDENTIAL"] = "CREDENTIAL";
})(VerificationLevel || (exports.VerificationLevel = VerificationLevel = {}));
var PermissionType;
(function (PermissionType) {
    PermissionType["READ_ONLY"] = "READ_ONLY";
    PermissionType["READ_WRITE"] = "READ_WRITE";
    PermissionType["SHARE"] = "SHARE";
    PermissionType["ANALYZE"] = "ANALYZE";
    PermissionType["EXPORT"] = "EXPORT";
})(PermissionType || (exports.PermissionType = PermissionType = {}));
var DataType;
(function (DataType) {
    DataType["LOCATION_HISTORY"] = "LOCATION_HISTORY";
    DataType["APP_USAGE"] = "APP_USAGE";
    DataType["PURCHASE_HISTORY"] = "PURCHASE_HISTORY";
    DataType["HEALTH_DATA"] = "HEALTH_DATA";
    DataType["SOCIAL_MEDIA_ACTIVITY"] = "SOCIAL_MEDIA_ACTIVITY";
    DataType["SEARCH_HISTORY"] = "SEARCH_HISTORY";
    DataType["FINANCIAL_DATA"] = "FINANCIAL_DATA";
    DataType["COMMUNICATION_DATA"] = "COMMUNICATION_DATA";
    DataType["CUSTOM"] = "CUSTOM";
})(DataType || (exports.DataType = DataType = {}));
var VerificationMethodType;
(function (VerificationMethodType) {
    VerificationMethodType["DOCUMENT_VERIFICATION"] = "DOCUMENT_VERIFICATION";
    VerificationMethodType["BIOMETRIC_VERIFICATION"] = "BIOMETRIC_VERIFICATION";
    VerificationMethodType["KNOWLEDGE_BASED_VERIFICATION"] = "KNOWLEDGE_BASED_VERIFICATION";
    VerificationMethodType["CREDENTIAL_VERIFICATION"] = "CREDENTIAL_VERIFICATION";
    VerificationMethodType["THIRD_PARTY_VERIFICATION"] = "THIRD_PARTY_VERIFICATION";
    VerificationMethodType["SELF_ATTESTATION"] = "SELF_ATTESTATION";
})(VerificationMethodType || (exports.VerificationMethodType = VerificationMethodType = {}));
// ============================================================================
// Error Types
// ============================================================================
class IntegrationError extends Error {
    constructor(message, code, chain, details) {
        super(message);
        this.code = code;
        this.chain = chain;
        this.details = details;
        this.name = "IntegrationError";
    }
}
exports.IntegrationError = IntegrationError;
class ValidationError extends IntegrationError {
    constructor(message, details) {
        super(message, "VALIDATION_ERROR", "Bridge", details);
        this.name = "ValidationError";
    }
}
exports.ValidationError = ValidationError;
class CordaError extends IntegrationError {
    constructor(message, details) {
        super(message, "CORDA_ERROR", "Corda", details);
        this.name = "CordaError";
    }
}
exports.CordaError = CordaError;
class SolanaError extends IntegrationError {
    constructor(message, details) {
        super(message, "SOLANA_ERROR", "Solana", details);
        this.name = "SolanaError";
    }
}
exports.SolanaError = SolanaError;
class BridgeError extends IntegrationError {
    constructor(message, details) {
        super(message, "BRIDGE_ERROR", "Bridge", details);
        this.name = "BridgeError";
    }
}
exports.BridgeError = BridgeError;
//# sourceMappingURL=index.js.map