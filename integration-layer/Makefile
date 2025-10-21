# DataSov Integration Layer Makefile

.PHONY: help install build start dev test lint format clean docker-build docker-run

# Default target
help:
	@echo "DataSov Integration Layer - Available Commands:"
	@echo ""
	@echo "  install     - Install dependencies"
	@echo "  build       - Build the project"
	@echo "  start       - Start the production server"
	@echo "  dev         - Start the development server"
	@echo "  test        - Run tests"
	@echo "  lint        - Run linter"
	@echo "  format      - Format code"
	@echo "  clean       - Clean build artifacts"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run  - Run Docker container"
	@echo ""

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install

# Build the project
build:
	@echo "Building the project..."
	npm run build

# Start production server
start: build
	@echo "Starting production server..."
	npm start

# Start development server
dev:
	@echo "Starting development server..."
	npm run dev

# Run tests
test:
	@echo "Running tests..."
	npm test

# Run linter
lint:
	@echo "Running linter..."
	npm run lint

# Format code
format:
	@echo "Formatting code..."
	npm run format

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist/
	rm -rf node_modules/
	rm -rf coverage/
	rm -rf logs/

# Build Docker image
docker-build:
	@echo "Building Docker image..."
	docker build -t datasov/integration-layer:latest .

# Run Docker container
docker-run:
	@echo "Running Docker container..."
	docker run -p 3000:3000 --env-file .env datasov/integration-layer:latest

# Setup development environment
setup: install
	@echo "Setting up development environment..."
	cp env.example .env
	@echo "Development environment setup complete!"
	@echo "Please edit .env file with your configuration."

# Run all checks
check: lint test
	@echo "All checks passed!"

# Deploy to staging
deploy-staging: build
	@echo "Deploying to staging..."
	# Add deployment commands here

# Deploy to production
deploy-production: build
	@echo "Deploying to production..."
	# Add deployment commands here




