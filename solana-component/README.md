# DataSov Solana Component

A comprehensive Solana-based data marketplace that enables users to tokenize and trade their anonymized personal data as NFTs. This component is part of the DataSov hybrid blockchain solution that combines Corda's secure identity management with Solana's high-performance data marketplace.

## 🚀 Features

-   **Data Tokenization**: Convert anonymized personal data into tradeable NFTs
-   **Marketplace Trading**: Buy and sell data NFTs with automatic fee collection
-   **Multiple Data Types**: Support for location history, app usage, purchase history, health data, and more
-   **Fee Management**: Configurable marketplace fees with automatic distribution
-   **Secure Transactions**: Built on Solana's secure and fast blockchain
-   **TypeScript SDK**: Complete client library for easy integration

## 📋 Supported Data Types

-   **Location History**: Smartphone location data
-   **App Usage**: Application usage patterns and statistics
-   **Purchase History**: Shopping and transaction data
-   **Health Data**: Fitness and health metrics
-   **Social Media Activity**: Social platform engagement data
-   **Search History**: Web search patterns
-   **Custom**: Any other type of data with custom labels

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd solana-component

# Install dependencies
npm install

# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## 📖 Usage

### Basic Setup

```typescript
import { DataSovClient, DataType } from "./src/index";
import { Connection, PublicKey } from "@solana/web3.js";

// Initialize client
const client = new DataSovClient({
    rpcUrl: "https://api.devnet.solana.com",
    programId: new PublicKey("YOUR_PROGRAM_ID"),
    marketplaceFeeBasisPoints: 250, // 2.5%
});

// Initialize marketplace (authority only)
await client.initializeMarketplace(authorityKeypair, 250);
```

### Creating Data Listings

```typescript
// Create a new data listing
const listingId = 1;
const price = 0.1 * LAMPORTS_PER_SOL; // 0.1 SOL

await client.createDataListing(
    ownerKeypair,
    listingId,
    price,
    DataType.LocationHistory,
    "Anonymized location data from smartphone usage over 3 months"
);
```

### Purchasing Data

```typescript
// Purchase data from a listing
await client.purchaseData(buyerKeypair, listingId, tokenMint);
```

### Managing Listings

```typescript
// Update listing price
await client.updateListingPrice(ownerKeypair, listingId, newPrice);

// Cancel a listing
await client.cancelListing(ownerKeypair, listingId);

// Get listing details
const listing = await client.getListing(listingId);
```

### Querying Data

```typescript
// Get all active listings
const activeListings = await client.getActiveListings();

// Get listings by data type
const locationListings = await client.getListingsByDataType(
    DataType.LocationHistory
);

// Get listings by owner
const myListings = await client.getListingsByOwner(ownerPublicKey);

// Get marketplace statistics
const marketplace = await client.getMarketplace();
```

## 🏗️ Architecture

### Smart Contract Structure

The Solana program consists of two main account types:

1. **Marketplace Account**: Stores global marketplace configuration and statistics
2. **Data Listing Account**: Stores individual data listing information

### Key Functions

-   `initializeMarketplace`: Set up the marketplace with fee configuration
-   `createDataListing`: Create a new data NFT listing
-   `purchaseData`: Buy data from a listing with automatic fee distribution
-   `updateListingPrice`: Modify listing price
-   `cancelListing`: Remove a listing from the marketplace
-   `withdrawFees`: Withdraw accumulated marketplace fees

### Fee Structure

-   **Marketplace Fee**: Configurable percentage (default 2.5%)
-   **Owner Revenue**: Remaining amount after marketplace fee
-   **Automatic Distribution**: Fees are automatically calculated and distributed

## 🧪 Testing

```bash
# Run tests
anchor test

# Run specific test file
anchor test -- --grep "Creates a data listing"
```

## 📊 Example Integration

See `examples/basic-usage.ts` for a complete example of:

-   Marketplace initialization
-   Creating data listings
-   Purchasing data
-   Managing listings
-   Querying marketplace data

## 🔧 Configuration

### Environment Variables

```bash
# Solana cluster
SOLANA_CLUSTER=devnet

# Program ID (update after deployment)
PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_ID

# RPC URL
RPC_URL=https://api.devnet.solana.com
```

### Anchor Configuration

The `Anchor.toml` file contains deployment configuration:

```toml
[programs.devnet]
datasov_solana = "YOUR_PROGRAM_ID"

[provider]
cluster = "Devnet"
wallet = "~/.config/solana/id.json"
```

## 🚀 Deployment

### Local Development

```bash
# Start local validator
solana-test-validator

# Deploy to local
anchor deploy --provider.cluster localnet
```

### Devnet Deployment

```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### Mainnet Deployment

```bash
# Deploy to mainnet (use with caution)
anchor deploy --provider.cluster mainnet-beta
```

## 🔒 Security Considerations

-   **Access Control**: Only authorized users can perform certain operations
-   **Input Validation**: All inputs are validated before processing
-   **Fee Protection**: Marketplace fees are automatically calculated and distributed
-   **State Management**: Listing states are properly managed to prevent double-spending

## 📈 Performance

-   **High Throughput**: Leverages Solana's high-performance blockchain
-   **Low Latency**: Fast transaction confirmation times
-   **Cost Effective**: Low transaction fees for data trading
-   **Scalable**: Can handle large numbers of concurrent listings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Projects

-   **DataSov Corda Component**: Identity management on Corda
-   **DataSov Integration Layer**: Bridge between Corda and Solana
-   **DataSov Frontend**: User interface for the complete system

## 📞 Support

For questions and support:

-   Create an issue in the repository
-   Contact the DataSov team
-   Check the documentation wiki

---

**DataSov** - Empowering users with data ownership through hybrid blockchain technology.
