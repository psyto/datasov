import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { DataSovSolana } from "../target/types/datasov_solana";
import {
    PublicKey,
    Keypair,
    SystemProgram,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
    TOKEN_PROGRAM_ID,
    createMint,
    createAccount,
    mintTo,
    getAccount,
} from "@solana/spl-token";
import { expect } from "chai";

describe("datasov-solana", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.DataSovSolana as Program<DataSovSolana>;
    const provider = anchor.getProvider();

    // Test accounts
    let authority: Keypair;
    let dataOwner: Keypair;
    let buyer: Keypair;
    let mint: PublicKey;
    let marketplacePDA: PublicKey;
    let marketplaceBump: number;

    before(async () => {
        // Generate test keypairs
        authority = Keypair.generate();
        dataOwner = Keypair.generate();
        buyer = Keypair.generate();

        // Airdrop SOL for testing
        await provider.connection.requestAirdrop(
            authority.publicKey,
            2 * LAMPORTS_PER_SOL
        );
        await provider.connection.requestAirdrop(
            dataOwner.publicKey,
            2 * LAMPORTS_PER_SOL
        );
        await provider.connection.requestAirdrop(
            buyer.publicKey,
            2 * LAMPORTS_PER_SOL
        );

        // Wait for airdrops to confirm
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Derive marketplace PDA
        [marketplacePDA, marketplaceBump] = PublicKey.findProgramAddressSync(
            [Buffer.from("marketplace")],
            program.programId
        );

        // Create a test token mint
        mint = await createMint(
            provider.connection,
            authority,
            authority.publicKey,
            null,
            9
        );
    });

    it("Initializes marketplace", async () => {
        const feeBasisPoints = 250; // 2.5%

        const tx = await program.methods
            .initializeMarketplace(feeBasisPoints)
            .accounts({
                marketplace: marketplacePDA,
                authority: authority.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([authority])
            .rpc();

        console.log("Initialize marketplace transaction signature", tx);

        // Fetch the marketplace account
        const marketplace = await program.account.marketplace.fetch(
            marketplacePDA
        );

        expect(marketplace.authority.toString()).to.equal(
            authority.publicKey.toString()
        );
        expect(marketplace.feeBasisPoints).to.equal(feeBasisPoints);
        expect(marketplace.totalListings.toNumber()).to.equal(0);
        expect(marketplace.totalVolume.toNumber()).to.equal(0);
    });

    it("Creates a data listing", async () => {
        const listingId = new anchor.BN(1);
        const price = new anchor.BN(0.1 * LAMPORTS_PER_SOL);
        const dataType = { locationHistory: {} };
        const description = "Test location data";

        const [listingPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("listing"), listingId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        const tx = await program.methods
            .createDataListing(listingId, price, dataType, description)
            .accounts({
                listing: listingPDA,
                marketplace: marketplacePDA,
                owner: dataOwner.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([dataOwner])
            .rpc();

        console.log("Create listing transaction signature", tx);

        // Fetch the listing account
        const listing = await program.account.dataListing.fetch(listingPDA);

        expect(listing.id.toString()).to.equal(listingId.toString());
        expect(listing.owner.toString()).to.equal(
            dataOwner.publicKey.toString()
        );
        expect(listing.price.toString()).to.equal(price.toString());
        expect(listing.isActive).to.be.true;
        expect(listing.description).to.equal(description);

        // Check marketplace was updated
        const marketplace = await program.account.marketplace.fetch(
            marketplacePDA
        );
        expect(marketplace.totalListings.toNumber()).to.equal(1);
    });

    it("Updates listing price", async () => {
        const listingId = new anchor.BN(1);
        const newPrice = new anchor.BN(0.15 * LAMPORTS_PER_SOL);

        const [listingPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("listing"), listingId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        const tx = await program.methods
            .updateListingPrice(newPrice)
            .accounts({
                listing: listingPDA,
                owner: dataOwner.publicKey,
            })
            .signers([dataOwner])
            .rpc();

        console.log("Update price transaction signature", tx);

        // Fetch the updated listing
        const listing = await program.account.dataListing.fetch(listingPDA);
        expect(listing.price.toString()).to.equal(newPrice.toString());
    });

    it("Purchases data", async () => {
        const listingId = new anchor.BN(1);

        const [listingPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("listing"), listingId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        // Create token accounts
        const buyerTokenAccount = await createAccount(
            provider.connection,
            buyer,
            mint,
            buyer.publicKey
        );

        const ownerTokenAccount = await createAccount(
            provider.connection,
            dataOwner,
            mint,
            dataOwner.publicKey
        );

        const marketplaceTokenAccount = await createAccount(
            provider.connection,
            authority,
            mint,
            marketplacePDA
        );

        // Mint tokens to buyer
        await mintTo(
            provider.connection,
            authority,
            mint,
            buyerTokenAccount,
            authority,
            1 * LAMPORTS_PER_SOL
        );

        // Get listing to know the price
        const listing = await program.account.dataListing.fetch(listingPDA);
        const purchasePrice = listing.price.toNumber();

        const tx = await program.methods
            .purchaseData(listingId)
            .accounts({
                listing: listingPDA,
                marketplace: marketplacePDA,
                buyer: buyer.publicKey,
                buyerTokenAccount: buyerTokenAccount,
                ownerTokenAccount: ownerTokenAccount,
                marketplaceTokenAccount: marketplaceTokenAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([buyer])
            .rpc();

        console.log("Purchase data transaction signature", tx);

        // Verify listing was updated
        const updatedListing = await program.account.dataListing.fetch(
            listingPDA
        );
        expect(updatedListing.isActive).to.be.false;
        expect(updatedListing.buyer?.toString()).to.equal(
            buyer.publicKey.toString()
        );
        expect(updatedListing.soldAt).to.not.be.null;

        // Verify marketplace volume was updated
        const marketplace = await program.account.marketplace.fetch(
            marketplacePDA
        );
        expect(marketplace.totalVolume.toNumber()).to.equal(purchasePrice);
    });

    it("Cancels a listing", async () => {
        const listingId = new anchor.BN(2);
        const price = new anchor.BN(0.2 * LAMPORTS_PER_SOL);
        const dataType = { appUsage: {} };
        const description = "Test app usage data";

        const [listingPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("listing"), listingId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        // Create the listing first
        await program.methods
            .createDataListing(listingId, price, dataType, description)
            .accounts({
                listing: listingPDA,
                marketplace: marketplacePDA,
                owner: dataOwner.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([dataOwner])
            .rpc();

        // Cancel the listing
        const tx = await program.methods
            .cancelListing()
            .accounts({
                listing: listingPDA,
                owner: dataOwner.publicKey,
            })
            .signers([dataOwner])
            .rpc();

        console.log("Cancel listing transaction signature", tx);

        // Verify listing was cancelled
        const listing = await program.account.dataListing.fetch(listingPDA);
        expect(listing.isActive).to.be.false;
        expect(listing.cancelledAt).to.not.be.null;
    });

    it("Withdraws marketplace fees", async () => {
        const withdrawAmount = new anchor.BN(1000); // 1000 lamports

        const marketplaceTokenAccount = await createAccount(
            provider.connection,
            authority,
            mint,
            marketplacePDA
        );

        const authorityTokenAccount = await createAccount(
            provider.connection,
            authority,
            mint,
            authority.publicKey
        );

        // Mint some tokens to marketplace for fees
        await mintTo(
            provider.connection,
            authority,
            mint,
            marketplaceTokenAccount,
            authority,
            10000 // 10000 lamports
        );

        const tx = await program.methods
            .withdrawFees(withdrawAmount)
            .accounts({
                marketplace: marketplacePDA,
                authority: authority.publicKey,
                marketplaceTokenAccount: marketplaceTokenAccount,
                authorityTokenAccount: authorityTokenAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([authority])
            .rpc();

        console.log("Withdraw fees transaction signature", tx);

        // Verify tokens were transferred
        const authorityAccount = await getAccount(
            provider.connection,
            authorityTokenAccount
        );
        expect(authorityAccount.amount.toString()).to.equal(
            withdrawAmount.toString()
        );
    });

    it("Handles unauthorized access", async () => {
        const listingId = new anchor.BN(1);
        const newPrice = new anchor.BN(0.2 * LAMPORTS_PER_SOL);

        const [listingPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("listing"), listingId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        // Try to update price with wrong owner
        try {
            await program.methods
                .updateListingPrice(newPrice)
                .accounts({
                    listing: listingPDA,
                    owner: buyer.publicKey, // Wrong owner
                })
                .signers([buyer])
                .rpc();

            expect.fail("Should have thrown an error");
        } catch (error) {
            expect(error.message).to.include("Unauthorized");
        }
    });

    it("Handles inactive listing purchase", async () => {
        const listingId = new anchor.BN(1); // This listing was already sold

        const [listingPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("listing"), listingId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        // Create token accounts
        const buyerTokenAccount = await createAccount(
            provider.connection,
            buyer,
            mint,
            buyer.publicKey
        );

        const ownerTokenAccount = await createAccount(
            provider.connection,
            dataOwner,
            mint,
            dataOwner.publicKey
        );

        const marketplaceTokenAccount = await createAccount(
            provider.connection,
            authority,
            mint,
            marketplacePDA
        );

        // Try to purchase inactive listing
        try {
            await program.methods
                .purchaseData(listingId)
                .accounts({
                    listing: listingPDA,
                    marketplace: marketplacePDA,
                    buyer: buyer.publicKey,
                    buyerTokenAccount: buyerTokenAccount,
                    ownerTokenAccount: ownerTokenAccount,
                    marketplaceTokenAccount: marketplaceTokenAccount,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .signers([buyer])
                .rpc();

            expect.fail("Should have thrown an error");
        } catch (error) {
            expect(error.message).to.include("ListingNotActive");
        }
    });
});
