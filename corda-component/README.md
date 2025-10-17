# DataSov Corda Component

A comprehensive Corda-based digital identity management system that provides secure, permissioned identity verification and access control for the DataSov hybrid blockchain solution.

## 🚀 Features

-   **Digital Identity Management**: Secure registration and management of digital identities (DIDs)
-   **KYC Integration**: Comprehensive Know Your Customer verification with multiple methods
-   **Permissioned Access Control**: Granular access control for data consumers
-   **Privacy-Preserving**: Encrypted personal information with selective disclosure
-   **Enterprise-Grade Security**: Built on Corda's permissioned blockchain infrastructure
-   **Multiple Identity Types**: Support for various identity sources (NTT DOCOMO, Government IDs, etc.)

## 📋 Supported Identity Types

-   **NTT DOCOMO User ID**: Mobile carrier-based identity verification
-   **Government Digital ID**: Official government-issued digital identities
-   **Passport**: International travel document verification
-   **Driver's License**: Motor vehicle license verification
-   **National ID**: Country-specific national identification
-   **Custom**: Custom identity types for specific use cases

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd corda-component

# Build the project
./gradlew build

# Deploy nodes
./gradlew deployNodes

# Start the network
./build/nodes/runnodes
```

## 📖 Usage

### Basic Setup

```kotlin
import com.datasov.client.DataSovClient
import net.corda.core.messaging.CordaRPCOps
import net.corda.client.rpc.CordaRPCClient
import net.corda.core.utilities.NetworkHostAndPort

// Connect to Corda node
val rpcClient = CordaRPCClient(NetworkHostAndPort("localhost", 10006))
val rpcConnection = rpcClient.start("user1", "test")
val rpcOps = rpcConnection.proxy

// Create DataSov client
val dataSovClient = DataSovClient(rpcOps)
```

### Registering a Digital Identity

```kotlin
// Create personal information
val personalInfo = DigitalIdentityState.PersonalInfo(
    firstName = "Taro",
    lastName = "Yamada",
    dateOfBirth = "1990-01-01",
    nationality = "Japanese",
    address = "Tokyo, Japan",
    phoneNumber = "+81-90-1234-5678",
    emailAddress = "taro.yamada@example.com",
    encryptedData = mapOf(
        "passportNumber" to "encrypted_passport_123"
    )
)

// Register identity
val tx = dataSovClient.registerIdentity(
    identityId = "USER_12345",
    identityType = DigitalIdentityState.IdentityType.NTT_DOCOMO_USER_ID,
    personalInfo = personalInfo,
    identityProvider = identityProvider
)
```

### Verifying an Identity

```kotlin
// Verify using document verification
val verificationTx = dataSovClient.verifyIdentity(
    identityId = "USER_12345",
    verificationMethod = KYCVerificationMethod.DOCUMENT_VERIFICATION
)
```

### Managing Access Permissions

```kotlin
// Grant access to data consumer
val accessTx = dataSovClient.grantAccess(
    identityId = "USER_12345",
    consumer = dataConsumer,
    permissionType = DigitalIdentityState.PermissionType.READ_ONLY,
    dataTypes = listOf(
        DigitalIdentityState.DataType.LOCATION_HISTORY,
        DigitalIdentityState.DataType.APP_USAGE
    ),
    expiresAt = Instant.now().plusSeconds(30 * 24 * 60 * 60) // 30 days
)

// Check access
val hasAccess = dataSovClient.hasAccess(
    identityId = "USER_12345",
    dataType = DigitalIdentityState.DataType.LOCATION_HISTORY
)
```

## 🏗️ Architecture

### Core Components

1. **Digital Identity State**: Represents a digital identity with all associated information
2. **Digital Identity Contract**: Defines the rules for identity management operations
3. **KYC Service**: Provides identity verification capabilities
4. **Access Control Flows**: Manage permissioned access to identity data
5. **Client API**: High-level interface for interacting with the system

### Key Flows

-   `IdentityRegistrationFlow`: Register new digital identities
-   `IdentityVerificationFlow`: Verify identities using KYC methods
-   `IdentityUpdateFlow`: Update identity information
-   `GrantAccessFlow`: Grant access permissions to data consumers
-   `RevokeAccessFlow`: Revoke access permissions
-   `RevokeIdentityFlow`: Revoke digital identities

### KYC Verification Methods

-   **Document Verification**: Government ID, passport, driver's license verification
-   **Biometric Verification**: Face recognition, fingerprint verification
-   **Knowledge-Based Verification**: Personal history questions
-   **Credential Verification**: Digital certificates, blockchain credentials
-   **Third-Party Verification**: Government databases, credit bureaus
-   **Self-Attestation**: Self-declaration (lowest verification level)

## 🔒 Security Features

-   **Encrypted Personal Data**: All sensitive information is encrypted
-   **Permissioned Network**: Only authorized parties can participate
-   **Access Control**: Granular permissions for data access
-   **Audit Trail**: Complete transaction history for compliance
-   **Identity Verification**: Multiple KYC methods for different assurance levels
-   **Revocation Support**: Ability to revoke identities and access permissions

## 🧪 Testing

```bash
# Run unit tests
./gradlew test

# Run integration tests
./gradlew integrationTest

# Run specific test
./gradlew test --tests "com.datasov.contracts.DigitalIdentityContractTest"
```

## 📊 Example Integration

See `clients/src/main/kotlin/com/datasov/client/DataSovClientExample.kt` for a complete example of:

-   Identity registration
-   KYC verification
-   Access permission management
-   Identity updates
-   Access revocation

## 🔧 Configuration

### Node Configuration

The `deployNodes` task creates a network with the following nodes:

-   **Notary**: Validates and notarizes transactions
-   **Identity Provider**: Manages identity verification
-   **Data Owner**: Owns and manages digital identities
-   **Data Consumer**: Requests access to identity data

### Environment Variables

```bash
# Corda node configuration
CORDA_NODE_HOST=localhost
CORDA_NODE_PORT=10006
CORDA_RPC_USERNAME=user1
CORDA_RPC_PASSWORD=test

# KYC service configuration
KYC_PROVIDER_URL=https://kyc-provider.example.com
KYC_API_KEY=your-api-key
```

## 🚀 Deployment

### Local Development

```bash
# Deploy to local network
./gradlew deployNodes

# Start nodes
./build/nodes/runnodes
```

### Production Deployment

```bash
# Build for production
./gradlew build

# Deploy to production network
./gradlew deployNodes -Pnetwork=production
```

## 📈 Performance

-   **High Throughput**: Corda's optimized consensus mechanism
-   **Low Latency**: Fast transaction finalization
-   **Scalable**: Horizontal scaling with additional nodes
-   **Efficient**: Minimal resource usage for identity operations

## 🔗 Integration with Solana Component

The Corda component provides the secure identity foundation for the DataSov system:

1. **Identity Registration**: Users register their digital identity on Corda
2. **Identity Verification**: KYC verification ensures identity authenticity
3. **Access Control**: Permissioned access to identity data
4. **Data Tokenization**: Verified identities enable data tokenization on Solana
5. **Cross-Chain Bridge**: Identity proofs are used for Solana data marketplace

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Projects

-   **DataSov Solana Component**: Data marketplace on Solana
-   **DataSov Integration Layer**: Bridge between Corda and Solana
-   **DataSov Frontend**: User interface for the complete system

## 📞 Support

For questions and support:

-   Create an issue in the repository
-   Contact the DataSov team
-   Check the documentation wiki

---

**DataSov** - Empowering users with data ownership through hybrid blockchain technology.
