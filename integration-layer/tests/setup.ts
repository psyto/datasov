/**
 * Jest Setup
 *
 * Global test setup and configuration
 */

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.CORDA_RPC_HOST = "localhost";
process.env.CORDA_RPC_PORT = "10006";
process.env.CORDA_RPC_USERNAME = "user1";
process.env.CORDA_RPC_PASSWORD = "test";
process.env.SOLANA_RPC_URL = "https://api.devnet.solana.com";
process.env.SOLANA_PROGRAM_ID = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS";
process.env.JWT_SECRET = "test_secret";
process.env.ENCRYPTION_KEY = "test_encryption_key";

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
