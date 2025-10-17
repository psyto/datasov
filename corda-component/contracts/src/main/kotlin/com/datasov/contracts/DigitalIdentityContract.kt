package com.datasov.contracts

import com.datasov.states.DigitalIdentityState
import net.corda.core.contracts.*
import net.corda.core.transactions.LedgerTransaction
import java.security.PublicKey

/**
 * Digital Identity Contract for DataSov
 * 
 * This contract defines the rules for managing digital identities (DIDs) on Corda.
 * It ensures secure identity registration, verification, and access control.
 */
class DigitalIdentityContract : Contract {
    companion object {
        const val ID = "com.datasov.contracts.DigitalIdentityContract"
    }

    interface Commands : CommandData {
        class Register : Commands
        class Verify : Commands
        class Update : Commands
        class Revoke : Commands
        class GrantAccess : Commands
        class RevokeAccess : Commands
    }

    override fun verify(tx: LedgerTransaction) {
        val command = tx.commands.requireSingleCommand<Commands>()
        val setOfSigners = command.signers.toSet()

        when (command.value) {
            is Commands.Register -> verifyRegister(tx, setOfSigners)
            is Commands.Verify -> verifyVerify(tx, setOfSigners)
            is Commands.Update -> verifyUpdate(tx, setOfSigners)
            is Commands.Revoke -> verifyRevoke(tx, setOfSigners)
            is Commands.GrantAccess -> verifyGrantAccess(tx, setOfSigners)
            is Commands.RevokeAccess -> verifyRevokeAccess(tx, setOfSigners)
            else -> throw IllegalArgumentException("Unrecognised command.")
        }
    }

    private fun verifyRegister(tx: LedgerTransaction, signers: Set<PublicKey>) {
        requireThat {
            "No inputs should be consumed when registering a new identity." using (tx.inputs.isEmpty())
            "Only one output should be created when registering a new identity." using (tx.outputs.size == 1)
            
            val output = tx.outputsOfType<DigitalIdentityState>().single()
            "The identity provider must sign the transaction." using (signers.contains(output.identityProvider.owningKey))
            "The identity owner must sign the transaction." using (signers.contains(output.owner.owningKey))
            
            "Identity ID must not be empty." using (output.identityId.isNotBlank())
            "Identity type must be specified." using (output.identityType != null)
            "Identity status must be PENDING for new registrations." using (output.status == DigitalIdentityState.IdentityStatus.PENDING)
            "Created timestamp must be set." using (output.createdAt != null)
            "Verification level must be NONE for new registrations." using (output.verificationLevel == DigitalIdentityState.VerificationLevel.NONE)
        }
    }

    private fun verifyVerify(tx: LedgerTransaction, signers: Set<PublicKey>) {
        requireThat {
            "Exactly one input should be consumed when verifying an identity." using (tx.inputs.size == 1)
            "Exactly one output should be created when verifying an identity." using (tx.outputs.size == 1)
            
            val input = tx.inputsOfType<DigitalIdentityState>().single()
            val output = tx.outputsOfType<DigitalIdentityState>().single()
            
            "The identity provider must sign the transaction." using (signers.contains(input.identityProvider.owningKey))
            "Only the identity provider can verify identities." using (signers.contains(output.identityProvider.owningKey))
            
            "Identity ID must remain the same." using (input.identityId == output.identityId)
            "Owner must remain the same." using (input.owner == output.owner)
            "Identity provider must remain the same." using (input.identityProvider == output.identityProvider)
            
            "Status must change to VERIFIED." using (output.status == DigitalIdentityState.IdentityStatus.VERIFIED)
            "Verification level must be set." using (output.verificationLevel != DigitalIdentityState.VerificationLevel.NONE)
            "Verification timestamp must be set." using (output.verifiedAt != null)
            "Verification method must be specified." using (output.verificationMethod != null)
        }
    }

    private fun verifyUpdate(tx: LedgerTransaction, signers: Set<PublicKey>) {
        requireThat {
            "Exactly one input should be consumed when updating an identity." using (tx.inputs.size == 1)
            "Exactly one output should be created when updating an identity." using (tx.outputs.size == 1)
            
            val input = tx.inputsOfType<DigitalIdentityState>().single()
            val output = tx.outputsOfType<DigitalIdentityState>().single()
            
            "The identity owner must sign the transaction." using (signers.contains(input.owner.owningKey))
            "The identity provider must sign the transaction." using (signers.contains(input.identityProvider.owningKey))
            
            "Identity ID must remain the same." using (input.identityId == output.identityId)
            "Owner must remain the same." using (input.owner == output.owner)
            "Identity provider must remain the same." using (input.identityProvider == output.identityProvider)
            
            "Only VERIFIED identities can be updated." using (input.status == DigitalIdentityState.IdentityStatus.VERIFIED)
            "Status must remain VERIFIED after update." using (output.status == DigitalIdentityState.IdentityStatus.VERIFIED)
            "Updated timestamp must be set." using (output.updatedAt != null)
        }
    }

    private fun verifyRevoke(tx: LedgerTransaction, signers: Set<PublicKey>) {
        requireThat {
            "Exactly one input should be consumed when revoking an identity." using (tx.inputs.size == 1)
            "Exactly one output should be created when revoking an identity." using (tx.outputs.size == 1)
            
            val input = tx.inputsOfType<DigitalIdentityState>().single()
            val output = tx.outputsOfType<DigitalIdentityState>().single()
            
            "The identity provider must sign the transaction." using (signers.contains(input.identityProvider.owningKey))
            "The identity owner must sign the transaction." using (signers.contains(input.owner.owningKey))
            
            "Identity ID must remain the same." using (input.identityId == output.identityId)
            "Owner must remain the same." using (input.owner == output.owner)
            "Identity provider must remain the same." using (input.identityProvider == output.identityProvider)
            
            "Status must change to REVOKED." using (output.status == DigitalIdentityState.IdentityStatus.REVOKED)
            "Revocation timestamp must be set." using (output.revokedAt != null)
            "Revocation reason must be specified." using (output.revocationReason != null)
        }
    }

    private fun verifyGrantAccess(tx: LedgerTransaction, signers: Set<PublicKey>) {
        requireThat {
            "Exactly one input should be consumed when granting access." using (tx.inputs.size == 1)
            "Exactly one output should be created when granting access." using (tx.outputs.size == 1)
            
            val input = tx.inputsOfType<DigitalIdentityState>().single()
            val output = tx.outputsOfType<DigitalIdentityState>().single()
            
            "The identity owner must sign the transaction." using (signers.contains(input.owner.owningKey))
            
            "Identity ID must remain the same." using (input.identityId == output.identityId)
            "Owner must remain the same." using (input.owner == output.owner)
            "Identity provider must remain the same." using (input.identityProvider == output.identityProvider)
            
            "Only VERIFIED identities can grant access." using (input.status == DigitalIdentityState.IdentityStatus.VERIFIED)
            "Status must remain VERIFIED after granting access." using (output.status == DigitalIdentityState.IdentityStatus.VERIFIED)
            
            "Access permissions must be added." using (output.accessPermissions.size > input.accessPermissions.size)
            "Updated timestamp must be set." using (output.updatedAt != null)
        }
    }

    private fun verifyRevokeAccess(tx: LedgerTransaction, signers: Set<PublicKey>) {
        requireThat {
            "Exactly one input should be consumed when revoking access." using (tx.inputs.size == 1)
            "Exactly one output should be created when revoking access." using (tx.outputs.size == 1)
            
            val input = tx.inputsOfType<DigitalIdentityState>().single()
            val output = tx.outputsOfType<DigitalIdentityState>().single()
            
            "The identity owner must sign the transaction." using (signers.contains(input.owner.owningKey))
            
            "Identity ID must remain the same." using (input.identityId == output.identityId)
            "Owner must remain the same." using (input.owner == output.owner)
            "Identity provider must remain the same." using (input.identityProvider == output.identityProvider)
            
            "Only VERIFIED identities can revoke access." using (input.status == DigitalIdentityState.IdentityStatus.VERIFIED)
            "Status must remain VERIFIED after revoking access." using (output.status == DigitalIdentityState.IdentityStatus.VERIFIED)
            
            "Access permissions must be removed." using (output.accessPermissions.size < input.accessPermissions.size)
            "Updated timestamp must be set." using (output.updatedAt != null)
        }
    }
}
