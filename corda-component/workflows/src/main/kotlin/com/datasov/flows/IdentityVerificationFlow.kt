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
 * Flow for verifying a digital identity
 * 
 * This flow allows identity providers to verify a pending digital identity.
 * Only identity providers can initiate this flow.
 */
@InitiatingFlow
@StartableByRPC
class IdentityVerificationFlow(
    private val identityId: String,
    private val verificationLevel: DigitalIdentityState.VerificationLevel,
    private val verificationMethod: DigitalIdentityState.VerificationMethod
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
        object GENERATING_TRANSACTION : ProgressTracker.Step("Generating transaction for identity verification.")
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
        
        val identityProvider = ourIdentity
        
        // Query for the identity state
        val identityStateAndRef = serviceHub.vaultService.queryBy(DigitalIdentityState::class.java)
            .states
            .find { it.state.data.identityId == identityId }
            ?: throw FlowException("Identity with ID $identityId not found or not accessible")
        
        val currentState = identityStateAndRef.state.data
        
        // Verify that the current party is the identity provider
        if (currentState.identityProvider != identityProvider) {
            throw FlowException("Only the identity provider can verify this identity")
        }
        
        // Verify that the identity is in PENDING status
        if (currentState.status != DigitalIdentityState.IdentityStatus.PENDING) {
            throw FlowException("Identity must be in PENDING status to be verified")
        }

        // Step 2: Generate the transaction
        progressTracker.currentStep = GENERATING_TRANSACTION
        
        val notary = identityStateAndRef.state.notary
        
        // Create the verified identity state
        val verifiedIdentityState = currentState.withVerifiedStatus(
            verificationLevel = verificationLevel,
            verificationMethod = verificationMethod
        )

        // Create the command
        val command = Command(
            DigitalIdentityContract.Commands.Verify(),
            listOf(identityProvider.owningKey)
        )

        // Build the transaction
        val txBuilder = TransactionBuilder(notary)
            .addInputState(identityStateAndRef)
            .addOutputState(verifiedIdentityState, DigitalIdentityContract.ID)
            .addCommand(command)

        // Step 3: Verify the transaction
        progressTracker.currentStep = VERIFYING_TRANSACTION
        txBuilder.verify(serviceHub)

        // Step 4: Sign the transaction
        progressTracker.currentStep = SIGNING_TRANSACTION
        val partiallySignedTx = serviceHub.signInitialTransaction(txBuilder)

        // Step 5: Gather signatures (only identity provider needs to sign)
        progressTracker.currentStep = GATHERING_SIGNATURES
        val fullySignedTx = partiallySignedTx // No additional signatures needed

        // Step 6: Finalize the transaction
        progressTracker.currentStep = FINALISING_TRANSACTION
        return subFlow(FinalityFlow(fullySignedTx))
    }
}

/**
 * Flow for updating a verified digital identity
 * 
 * This flow allows identity owners to update their verified identity information.
 */
@InitiatingFlow
@StartableByRPC
class IdentityUpdateFlow(
    private val identityId: String,
    private val updatedPersonalInfo: DigitalIdentityState.PersonalInfo,
    private val updatedMetadata: Map<String, String> = emptyMap()
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
        object GENERATING_TRANSACTION : ProgressTracker.Step("Generating transaction for identity update.")
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
        
        val owner = ourIdentity
        
        // Query for the identity state
        val identityStateAndRef = serviceHub.vaultService.queryBy(DigitalIdentityState::class.java)
            .states
            .find { it.state.data.identityId == identityId }
            ?: throw FlowException("Identity with ID $identityId not found or not accessible")
        
        val currentState = identityStateAndRef.state.data
        
        // Verify that the current party is the identity owner
        if (currentState.owner != owner) {
            throw FlowException("Only the identity owner can update this identity")
        }
        
        // Verify that the identity can be updated
        if (!currentState.canBeUpdated()) {
            throw FlowException("Identity must be verified to be updated")
        }

        // Step 2: Generate the transaction
        progressTracker.currentStep = GENERATING_TRANSACTION
        
        val notary = identityStateAndRef.state.notary
        
        // Create the updated identity state
        val updatedIdentityState = currentState.copy(
            personalInfo = updatedPersonalInfo,
            metadata = updatedMetadata,
            updatedAt = Instant.now()
        )

        // Create the command
        val command = Command(
            DigitalIdentityContract.Commands.Update(),
            listOf(owner.owningKey, currentState.identityProvider.owningKey)
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
        val partiallySignedTx = serviceHub.signInitialTransaction(txBuilder)

        // Step 5: Gather signatures
        progressTracker.currentStep = GATHERING_SIGNATURES
        val identityProviderSession = initiateFlow(currentState.identityProvider)
        val fullySignedTx = subFlow(
            CollectSignaturesFlow(
                partiallySignedTx,
                listOf(identityProviderSession),
                GATHERING_SIGNATURES.childProgressTracker()
            )
        )

        // Step 6: Finalize the transaction
        progressTracker.currentStep = FINALISING_TRANSACTION
        return subFlow(
            FinalityFlow(
                fullySignedTx,
                listOf(identityProviderSession),
                FINALISING_TRANSACTION.childProgressTracker()
            )
        )
    }
}

/**
 * Responder flow for identity update
 */
@InitiatedBy(IdentityUpdateFlow::class)
class IdentityUpdateFlowResponder(private val otherPartySession: FlowSession) : FlowLogic<SignedTransaction>() {
    @Suspendable
    override fun call(): SignedTransaction {
        val signTransactionFlow = object : SignTransactionFlow(otherPartySession) {
            override fun checkTransaction(stx: SignedTransaction) {
                // Additional validation can be added here
                // For example, checking if the updated information meets certain criteria
            }
        }

        val txId = subFlow(signTransactionFlow).id
        return subFlow(ReceiveFinalityFlow(otherPartySession, expectedTxId = txId))
    }
}
