/**
 * DataSov Integration Test
 *
 * Tests the integration between frontend and API server
 */

const axios = require("axios");

const API_BASE_URL = "http://localhost:3001";
const FRONTEND_URL = "http://localhost:3000";

async function testApiEndpoints() {
    console.log("🧪 Starting DataSov Integration Tests...\n");

    let passedTests = 0;
    let totalTests = 0;

    const test = async (name, testFn) => {
        totalTests++;
        try {
            await testFn();
            console.log(`✅ ${name}`);
            passedTests++;
        } catch (error) {
            console.log(`❌ ${name}: ${error.message}`);
        }
    };

    // Test 1: Health Check
    await test("Health Check", async () => {
        const response = await axios.get(`${API_BASE_URL}/health`);
        if (response.data.success !== true) {
            throw new Error("Health check failed");
        }
        if (response.data.data.status !== "healthy") {
            throw new Error("System not healthy");
        }
    });

    // Test 2: User Registration
    let authToken;
    await test("User Registration", async () => {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
            name: "Test User",
            email: "test@datasov.com",
            password: "testpassword123",
        });

        if (response.data.success !== true) {
            throw new Error("Registration failed");
        }
        if (!response.data.data.token) {
            throw new Error("No token returned");
        }

        authToken = response.data.data.token;
    });

    // Test 3: User Login
    await test("User Login", async () => {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: "demo@datasov.com",
            password: "password123",
        });

        if (response.data.success !== true) {
            throw new Error("Login failed");
        }
        if (!response.data.data.token) {
            throw new Error("No token returned");
        }

        authToken = response.data.data.token;
    });

    // Test 4: Get Current User
    await test("Get Current User", async () => {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.data.success !== true) {
            throw new Error("Get user failed");
        }
        if (!response.data.data.email) {
            throw new Error("No user data returned");
        }
    });

    // Test 5: Get Data Listings
    await test("Get Data Listings", async () => {
        const response = await axios.get(`${API_BASE_URL}/data/listings`);

        if (response.data.success !== true) {
            throw new Error("Get listings failed");
        }
        if (!Array.isArray(response.data.data)) {
            throw new Error("Invalid listings data");
        }
        if (response.data.data.length === 0) {
            throw new Error("No listings found");
        }
    });

    // Test 6: Get Identity
    await test("Get Identity", async () => {
        const response = await axios.get(`${API_BASE_URL}/identity/ID_001`);

        if (response.data.success !== true) {
            throw new Error("Get identity failed");
        }
        if (!response.data.data.identityId) {
            throw new Error("No identity data returned");
        }
    });

    // Test 7: Get Identity Proof
    await test("Get Identity Proof", async () => {
        const response = await axios.get(
            `${API_BASE_URL}/identity/ID_001/proof`
        );

        if (response.data.success !== true) {
            throw new Error("Get identity proof failed");
        }
        if (!response.data.data.signature) {
            throw new Error("No proof signature returned");
        }
    });

    // Test 8: Bridge Status
    await test("Bridge Status", async () => {
        const response = await axios.get(`${API_BASE_URL}/bridge/status`);

        if (response.data.success !== true) {
            throw new Error("Get bridge status failed");
        }
        if (typeof response.data.data.isRunning !== "boolean") {
            throw new Error("Invalid bridge status");
        }
    });

    // Test 9: Sync Status
    await test("Sync Status", async () => {
        const response = await axios.get(`${API_BASE_URL}/sync/status`);

        if (response.data.success !== true) {
            throw new Error("Get sync status failed");
        }
        if (typeof response.data.data.isRunning !== "boolean") {
            throw new Error("Invalid sync status");
        }
    });

    // Test 10: State Snapshot
    await test("State Snapshot", async () => {
        const response = await axios.get(`${API_BASE_URL}/state/snapshot`);

        if (response.data.success !== true) {
            throw new Error("Get state snapshot failed");
        }
        if (typeof response.data.data.timestamp !== "number") {
            throw new Error("Invalid snapshot data");
        }
    });

    // Test 11: Frontend Accessibility
    await test("Frontend Accessibility", async () => {
        const response = await axios.get(FRONTEND_URL);

        if (response.status !== 200) {
            throw new Error("Frontend not accessible");
        }
        if (!response.data.includes("DataSov")) {
            throw new Error("Frontend content not found");
        }
    });

    // Test 12: Create Data Listing (with auth)
    await test("Create Data Listing", async () => {
        const response = await axios.post(
            `${API_BASE_URL}/data/listing`,
            {
                owner: "demo@datasov.com",
                listingId: 999,
                price: "1.0",
                dataType: "CUSTOM",
                description: "Test data listing",
                cordaIdentityId: "ID_001",
            },
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );

        if (response.data.success !== true) {
            throw new Error("Create listing failed");
        }
        if (!response.data.data.transactionHash) {
            throw new Error("No transaction hash returned");
        }
    });

    console.log(`\n📊 Test Results:`);
    console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`   ❌ Failed: ${totalTests - passedTests}/${totalTests}`);
    console.log(
        `   📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`
    );

    if (passedTests === totalTests) {
        console.log("\n🎉 All tests passed! Integration is working correctly.");
    } else {
        console.log(
            "\n⚠️  Some tests failed. Please check the API server and configuration."
        );
    }

    return passedTests === totalTests;
}

// Run the tests
testApiEndpoints()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error("❌ Test execution failed:", error);
        process.exit(1);
    });
