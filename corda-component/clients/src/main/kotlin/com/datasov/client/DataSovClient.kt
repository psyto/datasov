package com.datasov.client

import com.datasov.flows.*
import com.datasov.services.KYCService
import com.datasov.services.KYCVerificationMethod
import com.datasov.states.DigitalIdentityState
import net.corda.core.identity.Party
import net.corda.core.messaging.CordaRPCOps
import net.corda.core.messaging.startFlow
import net.corda.core.node.services.Vault
import net.corda.core.node.services.vault.QueryCriteria
import net.corda.core.transactions.SignedTransaction
import java.time.Instant

/**
 * DataSov Corda Client
 * 
 * This client provides a high-level interface for interacting with the DataSov
 * Corda network for digital identity management and data ownership.
 */
class DataSovClient(private val rpcOps: CordaRPCOps) {

    /**
     * Register a new digital identity
     */
    fun registerIdentity(
        identityId: String,
        identityType: DigitalIdentityState.IdentityType,
        personalInfo: DigitalIdentityState.PersonalInfo,
        identityProvider: Party,
        metadata: Map<String, String> = emptyMap()
    ): SignedTransaction {
        return rpcOps.startFlow(
            ::IdentityRegistrationFlow,
            identityId,
            identityType,
            personalInfo,
            identityProvider,
            metadata
        ).returnValue.get()
    }

    /**
     * Verify a digital identity using KYC service
     */
    fun verifyIdentity(
        identityId: String,
        verificationMethod: KYCVerificationMethod
    ): SignedTransaction {
        // Get the identity state first
        val identityState = getIdentityById(identityId)
            ?: throw IllegalArgumentException("Identity with ID $identityId not found")

        // Perform KYC verification
        val kycService = rpcOps.cordaService(KYCService::class.java)
        val kycResult = kycService.performKYCVerification(
            identityId,
            identityState.personalInfo,
            verificationMethod
        )

        // Create verification method for the identity state
        val verificationMethodState = DigitalIdentityState.VerificationMethod(
            method = when (verificationMethod) {
                KYCVerificationMethod.DOCUMENT_VERIFICATION -> DigitalIdentityState.VerificationMethodType.DOCUMENT_VERIFICATION
                KYCVerificationMethod.BIOMETRIC_VERIFICATION -> DigitalIdentityState.VerificationMethodType.BIOMETRIC_VERIFICATION
                KYCVerificationMethod.KNOWLEDGE_BASED_VERIFICATION -> DigitalIdentityState.VerificationMethodType.KNOWLEDGE_BASED_VERIFICATION
                KYCVerificationMethod.CREDENTIAL_VERIFICATION -> DigitalIdentityState.VerificationMethodType.CREDENTIAL_VERIFICATION
                KYCVerificationMethod.THIRD_PARTY_VERIFICATION -> DigitalIdentityState.VerificationMethodType.THIRD_PARTY_VERIFICATION
                KYCVerificationMethod.SELF_ATTESTATION -> DigitalIdentityState.VerificationMethodType.SELF_ATTESTATION
            },
            provider = kycResult.provider,
            reference = kycResult.reference,
            performedAt = kycResult.performedAt,
            validUntil = kycResult.validUntil
        )

        // Determine verification level based on KYC result
        val verificationLevel = when (verificationMethod) {
            KYCVerificationMethod.SELF_ATTESTATION -> DigitalIdentityState.VerificationLevel.BASIC
            KYCVerificationMethod.KNOWLEDGE_BASED_VERIFICATION -> DigitalIdentityState.VerificationLevel.BASIC
            KYCVerificationMethod.DOCUMENT_VERIFICATION -> DigitalIdentityState.VerificationLevel.ENHANCED
            KYCVerificationMethod.THIRD_PARTY_VERIFICATION -> DigitalIdentityState.VerificationLevel.ENHANCED
            KYCVerificationMethod.BIOMETRIC_VERIFICATION -> DigitalIdentityState.VerificationLevel.HIGH
            KYCVerificationMethod.CREDENTIAL_VERIFICATION -> DigitalIdentityState.VerificationLevel.CREDENTIAL
        }

        return rpcOps.startFlow(
            ::IdentityVerificationFlow,
            identityId,
            verificationLevel,
            verificationMethodState
        ).returnValue.get()
    }

    /**
     * Update a digital identity
     */
    fun updateIdentity(
        identityId: String,
        updatedPersonalInfo: DigitalIdentityState.PersonalInfo,
        updatedMetadata: Map<String, String> = emptyMap()
    ): SignedTransaction {
        return rpcOps.startFlow(
            ::IdentityUpdateFlow,
            identityId,
            updatedPersonalInfo,
            updatedMetadata
        ).returnValue.get()
    }

    /**
     * Grant access permission to a data consumer
     */
    fun grantAccess(
        identityId: String,
        consumer: Party,
        permissionType: DigitalIdentityState.PermissionType,
        dataTypes: List<DigitalIdentityState.DataType>,
        expiresAt: Instant? = null
    ): SignedTransaction {
        return rpcOps.startFlow(
            ::GrantAccessFlow,
            identityId,
            consumer,
            permissionType,
            dataTypes,
            expiresAt
        ).returnValue.get()
    }

    /**
     * Revoke access permission from a data consumer
     */
    fun revokeAccess(
        identityId: String,
        consumer: Party,
        dataType: DigitalIdentityState.DataType
    ): SignedTransaction {
        return rpcOps.startFlow(
            ::RevokeAccessFlow,
            identityId,
            consumer,
            dataType
        ).returnValue.get()
    }

    /**
     * Revoke a digital identity
     */
    fun revokeIdentity(
        identityId: String,
        revocationReason: String
    ): SignedTransaction {
        return rpcOps.startFlow(
            ::RevokeIdentityFlow,
            identityId,
            revocationReason
        ).returnValue.get()
    }

    /**
     * Get a digital identity by ID
     */
    fun getIdentityById(identityId: String): DigitalIdentityState? {
        val criteria = QueryCriteria.VaultQueryCriteria(
            status = Vault.StateStatus.UNCONSUMED
        )
        
        val results = rpcOps.vaultQueryBy<DigitalIdentityState>(criteria)
        return results.states
            .map { it.state.data }
            .find { it.identityId == identityId }
    }

    /**
     * Get all identities owned by the current party
     */
    fun getMyIdentities(): List<DigitalIdentityState> {
        val criteria = QueryCriteria.VaultQueryCriteria(
            status = Vault.StateStatus.UNCONSUMED
        )
        
        val results = rpcOps.vaultQueryBy<DigitalIdentityState>(criteria)
        return results.states
            .map { it.state.data }
            .filter { it.owner == rpcOps.nodeInfo().legalIdentities.first() }
    }

    /**
     * Get all identities where the current party is the identity provider
     */
    fun getIdentitiesAsProvider(): List<DigitalIdentityState> {
        val criteria = QueryCriteria.VaultQueryCriteria(
            status = Vault.StateStatus.UNCONSUMED
        )
        
        val results = rpcOps.vaultQueryBy<DigitalIdentityState>(criteria)
        return results.states
            .map { it.state.data }
            .filter { it.identityProvider == rpcOps.nodeInfo().legalIdentities.first() }
    }

    /**
     * Get all identities where the current party has access permissions
     */
    fun getIdentitiesWithAccess(): List<DigitalIdentityState> {
        val criteria = QueryCriteria.VaultQueryCriteria(
            status = Vault.StateStatus.UNCONSUMED
        )
        
        val results = rpcOps.vaultQueryBy<DigitalIdentityState>(criteria)
        val currentParty = rpcOps.nodeInfo().legalIdentities.first()
        
        return results.states
            .map { it.state.data }
            .filter { identity ->
                identity.accessPermissions.any { permission ->
                    permission.consumer == currentParty && 
                    permission.isActive &&
                    (permission.expiresAt == null || permission.expiresAt.isAfter(Instant.now()))
                }
            }
    }

    /**
     * Check if a party has access to specific data type for an identity
     */
    fun hasAccess(identityId: String, dataType: DigitalIdentityState.DataType): Boolean {
        val identity = getIdentityById(identityId) ?: return false
        val currentParty = rpcOps.nodeInfo().legalIdentities.first()
        return identity.hasAccess(currentParty, dataType)
    }

    /**
     * Get active access permissions for an identity
     */
    fun getActivePermissions(identityId: String): List<DigitalIdentityState.AccessPermission> {
        val identity = getIdentityById(identityId) ?: return emptyList()
        val currentParty = rpcOps.nodeInfo().legalIdentities.first()
        return identity.getActivePermissions(currentParty)
    }

    /**
     * Get network information
     */
    fun getNetworkInfo(): NetworkInfo {
        val nodeInfo = rpcOps.nodeInfo()
        val networkMap = rpcOps.networkMapSnapshot()
        
        return NetworkInfo(
            nodeName = nodeInfo.legalIdentities.first().name.toString(),
            nodeAddress = nodeInfo.addresses.first().toString(),
            platformVersion = nodeInfo.platformVersion,
            cordapps = nodeInfo.cordapps.map { it.name },
            networkParticipants = networkMap.map { it.legalIdentities.first().name.toString() }
        )
    }

    /**
     * Get identity statistics
     */
    fun getIdentityStatistics(): IdentityStatistics {
        val allIdentities = rpcOps.vaultQueryBy<DigitalIdentityState>().states.map { it.state.data }
        val myIdentities = getMyIdentities()
        
        return IdentityStatistics(
            totalIdentities = allIdentities.size,
            myIdentities = myIdentities.size,
            verifiedIdentities = myIdentities.count { it.status == DigitalIdentityState.IdentityStatus.VERIFIED },
            pendingIdentities = myIdentities.count { it.status == DigitalIdentityState.IdentityStatus.PENDING },
            revokedIdentities = myIdentities.count { it.status == DigitalIdentityState.IdentityStatus.REVOKED },
            activeAccessPermissions = myIdentities.sumOf { it.accessPermissions.count { perm -> perm.isActive } }
        )
    }
}

/**
 * Network information data class
 */
data class NetworkInfo(
    val nodeName: String,
    val nodeAddress: String,
    val platformVersion: Int,
    val cordapps: List<String>,
    val networkParticipants: List<String>
)

/**
 * Identity statistics data class
 */
data class IdentityStatistics(
    val totalIdentities: Int,
    val myIdentities: Int,
    val verifiedIdentities: Int,
    val pendingIdentities: Int,
    val revokedIdentities: Int,
    val activeAccessPermissions: Int
)