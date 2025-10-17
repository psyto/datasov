package com.datasov.flows

import co.paralleluniverse.fibers.Suspendable
import com.datasov.contracts.DigitalIdentityContract
import com.datasov.states.DigitalIdentityState
import net.corda.core.contracts.Command
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.flows.*
import net.corda.core.identity.Party
import net.corda.core.transactions.SignedTransaction
import net.corda.core.transactions.TransactionBuilder
import net.corda.core.utilities.ProgressTracker
import java.time.Instant

/**
 * Flow for registering a new digital identity
 * 
 * This flow allows users to register their digital identity with an identity provider.
 * The identity starts in PENDING status and requires verification.
 */
@InitiatingFlow
@StartableByRPC
class IdentityRegistrationFlow(
    private val identityId: String,
    private val identityType: DigitalIdentityState.IdentityType,
    private val personalInfo: DigitalIdentityState.PersonalInfo,
    private val identityProvider: Party,
    private val metadata: Map<String, String> = emptyMap()
) : FlowLogic<SignedTransaction>() {

    override val progressTracker = ProgressTracker(
        GENERATING_TRANSACTION,
        VERIFYING_TRANSACTION,
        SIGNING_TRANSACTION,
        GATHERING_SIGNATURES,
        FINALISING_TRANSACTION
    )

    companion object {
        object GENERATING_TRANSACTION : ProgressTracker.Step("Generating transaction for identity registration.")
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
        // Step 1: Generate the transaction
        progressTracker.currentStep = GENERATING_TRANSACTION
        
        val notary = serviceHub.networkMapCache.notaryIdentities.first()
        val owner = ourIdentity
        
        // Create the digital identity state
        val digitalIdentityState = DigitalIdentityState(
            identityId = identityId,
            owner = owner,
            identityProvider = identityProvider,
            identityType = identityType,
            status = DigitalIdentityState.IdentityStatus.PENDING,
            verificationLevel = DigitalIdentityState.VerificationLevel.NONE,
            personalInfo = personalInfo,
            accessPermissions = emptyList(),
            createdAt = Instant.now(),
            verifiedAt = null,
            updatedAt = null,
            revokedAt = null,
            revocationReason = null,
            verificationMethod = null,
            metadata = metadata
        )

        // Create the command
        val command = Command(
            DigitalIdentityContract.Commands.Register(),
            listOf(owner.owningKey, identityProvider.owningKey)
        )

        // Build the transaction
        val txBuilder = TransactionBuilder(notary)
            .addOutputState(digitalIdentityState, DigitalIdentityContract.ID)
            .addCommand(command)

        // Step 2: Verify the transaction
        progressTracker.currentStep = VERIFYING_TRANSACTION
        txBuilder.verify(serviceHub)

        // Step 3: Sign the transaction
        progressTracker.currentStep = SIGNING_TRANSACTION
        val partiallySignedTx = serviceHub.signInitialTransaction(txBuilder)

        // Step 4: Gather signatures
        progressTracker.currentStep = GATHERING_SIGNATURES
        val otherPartySession = initiateFlow(identityProvider)
        val fullySignedTx = subFlow(
            CollectSignaturesFlow(
                partiallySignedTx,
                listOf(otherPartySession),
                GATHERING_SIGNATURES.childProgressTracker()
            )
        )

        // Step 5: Finalize the transaction
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
 * Responder flow for identity registration
 */
@InitiatedBy(IdentityRegistrationFlow::class)
class IdentityRegistrationFlowResponder(private val otherPartySession: FlowSession) : FlowLogic<SignedTransaction>() {
    @Suspendable
    override fun call(): SignedTransaction {
        val signTransactionFlow = object : SignTransactionFlow(otherPartySession) {
            override fun checkTransaction(stx: SignedTransaction) {
                // Additional validation can be added here
                // For example, checking if the identity provider has the right to register identities
                // or validating the personal information format
            }
        }

        val txId = subFlow(signTransactionFlow).id
        return subFlow(ReceiveFinalityFlow(otherPartySession, expectedTxId = txId))
    }
}
