package com.datasov.states

import com.datasov.contracts.DigitalIdentityContract
import net.corda.core.contracts.*
import net.corda.core.identity.AbstractParty
import net.corda.core.identity.Party
import net.corda.core.serialization.CordaSerializable
import java.time.Instant
import java.util.*

/**
 * Digital Identity State for DataSov
 * 
 * This state represents a digital identity (DID) on the Corda network.
 * It contains all the necessary information for identity management,
 * verification, and access control.
 */
@BelongsToContract(DigitalIdentityContract::class)
data class DigitalIdentityState(
    val identityId: String,
    val owner: Party,
    val identityProvider: Party,
    val identityType: IdentityType,
    val status: IdentityStatus,
    val verificationLevel: VerificationLevel,
    val personalInfo: PersonalInfo,
    val accessPermissions: List<AccessPermission>,
    val createdAt: Instant,
    val verifiedAt: Instant?,
    val updatedAt: Instant?,
    val revokedAt: Instant?,
    val revocationReason: String?,
    val verificationMethod: VerificationMethod?,
    val metadata: Map<String, String>,
    override val participants: List<AbstractParty> = listOf(owner, identityProvider)
) : ContractState {

    /**
     * Identity types supported by DataSov
     */
    @CordaSerializable
    enum class IdentityType {
        NTT_DOCOMO_USER_ID,
        GOVERNMENT_DIGITAL_ID,
        PASSPORT,
        DRIVERS_LICENSE,
        NATIONAL_ID,
        CUSTOM
    }

    /**
     * Identity verification status
     */
    @CordaSerializable
    enum class IdentityStatus {
        PENDING,    // Identity registered but not yet verified
        VERIFIED,   // Identity verified and active
        REVOKED,    // Identity revoked and inactive
        SUSPENDED   // Identity temporarily suspended
    }

    /**
     * Verification levels for different types of identity verification
     */
    @CordaSerializable
    enum class VerificationLevel {
        NONE,           // No verification
        BASIC,          // Basic verification (email, phone)
        ENHANCED,       // Enhanced verification (document check)
        HIGH,           // High assurance verification (biometric, in-person)
        CREDENTIAL      // Credential-based verification
    }

    /**
     * Personal information (anonymized and encrypted)
     */
    @CordaSerializable
    data class PersonalInfo(
        val firstName: String?,
        val lastName: String?,
        val dateOfBirth: String?, // Encrypted/Anonymized
        val nationality: String?,
        val address: String?, // Encrypted/Anonymized
        val phoneNumber: String?, // Encrypted/Anonymized
        val emailAddress: String?, // Encrypted/Anonymized
        val encryptedData: Map<String, String> // Additional encrypted fields
    )

    /**
     * Access permission for data consumers
     */
    @CordaSerializable
    data class AccessPermission(
        val consumer: Party,
        val permissionType: PermissionType,
        val dataTypes: List<DataType>,
        val grantedAt: Instant,
        val expiresAt: Instant?,
        val isActive: Boolean,
        val grantedBy: Party
    )

    /**
     * Types of permissions that can be granted
     */
    @CordaSerializable
    enum class PermissionType {
        READ_ONLY,      // Read-only access to specified data
        READ_WRITE,     // Read and write access to specified data
        SHARE,          // Permission to share data with third parties
        ANALYZE,        // Permission to analyze data for insights
        EXPORT          // Permission to export data
    }

    /**
     * Types of data that can be accessed
     */
    @CordaSerializable
    enum class DataType {
        LOCATION_HISTORY,
        APP_USAGE,
        PURCHASE_HISTORY,
        HEALTH_DATA,
        SOCIAL_MEDIA_ACTIVITY,
        SEARCH_HISTORY,
        FINANCIAL_DATA,
        COMMUNICATION_DATA,
        CUSTOM
    }

    /**
     * Verification methods used to verify the identity
     */
    @CordaSerializable
    data class VerificationMethod(
        val method: VerificationMethodType,
        val provider: String,
        val reference: String,
        val performedAt: Instant,
        val validUntil: Instant?
    )

    /**
     * Types of verification methods
     */
    @CordaSerializable
    enum class VerificationMethodType {
        DOCUMENT_VERIFICATION,
        BIOMETRIC_VERIFICATION,
        KNOWLEDGE_BASED_VERIFICATION,
        CREDENTIAL_VERIFICATION,
        THIRD_PARTY_VERIFICATION,
        SELF_ATTESTATION
    }

    /**
     * Check if the identity is active and verified
     */
    fun isActive(): Boolean {
        return status == IdentityStatus.VERIFIED
    }

    /**
     * Check if a party has access to specific data type
     */
    fun hasAccess(party: Party, dataType: DataType): Boolean {
        if (!isActive()) return false
        
        return accessPermissions.any { permission ->
            permission.consumer == party &&
            permission.isActive &&
            permission.dataTypes.contains(dataType) &&
            (permission.expiresAt == null || permission.expiresAt.isAfter(Instant.now()))
        }
    }

    /**
     * Get active access permissions for a party
     */
    fun getActivePermissions(party: Party): List<AccessPermission> {
        return accessPermissions.filter { permission ->
            permission.consumer == party &&
            permission.isActive &&
            (permission.expiresAt == null || permission.expiresAt.isAfter(Instant.now()))
        }
    }

    /**
     * Check if identity can be updated
     */
    fun canBeUpdated(): Boolean {
        return status == IdentityStatus.VERIFIED
    }

    /**
     * Check if identity can be revoked
     */
    fun canBeRevoked(): Boolean {
        return status == IdentityStatus.VERIFIED || status == IdentityStatus.PENDING
    }

    /**
     * Create a copy with updated timestamp
     */
    fun withUpdatedTimestamp(): DigitalIdentityState {
        return copy(updatedAt = Instant.now())
    }

    /**
     * Create a copy with revoked status
     */
    fun withRevokedStatus(reason: String): DigitalIdentityState {
        return copy(
            status = IdentityStatus.REVOKED,
            revokedAt = Instant.now(),
            revocationReason = reason
        )
    }

    /**
     * Create a copy with verified status
     */
    fun withVerifiedStatus(
        verificationLevel: VerificationLevel,
        verificationMethod: VerificationMethod
    ): DigitalIdentityState {
        return copy(
            status = IdentityStatus.VERIFIED,
            verificationLevel = verificationLevel,
            verifiedAt = Instant.now(),
            verificationMethod = verificationMethod
        )
    }

    /**
     * Create a copy with new access permission
     */
    fun withNewAccessPermission(permission: AccessPermission): DigitalIdentityState {
        val updatedPermissions = accessPermissions.toMutableList()
        updatedPermissions.add(permission)
        return copy(
            accessPermissions = updatedPermissions,
            updatedAt = Instant.now()
        )
    }

    /**
     * Create a copy with removed access permission
     */
    fun withRemovedAccessPermission(consumer: Party, dataType: DataType): DigitalIdentityState {
        val updatedPermissions = accessPermissions.filter { permission ->
            !(permission.consumer == consumer && permission.dataTypes.contains(dataType))
        }
        return copy(
            accessPermissions = updatedPermissions,
            updatedAt = Instant.now()
        )
    }
}
