package com.datasov.client

import com.datasov.services.KYCVerificationMethod
import com.datasov.states.DigitalIdentityState
import net.corda.core.identity.Party
import net.corda.core.messaging.CordaRPCOps
import net.corda.core.utilities.NetworkHostAndPort
import net.corda.client.rpc.CordaRPCClient
import java.time.Instant

/**
 * DataSov Corda Client Example
 * 
 * This example demonstrates how to use the DataSov Corda client for
 * digital identity management and data ownership.
 */
fun main(args: Array<String>) {
    // Configuration
    val nodeAddress = NetworkHostAndPort("localhost", 10006) // Identity Provider node
    val username = "user1"
    val password = "test"
    
    // Connect to the Corda node
    val rpcClient = CordaRPCClient(nodeAddress)
    val rpcConnection = rpcClient.start(username, password)
    val rpcOps = rpcConnection.proxy
    
    try {
        // Create DataSov client
        val dataSovClient = DataSovClient(rpcOps)
        
        println("🚀 DataSov Corda Component Example")
        println("====================================")
        
        // Get network information
        val networkInfo = dataSovClient.getNetworkInfo()
        println("Connected to node: ${networkInfo.nodeName}")
        println("Network participants: ${networkInfo.networkParticipants}")
        
        // Example 1: Register a new digital identity
        println("\n📝 Registering new digital identity...")
        
        val identityId = "USER_${System.currentTimeMillis()}"
        val identityType = DigitalIdentityState.IdentityType.NTT_DOCOMO_USER_ID
        
        val personalInfo = DigitalIdentityState.PersonalInfo(
            firstName = "Taro",
            lastName = "Yamada",
            dateOfBirth = "1990-01-01", // Encrypted in real implementation
            nationality = "Japanese",
            address = "Tokyo, Japan", // Encrypted in real implementation
            phoneNumber = "+81-90-1234-5678", // Encrypted in real implementation
            emailAddress = "taro.yamada@example.com", // Encrypted in real implementation
            encryptedData = mapOf(
                "passportNumber" to "encrypted_passport_123",
                "driversLicense" to "encrypted_license_456"
            )
        )
        
        val metadata = mapOf(
            "registrationSource" to "NTT DOCOMO Mobile App",
            "registrationVersion" to "1.0.0",
            "deviceId" to "device_12345"
        )
        
        // For this example, we'll use the same node as both owner and provider
        val identityProvider = rpcOps.nodeInfo().legalIdentities.first()
        
        val registrationTx = dataSovClient.registerIdentity(
            identityId = identityId,
            identityType = identityType,
            personalInfo = personalInfo,
            identityProvider = identityProvider,
            metadata = metadata
        )
        
        println("✅ Identity registered successfully!")
        println("Transaction ID: ${registrationTx.id}")
        
        // Example 2: Verify the identity using KYC
        println("\n🔍 Verifying identity using KYC...")
        
        val verificationTx = dataSovClient.verifyIdentity(
            identityId = identityId,
            verificationMethod = KYCVerificationMethod.DOCUMENT_VERIFICATION
        )
        
        println("✅ Identity verified successfully!")
        println("Transaction ID: ${verificationTx.id}")
        
        // Example 3: Get identity information
        println("\n📋 Getting identity information...")
        
        val identity = dataSovClient.getIdentityById(identityId)
        if (identity != null) {
            println("Identity Details:")
            println("- ID: ${identity.identityId}")
            println("- Owner: ${identity.owner.name}")
            println("- Provider: ${identity.identityProvider.name}")
            println("- Type: ${identity.identityType}")
            println("- Status: ${identity.status}")
            println("- Verification Level: ${identity.verificationLevel}")
            println("- Created: ${identity.createdAt}")
            println("- Verified: ${identity.verifiedAt}")
        }
        
        // Example 4: Grant access to a data consumer
        println("\n🔐 Granting access to data consumer...")
        
        // In a real scenario, you would get the consumer party from the network
        // For this example, we'll use the same node as the consumer
        val dataConsumer = rpcOps.nodeInfo().legalIdentities.first()
        
        val accessTx = dataSovClient.grantAccess(
            identityId = identityId,
            consumer = dataConsumer,
            permissionType = DigitalIdentityState.PermissionType.READ_ONLY,
            dataTypes = listOf(
                DigitalIdentityState.DataType.LOCATION_HISTORY,
                DigitalIdentityState.DataType.APP_USAGE
            ),
            expiresAt = Instant.now().plusSeconds(30 * 24 * 60 * 60) // 30 days
        )
        
        println("✅ Access granted successfully!")
        println("Transaction ID: ${accessTx.id}")
        
        // Example 5: Check access permissions
        println("\n🔍 Checking access permissions...")
        
        val hasLocationAccess = dataSovClient.hasAccess(
            identityId = identityId,
            dataType = DigitalIdentityState.DataType.LOCATION_HISTORY
        )
        
        val hasHealthAccess = dataSovClient.hasAccess(
            identityId = identityId,
            dataType = DigitalIdentityState.DataType.HEALTH_DATA
        )
        
        println("Has location data access: $hasLocationAccess")
        println("Has health data access: $hasHealthAccess")
        
        val activePermissions = dataSovClient.getActivePermissions(identityId)
        println("Active permissions count: ${activePermissions.size}")
        
        // Example 6: Update identity information
        println("\n📝 Updating identity information...")
        
        val updatedPersonalInfo = personalInfo.copy(
            address = "Osaka, Japan", // Updated address
            phoneNumber = "+81-90-9876-5432" // Updated phone number
        )
        
        val updatedMetadata = metadata + mapOf(
            "lastUpdated" to Instant.now().toString(),
            "updateReason" to "Address change"
        )
        
        val updateTx = dataSovClient.updateIdentity(
            identityId = identityId,
            updatedPersonalInfo = updatedPersonalInfo,
            updatedMetadata = updatedMetadata
        )
        
        println("✅ Identity updated successfully!")
        println("Transaction ID: ${updateTx.id}")
        
        // Example 7: Get identity statistics
        println("\n📊 Getting identity statistics...")
        
        val statistics = dataSovClient.getIdentityStatistics()
        println("Identity Statistics:")
        println("- Total identities: ${statistics.totalIdentities}")
        println("- My identities: ${statistics.myIdentities}")
        println("- Verified identities: ${statistics.verifiedIdentities}")
        println("- Pending identities: ${statistics.pendingIdentities}")
        println("- Revoked identities: ${statistics.revokedIdentities}")
        println("- Active access permissions: ${statistics.activeAccessPermissions}")
        
        // Example 8: Revoke access
        println("\n❌ Revoking access...")
        
        val revokeAccessTx = dataSovClient.revokeAccess(
            identityId = identityId,
            consumer = dataConsumer,
            dataType = DigitalIdentityState.DataType.LOCATION_HISTORY
        )
        
        println("✅ Access revoked successfully!")
        println("Transaction ID: ${revokeAccessTx.id}")
        
        // Verify access was revoked
        val hasLocationAccessAfterRevoke = dataSovClient.hasAccess(
            identityId = identityId,
            dataType = DigitalIdentityState.DataType.LOCATION_HISTORY
        )
        println("Has location data access after revocation: $hasLocationAccessAfterRevoke")
        
        println("\n🎉 Example completed successfully!")
        
    } catch (e: Exception) {
        println("❌ Error: ${e.message}")
        e.printStackTrace()
    } finally {
        // Close the RPC connection
        rpcConnection.notifyServerAndClose()
    }
}
