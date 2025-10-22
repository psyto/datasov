/**
 * Simple API Server for DataSov Integration Layer
 *
 * This is a simplified version for demo purposes that provides
 * the necessary API endpoints without full blockchain integration.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "datasov-demo-secret-key";

// Middleware
app.use(helmet());
app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:3001"],
        credentials: true,
    })
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Mock data storage
const users: any[] = [];
const identities: any[] = [];
const dataListings: any[] = [];
const purchases: any[] = [];

// Initialize with demo data
const initializeDemoData = () => {
    // Demo users
    users.push({
        id: "user_123",
        email: "demo@datasov.com",
        name: "Demo User",
        password: bcrypt.hashSync("password123", 10),
        avatar: "https://via.placeholder.com/40",
        createdAt: Date.now() - 86400000 * 30,
        lastLoginAt: Date.now(),
    });

    // Demo identities
    identities.push(
        {
            identityId: "ID_001",
            owner: "demo@datasov.com",
            identityProvider: "NTT DOCOMO",
            identityType: "NTT_DOCOMO_USER_ID",
            status: "VERIFIED",
            verificationLevel: "HIGH",
            personalInfo: {
                firstName: "Taro",
                lastName: "Yamada",
                emailAddress: "taro.yamada@example.com",
                encryptedData: {},
            },
            accessPermissions: [],
            createdAt: Date.now() - 86400000,
            verifiedAt: Date.now() - 3600000,
            metadata: {},
        },
        {
            identityId: "ID_002",
            owner: "demo@datasov.com",
            identityProvider: "Government",
            identityType: "GOVERNMENT_DIGITAL_ID",
            status: "PENDING",
            verificationLevel: "BASIC",
            personalInfo: {
                firstName: "Hanako",
                lastName: "Sato",
                emailAddress: "hanako.sato@example.com",
                encryptedData: {},
            },
            accessPermissions: [],
            createdAt: Date.now() - 172800000,
            metadata: {},
        }
    );

    // Demo data listings
    dataListings.push(
        {
            id: 1,
            owner: "demo@datasov.com",
            price: "0.1",
            dataType: "LOCATION_HISTORY",
            description:
                "Anonymized location data from verified NTT DOCOMO user",
            isActive: true,
            createdAt: Date.now() - 86400000,
            cordaIdentityId: "ID_001",
        },
        {
            id: 2,
            owner: "demo@datasov.com",
            price: "0.25",
            dataType: "APP_USAGE",
            description: "Mobile app usage patterns and statistics",
            isActive: true,
            createdAt: Date.now() - 172800000,
            cordaIdentityId: "ID_001",
        },
        {
            id: 3,
            owner: "demo@datasov.com",
            price: "0.5",
            dataType: "PURCHASE_HISTORY",
            description: "Shopping and transaction history",
            isActive: true,
            createdAt: Date.now() - 259200000,
            cordaIdentityId: "ID_001",
        },
        {
            id: 4,
            owner: "demo@datasov.com",
            price: "0.8",
            dataType: "HEALTH_DATA",
            description: "Fitness and health metrics",
            isActive: true,
            createdAt: Date.now() - 345600000,
            cordaIdentityId: "ID_002",
        },
        {
            id: 5,
            owner: "demo@datasov.com",
            price: "0.3",
            dataType: "SOCIAL_MEDIA_ACTIVITY",
            description: "Social media engagement data",
            isActive: false,
            createdAt: Date.now() - 432000000,
            soldAt: Date.now() - 3600000,
            buyer: "research@company.com",
            cordaIdentityId: "ID_001",
        }
    );

    // Demo purchases
    purchases.push({
        listingId: 5,
        buyer: "demo@datasov.com",
        amount: "0.3",
        timestamp: Date.now() - 3600000,
        transactionHash: "tx_123456789",
        cordaIdentityId: "ID_001",
        accessGranted: true,
    });
};

// JWT middleware
const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res
            .status(401)
            .json({ success: false, error: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            return res
                .status(403)
                .json({ success: false, error: "Invalid token" });
        }
        req.user = user;
        next();
    });
};

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        success: true,
        data: {
            status: "healthy",
            timestamp: Date.now(),
            services: {
                corda: { status: "up", lastCheck: Date.now() },
                solana: { status: "up", lastCheck: Date.now() },
                bridge: { status: "up", lastCheck: Date.now() },
                database: { status: "up", lastCheck: Date.now() },
            },
            metrics: {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                cpuUsage: 45.2,
                activeConnections: 1,
            },
        },
        timestamp: Date.now(),
        requestId: `req_${Date.now()}`,
    });
});

// Authentication endpoints
app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = users.find((u) => u.email === email);
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Update last login
        user.lastLoginAt = Date.now();

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                    identities: identities.filter(
                        (i) => i.owner === user.email
                    ),
                    dataListings: dataListings.filter(
                        (l) => l.owner === user.email
                    ),
                    purchases: purchases.filter((p) => p.buyer === user.email),
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt,
                },
                token,
            },
            timestamp: Date.now(),
            requestId: `req_${Date.now()}`,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Login failed",
            timestamp: Date.now(),
            requestId: `req_${Date.now()}`,
        });
    }
});

app.post("/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (users.find((u) => u.email === email)) {
            return res.status(400).json({
                success: false,
                error: "User already exists",
            });
        }

        const user = {
            id: `user_${Date.now()}`,
            email,
            name,
            password: bcrypt.hashSync(password, 10),
            avatar: "https://via.placeholder.com/40",
            createdAt: Date.now(),
            lastLoginAt: Date.now(),
        };

        users.push(user);

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                    identities: [],
                    dataListings: [],
                    purchases: [],
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt,
                },
                token,
            },
            timestamp: Date.now(),
            requestId: `req_${Date.now()}`,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Registration failed",
            timestamp: Date.now(),
            requestId: `req_${Date.now()}`,
        });
    }
});

app.get("/auth/me", authenticateToken, (req, res) => {
    const user = users.find((u) => u.id === req.user.userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            error: "User not found",
        });
    }

    res.json({
        success: true,
        data: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            identities: identities.filter((i) => i.owner === user.email),
            dataListings: dataListings.filter((l) => l.owner === user.email),
            purchases: purchases.filter((p) => p.buyer === user.email),
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        },
        timestamp: Date.now(),
        requestId: `req_${Date.now()}`,
    });
});

// Identity endpoints
app.get("/identity/:id", (req, res) => {
    const identity = identities.find((i) => i.identityId === req.params.id);
    if (!identity) {
        return res.status(404).json({
            success: false,
            error: "Identity not found",
        });
    }

    res.json({
        success: true,
        data: identity,
        timestamp: Date.now(),
        requestId: `req_${Date.now()}`,
    });
});

app.get("/identity/:id/proof", (req, res) => {
    const identity = identities.find((i) => i.identityId === req.params.id);
    if (!identity) {
        return res.status(404).json({
            success: false,
            error: "Identity not found",
        });
    }

    const proof = {
        identityId: identity.identityId,
        owner: identity.owner,
        verificationLevel: identity.verificationLevel,
        verificationTimestamp: identity.verifiedAt || Date.now(),
        cordaTransactionHash: `tx_${Date.now()}`,
        signature: `sig_${Date.now()}`,
        validUntil: Date.now() + 86400000, // 24 hours
        metadata: {},
    };

    res.json({
        success: true,
        data: proof,
        timestamp: Date.now(),
        requestId: `req_${Date.now()}`,
    });
});

// Data listing endpoints
app.get("/data/listings", (req, res) => {
    const { owner, page = 1, limit = 10 } = req.query;

    let filteredListings = dataListings;
    if (owner) {
        filteredListings = dataListings.filter((l) => l.owner === owner);
    }

    const startIndex =
        (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedListings = filteredListings.slice(startIndex, endIndex);

    res.json({
        success: true,
        data: paginatedListings,
        timestamp: Date.now(),
        requestId: `req_${Date.now()}`,
        pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: filteredListings.length,
            totalPages: Math.ceil(
                filteredListings.length / parseInt(limit as string)
            ),
        },
    });
});

app.get("/data/listing/:id", (req, res) => {
    const listing = dataListings.find((l) => l.id === parseInt(req.params.id));
    if (!listing) {
        return res.status(404).json({
            success: false,
            error: "Listing not found",
        });
    }

    res.json({
        success: true,
        data: listing,
        timestamp: Date.now(),
        requestId: `req_${Date.now()}`,
    });
});

app.post("/data/listing", authenticateToken, (req, res) => {
    const { owner, listingId, price, dataType, description, cordaIdentityId } =
        req.body;

    const newListing = {
        id: dataListings.length + 1,
        owner,
        price,
        dataType,
        description,
        isActive: true,
        createdAt: Date.now(),
        cordaIdentityId,
    };

    dataListings.push(newListing);

    res.json({
        success: true,
        data: { transactionHash: `tx_${Date.now()}` },
        timestamp: Date.now(),
        requestId: `req_${Date.now()}`,
    });
});

// Bridge status endpoint
app.get("/bridge/status", (req, res) => {
    res.json({
        success: true,
        data: {
            isRunning: true,
            lastSync: Date.now(),
            cordaConnected: true,
            solanaConnected: true,
        },
        timestamp: Date.now(),
        requestId: `req_${Date.now()}`,
    });
});

// Sync endpoints
app.get("/sync/status", (req, res) => {
    res.json({
        success: true,
        data: {
            isRunning: true,
            lastSync: Date.now(),
            pendingOperations: 0,
        },
        timestamp: Date.now(),
        requestId: `req_${Date.now()}`,
    });
});

app.get("/state/snapshot", (req, res) => {
    res.json({
        success: true,
        data: {
            timestamp: Date.now(),
            identities: identities.length,
            listings: dataListings.length,
            purchases: purchases.length,
            users: users.length,
        },
        timestamp: Date.now(),
        requestId: `req_${Date.now()}`,
    });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
    console.error("API Error:", err);
    res.status(500).json({
        success: false,
        error: "Internal server error",
        timestamp: Date.now(),
        requestId: `req_${Date.now()}`,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Endpoint not found",
        timestamp: Date.now(),
        requestId: `req_${Date.now()}`,
    });
});

// Initialize demo data and start server
initializeDemoData();

app.listen(PORT, () => {
    console.log(`🚀 DataSov API Server running on port ${PORT}`);
    console.log(`📊 Demo data initialized:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Identities: ${identities.length}`);
    console.log(`   - Data Listings: ${dataListings.length}`);
    console.log(`   - Purchases: ${purchases.length}`);
    console.log(`\n🔗 Available endpoints:`);
    console.log(`   - Health: http://localhost:${PORT}/health`);
    console.log(`   - Login: http://localhost:${PORT}/auth/login`);
    console.log(`   - Register: http://localhost:${PORT}/auth/register`);
    console.log(`   - Data Listings: http://localhost:${PORT}/data/listings`);
    console.log(`\n🎯 Demo credentials:`);
    console.log(`   - Email: demo@datasov.com`);
    console.log(`   - Password: password123`);
});

export default app;
