# DataSov Solana Component Makefile

.PHONY: help build test deploy clean install lint format

# Default target
help:
	@echo "DataSov Solana Component - Available commands:"
	@echo "  build     - Build the Solana program and TypeScript SDK"
	@echo "  test      - Run all tests"
	@echo "  deploy    - Deploy to devnet"
	@echo "  deploy-local - Deploy to localnet"
	@echo "  clean     - Clean build artifacts"
	@echo "  install   - Install dependencies"
	@echo "  lint      - Run linter"
	@echo "  format    - Format code"
	@echo "  example   - Run basic usage example"

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install
	@echo "Dependencies installed successfully!"

# Build the program and SDK
build:
	@echo "Building Solana program..."
	anchor build
	@echo "Building TypeScript SDK..."
	npm run build
	@echo "Build completed successfully!"

# Run tests
test:
	@echo "Running tests..."
	anchor test
	@echo "Tests completed!"

# Deploy to devnet
deploy:
	@echo "Deploying to devnet..."
	anchor deploy --provider.cluster devnet
	@echo "Deployment completed!"

# Deploy to localnet
deploy-local:
	@echo "Deploying to localnet..."
	anchor deploy --provider.cluster localnet
	@echo "Local deployment completed!"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf target/
	rm -rf dist/
	rm -rf node_modules/
	@echo "Clean completed!"

# Run linter
lint:
	@echo "Running linter..."
	npx eslint src/ tests/ examples/ --ext .ts,.js
	@echo "Linting completed!"

# Format code
format:
	@echo "Formatting code..."
	npx prettier --write "src/**/*.{ts,js}"
	npx prettier --write "tests/**/*.{ts,js}"
	npx prettier --write "examples/**/*.{ts,js}"
	@echo "Formatting completed!"

# Run example
example:
	@echo "Running basic usage example..."
	npx ts-node examples/basic-usage.ts
	@echo "Example completed!"

# Start local validator
validator:
	@echo "Starting local Solana validator..."
	solana-test-validator --reset

# Setup development environment
setup: install
	@echo "Setting up development environment..."
	@if [ ! -f ~/.config/solana/id.json ]; then \
		echo "Creating Solana keypair..."; \
		solana-keygen new --no-bip39-passphrase --silent; \
	fi
	@echo "Development environment setup completed!"

# Full development cycle
dev: clean install build test
	@echo "Development cycle completed!"

# Production build
prod: clean install build
	@echo "Production build completed!"

# Quick test (build + test)
quick-test: build test
	@echo "Quick test completed!"

# Deploy and test
deploy-test: deploy test
	@echo "Deploy and test completed!"
