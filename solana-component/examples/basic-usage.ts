import {
    Connection,
    Keypair,
    PublicKey,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { DataSovClient, DataType } from "../src/index";

// Example usage of DataSov Solana Component
async function main() {
    // Configuration
    const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
    const PROGRAM_ID = new PublicKey(
        "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
    );

    // Create connection
    const connection = new Connection(RPC_URL, "confirmed");

    // Create keypairs (in production, use proper wallet management)
    const authority = Keypair.generate();
    const dataOwner = Keypair.generate();
    const buyer = Keypair.generate();

    console.log("🚀 DataSov Solana Component Example");
    console.log("=====================================");

    // Airdrop SOL for testing
    console.log("📥 Airdropping SOL for testing...");
    await connection.requestAirdrop(authority.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.requestAirdrop(dataOwner.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.requestAirdrop(buyer.publicKey, 2 * LAMPORTS_PER_SOL);

    // Wait for airdrops to confirm
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Initialize DataSov client
    const datasovClient = new DataSovClient({
        rpcUrl: RPC_URL,
        programId: PROGRAM_ID,
        marketplaceFeeBasisPoints: 250, // 2.5%
    });

    try {
        // 1. Initialize marketplace
        console.log("🏪 Initializing marketplace...");
        const initTx = await datasovClient.initializeMarketplace(
            authority,
            250
        );
        console.log("✅ Marketplace initialized:", initTx);

        // 2. Create a data listing
        console.log("📊 Creating data listing...");
        const listingId = 1;
        const price = 0.1 * LAMPORTS_PER_SOL; // 0.1 SOL

        const createTx = await datasovClient.createDataListing(
            dataOwner,
            listingId,
            price,
            DataType.LocationHistory,
            "Anonymized location data from smartphone usage over 3 months"
        );
        console.log("✅ Data listing created:", createTx);

        // 3. Get marketplace info
        console.log("📈 Getting marketplace information...");
        const marketplace = await datasovClient.getMarketplace();
        if (marketplace) {
            console.log("Marketplace Stats:");
            console.log(
                "- Total Listings:",
                marketplace.totalListings.toString()
            );
            console.log("- Total Volume:", marketplace.totalVolume.toString());
            console.log("- Fee Basis Points:", marketplace.feeBasisPoints);
        }

        // 4. Get listing details
        console.log("📋 Getting listing details...");
        const listing = await datasovClient.getListing(listingId);
        if (listing) {
            console.log("Listing Details:");
            console.log("- ID:", listing.id);
            console.log("- Owner:", listing.owner.toString());
            console.log("- Price:", listing.price.toString(), "lamports");
            console.log("- Data Type:", listing.dataType);
            console.log("- Description:", listing.description);
            console.log("- Active:", listing.isActive);
        }

        // 5. Get all active listings
        console.log("📜 Getting all active listings...");
        const activeListings = await datasovClient.getActiveListings();
        console.log("Active Listings Count:", activeListings.length);

        // 6. Update listing price
        console.log("💰 Updating listing price...");
        const newPrice = 0.15 * LAMPORTS_PER_SOL; // 0.15 SOL
        const updateTx = await datasovClient.updateListingPrice(
            dataOwner,
            listingId,
            newPrice
        );
        console.log("✅ Price updated:", updateTx);

        // 7. Purchase data (simulated - would need actual token mint)
        console.log("🛒 Simulating data purchase...");
        console.log("Note: In a real scenario, you would need to:");
        console.log("1. Create a token mint");
        console.log("2. Create associated token accounts");
        console.log("3. Mint tokens to buyer");
        console.log("4. Execute purchase transaction");

        // 8. Cancel listing
        console.log("❌ Cancelling listing...");
        const cancelTx = await datasovClient.cancelListing(
            dataOwner,
            listingId
        );
        console.log("✅ Listing cancelled:", cancelTx);

        // 9. Verify listing is cancelled
        const cancelledListing = await datasovClient.getListing(listingId);
        if (cancelledListing) {
            console.log(
                "Listing Status:",
                cancelledListing.isActive ? "Active" : "Cancelled"
            );
        }

        console.log("🎉 Example completed successfully!");
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

// Run the example
if (require.main === module) {
    main().catch(console.error);
}

export { main };
