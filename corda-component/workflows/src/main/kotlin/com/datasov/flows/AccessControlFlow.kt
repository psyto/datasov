package com.datasov.flows

import co.paralleluniverse.fibers.Suspendable
import com.datasov.contracts.DigitalIdentityContract
import com.datasov.states.DigitalIdentityState
import net.corda.core.contracts.Command
import net.corda.core.flows.*
import net.corda.core.identity.Party
import net.corda.core.transactions.SignedTransaction
import net.corda.core.transactions.TransactionBuilder
import net.corda.core.utilities.ProgressTracker
import java.time.Instant

/**
 * Flow for granting access permissions to data consumers
 * 
 * This flow allows identity owners to grant specific access permissions
 * to data consumers for their personal data.
 */
@InitiatingFlow
@StartableByRPC
class GrantAccessFlow(
    private val identityId: String,
    private val consumer: Party,
    private val permissionType: DigitalIdentityState.PermissionType,
    private val dataTypes: List<DigitalIdentityState.DataType>,
    private val expiresAt: Instant? = null
) : FlowLogic<SignedTransaction>() {

    override val progressTracker = ProgressTracker(
        RETRIEVING_IDENTITY,
        GENERATING_TRANSACTION,
        VERIFYING_TRANSACTION,
        SIGNING_TRANSACTION,
        FINALISING_TRANSACTION
    )

    companion object {
        object RETRIEVING_IDENTITY : ProgressTracker.Step("Retrieving identity state from vault.")
        object GENERATING_TRANSACTION : ProgressTracker.Step("Generating transaction for access grant.")
        object VERIFYING_TRANSACTION : ProgressTracker.Step("Verifying transaction.")
        object SIGNING_TRANSACTION : ProgressTracker.Step("Signing transaction with our private key.")
        object FINALISING_TRANSACTION : ProgressTracker.Step("Obtaining notary signature and recording transaction.") {
            override fun childProgressTracker() = FinalityFlow.tracker()
        }
    }

    @Suspendable
    override fun call(): SignedTransaction {
        // Step 1: Retrieve the identity state
        progressTracker.currentStep = RETRIEVING_IDENTITY
        
        val owner = ourIdentity
        
        // Query for the identity state
        val identityStateAndRef = serviceHub.vaultService.queryBy(DigitalIdentityState::class.java)
            .states
            .find { it.state.data.identityId == identityId }
            ?: throw FlowException("Identity with ID $identityId not found or not accessible")
        
        val currentState = identityStateAndRef.state.data
        
        // Verify that the current party is the identity owner
        if (currentState.owner != owner) {
            throw FlowException("Only the identity owner can grant access")
        }
        
        // Verify that the identity is active
        if (!currentState.isActive()) {
            throw FlowException("Identity must be verified to grant access")
        }

        // Step 2: Generate the transaction
        progressTracker.currentStep = GENERATING_TRANSACTION
        
        val notary = identityStateAndRef.state.notary
        
        // Create the new access permission
        val newPermission = DigitalIdentityState.AccessPermission(
            consumer = consumer,
            permissionType = permissionType,
            dataTypes = dataTypes,
            grantedAt = Instant.now(),
            expiresAt = expiresAt,
            isActive = true,
            grantedBy = owner
        )
        
        // Create the updated identity state with new permission
        val updatedIdentityState = currentState.withNewAccessPermission(newPermission)

        // Create the command
        val command = Command(
            DigitalIdentityContract.Commands.GrantAccess(),
            listOf(owner.owningKey)
        )

        // Build the transaction
        val txBuilder = TransactionBuilder(notary)
            .addInputState(identityStateAndRef)
            .addOutputState(updatedIdentityState, DigitalIdentityContract.ID)
            .addCommand(command)

        // Step 3: Verify the transaction
        progressTracker.currentStep = VERIFYING_TRANSACTION
        txBuilder.verify(serviceHub)

        // Step 4: Sign the transaction
        progressTracker.currentStep = SIGNING_TRANSACTION
        val fullySignedTx = serviceHub.signInitialTransaction(txBuilder)

        // Step 5: Finalize the transaction
        progressTracker.currentStep = FINALISING_TRANSACTION
        return subFlow(FinalityFlow(fullySignedTx))
    }
}

/**
 * Flow for revoking access permissions from data consumers
 * 
 * This flow allows identity owners to revoke specific access permissions
 * that were previously granted to data consumers.
 */
@InitiatingFlow
@StartableByRPC
class RevokeAccessFlow(
    private val identityId: String,
    private val consumer: Party,
    private val dataType: DigitalIdentityState.DataType
) : FlowLogic<SignedTransaction>() {

    override val progressTracker = ProgressTracker(
        RETRIEVING_IDENTITY,
        GENERATING_TRANSACTION,
        VERIFYING_TRANSACTION,
        SIGNING_TRANSACTION,
        FINALISING_TRANSACTION
    )

    companion object {
        object RETRIEVING_IDENTITY : ProgressTracker.Step("Retrieving identity state from vault.")
        object GENERATING_TRANSACTION : ProgressTracker.Step("Generating transaction for access revocation.")
        object VERIFYING_TRANSACTION : ProgressTracker.Step("Verifying transaction.")
        object SIGNING_TRANSACTION : ProgressTracker.Step("Signing transaction with our private key.")
        object FINALISING_TRANSACTION : ProgressTracker.Step("Obtaining notary signature and recording transaction.") {
            override fun childProgressTracker() = FinalityFlow.tracker()
        }
    }

    @Suspendable
    override fun call(): SignedTransaction {
        // Step 1: Retrieve the identity state
        progressTracker.currentStep = RETRIEVING_IDENTITY
        
        val owner = ourIdentity
        
        // Query for the identity state
        val identityStateAndRef = serviceHub.vaultService.queryBy(DigitalIdentityState::class.java)
            .states
            .find { it.state.data.identityId == identityId }
            ?: throw FlowException("Identity with ID $identityId not found or not accessible")
        
        val currentState = identityStateAndRef.state.data
        
        // Verify that the current party is the identity owner
        if (currentState.owner != owner) {
            throw FlowException("Only the identity owner can revoke access")
        }
        
        // Verify that the identity is active
        if (!currentState.isActive()) {
            throw FlowException("Identity must be verified to revoke access")
        }
        
        // Verify that the consumer has access to the specified data type
        if (!currentState.hasAccess(consumer, dataType)) {
            throw FlowException("Consumer does not have access to the specified data type")
        }

        // Step 2: Generate the transaction
        progressTracker.currentStep = GENERATING_TRANSACTION
        
        val notary = identityStateAndRef.state.notary
        
        // Create the updated identity state with removed permission
        val updatedIdentityState = currentState.withRemovedAccessPermission(consumer, dataType)

        // Create the command
        val command = Command(
            DigitalIdentityContract.Commands.RevokeAccess(),
            listOf(owner.owningKey)
        )

        // Build the transaction
        val txBuilder = TransactionBuilder(notary)
            .addInputState(identityStateAndRef)
            .addOutputState(updatedIdentityState, DigitalIdentityContract.ID)
            .addCommand(command)

        // Step 3: Verify the transaction
        progressTracker.currentStep = VERIFYING_TRANSACTION
        txBuilder.verify(serviceHub)

        // Step 4: Sign the transaction
        progressTracker.currentStep = SIGNING_TRANSACTION
        val fullySignedTx = serviceHub.signInitialTransaction(txBuilder)

        // Step 5: Finalize the transaction
        progressTracker.currentStep = FINALISING_TRANSACTION
        return subFlow(FinalityFlow(fullySignedTx))
    }
}

/**
 * Flow for revoking a digital identity
 * 
 * This flow allows identity providers or owners to revoke a digital identity.
 */
@InitiatingFlow
@StartableByRPC
class RevokeIdentityFlow(
    private val identityId: String,
    private val revocationReason: String
) : FlowLogic<SignedTransaction>() {

    override val progressTracker = ProgressTracker(
        RETRIEVING_IDENTITY,
        GENERATING_TRANSACTION,
        VERIFYING_TRANSACTION,
        SIGNING_TRANSACTION,
        GATHERING_SIGNATURES,
        FINALISING_TRANSACTION
    )

    companion object {
        object RETRIEVING_IDENTITY : ProgressTracker.Step("Retrieving identity state from vault.")
        object GENERATING_TRANSACTION : ProgressTracker.Step("Generating transaction for identity revocation.")
        object VERIFYING_TRANSACTION : ProgressTracker.Step("Verifying transaction.")
        object SIGNING_TRANSACTION : ProgressTracker.Step("Signing transaction with our private key.")
        object GATHERING_SIGNATURES : ProgressTracker.Step("Gathering the counterparty's signature.") {
            override fun childProgressTracker() = CollectSignaturesFlow.tracker()
        }
        object FINALISING_TRANSACTION : ProgressTracker.Step("Obtaining notary signature and recording transaction.") {
            override fun childProgressTracker() = FinalityFlow.tracker()
        }
    }

    @Suspendable
    override fun call(): SignedTransaction {
        // Step 1: Retrieve the identity state
        progressTracker.currentStep = RETRIEVING_IDENTITY
        
        val currentParty = ourIdentity
        
        // Query for the identity state
        val identityStateAndRef = serviceHub.vaultService.queryBy(DigitalIdentityState::class.java)
            .states
            .find { it.state.data.identityId == identityId }
            ?: throw FlowException("Identity with ID $identityId not found or not accessible")
        
        val currentState = identityStateAndRef.state.data
        
        // Verify that the current party is either the identity owner or provider
        if (currentState.owner != currentParty && currentState.identityProvider != currentParty) {
            throw FlowException("Only the identity owner or provider can revoke this identity")
        }
        
        // Verify that the identity can be revoked
        if (!currentState.canBeRevoked()) {
            throw FlowException("Identity cannot be revoked in its current status")
        }

        // Step 2: Generate the transaction
        progressTracker.currentStep = GENERATING_TRANSACTION
        
        val notary = identityStateAndRef.state.notary
        
        // Create the revoked identity state
        val revokedIdentityState = currentState.withRevokedStatus(revocationReason)

        // Create the command
        val command = Command(
            DigitalIdentityContract.Commands.Revoke(),
            listOf(currentState.owner.owningKey, currentState.identityProvider.owningKey)
        )

        // Build the transaction
        val txBuilder = TransactionBuilder(notary)
            .addInputState(identityStateAndRef)
            .addOutputState(revokedIdentityState, DigitalIdentityContract.ID)
            .addCommand(command)

        // Step 3: Verify the transaction
        progressTracker.currentStep = VERIFYING_TRANSACTION
        txBuilder.verify(serviceHub)

        // Step 4: Sign the transaction
        progressTracker.currentStep = SIGNING_TRANSACTION
        val partiallySignedTx = serviceHub.signInitialTransaction(txBuilder)

        // Step 5: Gather signatures
        progressTracker.currentStep = GATHERING_SIGNATURES
        val otherParty = if (currentParty == currentState.owner) currentState.identityProvider else currentState.owner
        val otherPartySession = initiateFlow(otherParty)
        val fullySignedTx = subFlow(
            CollectSignaturesFlow(
                partiallySignedTx,
                listOf(otherPartySession),
                GATHERING_SIGNATURES.childProgressTracker()
            )
        )

        // Step 6: Finalize the transaction
        progressTracker.currentStep = FINALISING_TRANSACTION
        return subFlow(
            FinalityFlow(
                fullySignedTx,
                listOf(otherPartySession),
                FINALISING_TRANSACTION.childProgressTracker()
            )
        )
    }
}

/**
 * Responder flow for identity revocation
 */
@InitiatedBy(RevokeIdentityFlow::class)
class RevokeIdentityFlowResponder(private val otherPartySession: FlowSession) : FlowLogic<SignedTransaction>() {
    @Suspendable
    override fun call(): SignedTransaction {
        val signTransactionFlow = object : SignTransactionFlow(otherPartySession) {
            override fun checkTransaction(stx: SignedTransaction) {
                // Additional validation can be added here
                // For example, checking if the revocation reason is valid
            }
        }

        val txId = subFlow(signTransactionFlow).id
        return subFlow(ReceiveFinalityFlow(otherPartySession, expectedTxId = txId))
    }
}
