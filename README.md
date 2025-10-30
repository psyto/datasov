# DataSov: Hybrid Digital Identity and Data Ownership

DataSov combines Corda for privacy-preserving Digital Identity (DID) and Solana for high-throughput data ownership trading. This repo contains a minimal end-to-end demo environment and component implementations.

---

## Quick Start (Web Demo)

Run the web demo with a local API and frontend:

1. Start the Integration Layer (demo Simple API)

```bash
cd integration-layer
npm install
npm run build
node dist/simple-api.js
```

2. Start the Frontend

```bash
cd ../frontend
npm install
npm start
```

3. Open the app

-   Frontend: http://localhost:3000
-   API: http://localhost:3001

4. Demo credentials

-   Email: demo@datasov.com
-   Password: password123

Note: The frontend proxies API requests to http://localhost:3001 (see `frontend/package.json` proxy field). Ensure the API is running before logging in.

---

## Components

-   `corda-component/`: Kotlin contracts, clients, and workflows for DID and access control on Corda.
-   `solana-component/`: Anchor-based program and TypeScript SDK for data marketplace operations on Solana.
-   `integration-layer/`: TypeScript services that bridge Corda and Solana. Includes a production-like API and a demo `simple-api` for local runs.
-   `frontend/`: React (CRA + Tailwind) dashboard for identities, marketplace, analytics.
-   `DataSovMobile/`: Lightweight Expo app (mobile UI demo). Also runnable on web via Expo.

---

## Run Options

### A) Minimal Demo (recommended)

Uses the `integration-layer/dist/simple-api.js` plus the frontend. This is what the integration tests target.

```bash
# Terminal A (API)
cd integration-layer && npm run build && node dist/simple-api.js

# Terminal B (Frontend)
cd frontend && npm start

# Optional: Run integration smoke tests
cd .. && node integration-test.js
```

### B) Full Stack (advanced)

Start real networks first, then use the full Integration Layer API (`dist/index.js`). This requires local Corda and Solana environments.

```bash
# Corda (example)
cd corda-component
./gradlew deployNodes
./build/nodes/runnodes

# Solana (example)
solana-test-validator
cd solana-component
anchor build
anchor deploy --provider.cluster localnet

# Integration Layer (full API)
cd ../integration-layer
npm run build
node dist/index.js

# Frontend
cd ../frontend
npm start
```

If you see `Cannot find module '@/utils/Logger'` when running `dist/index.js`, use the demo `simple-api.js` for local runs, or configure TS path aliases resolution at runtime.

---

## Integration Tests

From the repo root:

```bash
node integration-test.js
```

This runs a set of HTTP checks against the API and validates frontend availability. Ensure both API and frontend are running. A passing run shows 12/12 tests.

---

## Architecture Overview

1. Corda Component: privacy-preserving DID

-   Identity Registration (KYC-friendly)
-   Permissioned Access Control

2. Solana Component: Data Marketplace

-   Tokenized data ownership (NFT-like)
-   Listing, purchase, fee distribution

3. Integration Layer

-   Cross-chain bridge (proof validation, state sync)
-   REST API and health/status endpoints

---

## Troubleshooting

-   Frontend shows proxy errors (ECONNREFUSED): Start the API at http://localhost:3001.
-   `dist/index.js` cannot resolve `@/...` imports: use `node dist/simple-api.js` for demo, or add runtime alias resolution (e.g., `tsconfig-paths`), or build without path aliases.
-   Port conflicts: change frontend port with CRA env vars, or API `PORT` in `integration-layer/env.example`.

---

## Mobile (Optional)

```bash
cd DataSovMobile
npm install
npm run web    # run with Expo on web
```

This is a lightweight UI demo using mock data.

---

## Why Corda + Solana

-   Trust + Privacy (Corda) meets Throughput + Openness (Solana).
-   A single integrated user experience with strong identity guarantees and efficient market operations.
