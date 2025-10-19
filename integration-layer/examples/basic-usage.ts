/**
 * Basic Usage Example
 *
 * Demonstrates how to use the DataSov Integration Layer
 * for cross-chain operations between Corda and Solana.
 */

import { DataSovIntegrationLayer } from "../src/index";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

async function demonstrateBasicUsage() {
    console.log("🚀 DataSov Integration Layer - Basic Usage Example");
    console.log("================================================\n");

    try {
        // Initialize the integration layer
        const integrationLayer = new DataSovIntegrationLayer();

        // Start the service
        console.log("📡 Starting DataSov Integration Layer...");
        await integrationLayer.start();
        console.log("✅ Integration Layer started successfully\n");

        // Example 1: Get service status
        console.log("📊 Service Status:");
        const status = integrationLayer.getStatus();
        console.log(JSON.stringify(status, null, 2));
        console.log("");

        // Example 2: Health check
        console.log("🏥 Health Check:");
        const healthResponse = await fetch("http://localhost:3000/health");
        const health = await healthResponse.json();
        console.log(JSON.stringify(health, null, 2));
        console.log("");

        // Example 3: Get identity (mock)
        console.log("👤 Getting Identity:");
        try {
            const identityResponse = await fetch(
                "http://localhost:3000/identity/USER_12345"
            );
            const identity = await identityResponse.json();
            console.log(JSON.stringify(identity, null, 2));
        } catch (error) {
            console.log("ℹ️  Identity not found (expected in demo)");
        }
        console.log("");

        // Example 4: Generate identity proof
        console.log("🔐 Generating Identity Proof:");
        try {
            const proofResponse = await fetch(
                "http://localhost:3000/identity/USER_12345/proof"
            );
            const proof = await proofResponse.json();
            console.log(JSON.stringify(proof, null, 2));
        } catch (error) {
            console.log(
                "ℹ️  Identity proof generation failed (expected in demo)"
            );
        }
        console.log("");

        // Example 5: Create data listing
        console.log("📝 Creating Data Listing:");
        const listingData = {
            owner: "mock_owner_keypair",
            listingId: 1,
            price: 1000000, // 0.001 SOL
            dataType: "LOCATION_HISTORY",
            description: "Anonymized location data from verified user",
            cordaIdentityId: "USER_12345",
        };

        try {
            const listingResponse = await fetch(
                "http://localhost:3000/data/listing",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(listingData),
                }
            );
            const listing = await listingResponse.json();
            console.log(JSON.stringify(listing, null, 2));
        } catch (error) {
            console.log("ℹ️  Data listing creation failed (expected in demo)");
        }
        console.log("");

        // Example 6: Get data listings
        console.log("📋 Getting Data Listings:");
        try {
            const listingsResponse = await fetch(
                "http://localhost:3000/data/listings"
            );
            const listings = await listingsResponse.json();
            console.log(JSON.stringify(listings, null, 2));
        } catch (error) {
            console.log(
                "ℹ️  Data listings retrieval failed (expected in demo)"
            );
        }
        console.log("");

        // Example 7: Purchase data
        console.log("💰 Purchasing Data:");
        const purchaseData = {
            buyer: "mock_buyer_keypair",
            listingId: 1,
            tokenMint: "mock_token_mint_address",
            cordaIdentityId: "USER_12345",
        };

        try {
            const purchaseResponse = await fetch(
                "http://localhost:3000/data/purchase",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(purchaseData),
                }
            );
            const purchase = await purchaseResponse.json();
            console.log(JSON.stringify(purchase, null, 2));
        } catch (error) {
            console.log("ℹ️  Data purchase failed (expected in demo)");
        }
        console.log("");

        // Example 8: Get state snapshot
        console.log("📸 Getting State Snapshot:");
        try {
            const snapshotResponse = await fetch(
                "http://localhost:3000/state/snapshot"
            );
            const snapshot = await snapshotResponse.json();
            console.log(JSON.stringify(snapshot, null, 2));
        } catch (error) {
            console.log(
                "ℹ️  State snapshot retrieval failed (expected in demo)"
            );
        }
        console.log("");

        // Example 9: Start synchronization
        console.log("🔄 Starting Synchronization:");
        try {
            const syncResponse = await fetch(
                "http://localhost:3000/sync/start",
                {
                    method: "POST",
                }
            );
            const sync = await syncResponse.json();
            console.log(JSON.stringify(sync, null, 2));
        } catch (error) {
            console.log("ℹ️  Synchronization failed (expected in demo)");
        }
        console.log("");

        console.log("✅ Basic usage demonstration completed successfully!");
        console.log(
            "📚 Check the API documentation for more advanced usage examples."
        );
    } catch (error) {
        console.error("❌ Error during demonstration:", error);
    }
}

// Run the demonstration
if (require.main === module) {
    demonstrateBasicUsage().catch(console.error);
}

export { demonstrateBasicUsage };
