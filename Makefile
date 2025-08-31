# Nillumbik Monorepo Makefile
# Supports both Go backend and TypeScript frontend

# Load environment and export to all commands
include .env.dev
export

# Variables
BINARY_NAME=nillumbik
BACKEND_DIR=backend
FRONTEND_DIR=frontend
DOCKER_DIR=docker
GO_MAIN=cmd/api/main.go
DOCKER_COMPOSE_FILE=docker/docker-compose.yml
# POSTGRESQL_URL=postgres://biom:supersecretpassword@localhost:5432/nillumbik?sslmode=disable

# Colors for output
GREEN=\033[0;32m
YELLOW=\033[0;33m
RED=\033[0;31m
NC=\033[0m # No Color

.PHONY: help
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# =============================================================================
# Development Commands
# =============================================================================

.PHONY: install
install: install-backend install-frontend ## Install all dependencies

.PHONY: dev
dev: ## Start development servers for both backend and frontend
	@printf "$(GREEN)Starting development environment...$(NC)\n"
	@$(MAKE) dev-backend dev-frontend

.PHONY: build
build: build-backend build-frontend ## Build both backend and frontend

.PHONY: clean
clean: clean-backend clean-frontend ## Clean all build artifacts

.PHONY: test
test: test-backend test-frontend ## Run all tests

.PHONY: lint
lint: lint-backend lint-frontend ## Run all linters

.PHONY: format
format: format-backend format-frontend ## Format all code

# =============================================================================
# Backend (Go) Commands
# =============================================================================

.PHONY: install-backend
install-backend: ## Install Go dependencies
	@printf "$(GREEN)Installing Go dependencies...$(NC)\n"
	@cd $(BACKEND_DIR) && go mod download
	@cd $(BACKEND_DIR) && go mod tidy

.PHONY: build-backend
build-backend: ## Build the Go backend
	@printf "$(GREEN)Building Go backend...$(NC)\n"
	@cd $(BACKEND_DIR) && go build -o ../$(BINARY_NAME) $(GO_MAIN)

.PHONY: run-backend
run-backend: ## Run the Go backend directly
	@printf "$(GREEN)Running Go backend...$(NC)\n"
	@cd $(BACKEND_DIR) && go run $(GO_MAIN)

.PHONY: dev-backend
dev-backend: ## Start backend in development mode with hot reload (requires air)
	@printf "$(GREEN)Starting backend development server...$(NC)\n"
	@if command -v air >/dev/null 2>&1; then \
		cd $(BACKEND_DIR) && air; \
	else \
		printf "$(YELLOW)Air not installed. Install with: go install github.com/air-verse/air@latest$(NC)\n"; \
		printf "$(YELLOW)Running without hot reload...$(NC)\n"; \
		$(MAKE) run-backend; \
	fi

.PHONY: test-backend
test-backend: ## Run Go tests
	@printf "$(GREEN)Running Go tests...$(NC)\n"
	@cd $(BACKEND_DIR) && go test -v ./...

.PHONY: test-backend-coverage
test-backend-coverage: ## Run Go tests with coverage
	@printf "$(GREEN)Running Go tests with coverage...$(NC)\n"
	@cd $(BACKEND_DIR) && go test -v -coverprofile=coverage.out ./...
	@cd $(BACKEND_DIR) && go tool cover -html=coverage.out -o coverage.html
	@printf "$(GREEN)Coverage report generated: $(BACKEND_DIR)/coverage.html$(NC)\n"

.PHONY: lint-backend
lint-backend: ## Run Go linter
	@printf "$(GREEN)Running Go linter...$(NC)\n"
	@if command -v golangci-lint >/dev/null 2>&1; then \
		cd $(BACKEND_DIR) && golangci-lint run; \
	else \
		printf "$(YELLOW)golangci-lint not installed. Install from: https://golangci-lint.run/usage/install/$(NC)\n"; \
		printf "$(YELLOW)Running go vet instead...$(NC)\n"; \
		cd $(BACKEND_DIR) && go vet ./...; \
	fi

.PHONY: format-backend
format-backend: ## Format Go code
	@printf "$(GREEN)Formatting Go code...$(NC)\n"
	@cd $(BACKEND_DIR) && go fmt ./...

.PHONY: clean-backend
clean-backend: ## Clean Go build artifacts
	@printf "$(GREEN)Cleaning Go build artifacts...$(NC)\n"
	@cd $(BACKEND_DIR) && go clean
	@rm -f $(BINARY_NAME)
	@rm -f $(BACKEND_DIR)/coverage.out $(BACKEND_DIR)/coverage.html

# =============================================================================
# Database Commands
# =============================================================================

.PHONY: sqlc-generate
sqlc-generate: ## Generate Go code from SQL using sqlc
	@printf "$(GREEN)Generating Go code from SQL...$(NC)\n"
	@if command -v sqlc >/dev/null 2>&1; then \
		cd $(BACKEND_DIR) && sqlc generate; \
	else \
		printf "$(RED)sqlc not installed. Install from: https://docs.sqlc.dev/en/latest/overview/install.html$(NC)\n"; \
		exit 1; \
	fi

.PHONY: db-migrate-up
db-migrate-up: ## Run database migrations up (requires golang-migrate)
	@printf "$(GREEN)Running database migrations up...$(NC)\n"
	@if command -v migrate >/dev/null 2>&1; then \
		cd $(BACKEND_DIR) && migrate -path db/migrations -database $(DB_URL) up; \
	else \
		printf "$(RED)golang-migrate not installed. Install from: https://github.com/golang-migrate/migrate$(NC)\n"; \
		exit 1; \
	fi

.PHONY: db-migrate-down
db-migrate-down: ## Run database migrations down (requires golang-migrate)
	@printf "$(YELLOW)Running database migrations down...$(NC)\n"
	@if command -v migrate >/dev/null 2>&1; then \
		cd $(BACKEND_DIR) && migrate -path db/migrations -database $(DB_URL) down; \
	else \
		printf "$(RED)golang-migrate not installed. Install from: https://github.com/golang-migrate/migrate$(NC)\n"; \
		exit 1; \
	fi

.PHONY: db-migrate-create
db-migrate-create: ## Create a new migration file (usage: make db-migrate-create name=migration_name)
	@if [ -z "$(name)" ]; then \
		printf "$(RED)Error: Migration name not provided. Usage: make db-migrate-create name=migration_name$(NC)\n"; \
		exit 1; \
	fi
	@printf "$(GREEN)Creating new migration file: $(name)...$(NC)\n"
	@if command -v migrate >/dev/null 2>&1; then \
		cd $(BACKEND_DIR) && migrate create -ext sql -dir db/migrations -seq $(name); \
	else \
		printf "$(RED)golang-migrate not installed. Install from: https://github.com/golang-migrate/migrate$(NC)\n"; \
		exit 1; \
	fi

.PHONY: db-seed
db-seed:
		docker compose -f $(DOCKER_COMPOSE_FILE) exec -T db psql $(DB_URL) < $(BACKEND_DIR)/db/seed.sql

# =============================================================================
# Frontend (TypeScript) Commands
# =============================================================================

.PHONY: install-frontend
install-frontend: ## Install Node.js dependencies
	@if [ -f "$(FRONTEND_DIR)/package.json" ]; then \
		printf "$(GREEN)Installing Node.js dependencies...$(NC)\n"; \
		cd $(FRONTEND_DIR) && npm install; \
	else \
		printf "$(YELLOW)No package.json found in $(FRONTEND_DIR). Skipping frontend installation.$(NC)\n"; \
	fi

.PHONY: build-frontend
build-frontend: ## Build the TypeScript frontend
	@if [ -f "$(FRONTEND_DIR)/package.json" ]; then \
		printf "$(GREEN)Building TypeScript frontend...$(NC)\n"; \
		cd $(FRONTEND_DIR) && npm run build; \
	else \
		printf "$(YELLOW)No package.json found in $(FRONTEND_DIR). Skipping frontend build.$(NC)\n"; \
	fi

.PHONY: dev-frontend
dev-frontend: ## Start frontend in development mode
	@if [ -f "$(FRONTEND_DIR)/package.json" ]; then \
		printf "$(GREEN)Starting frontend development server...$(NC)\n"; \
		cd $(FRONTEND_DIR) && npm run dev; \
	else \
		printf "$(YELLOW)No package.json found in $(FRONTEND_DIR). Skipping frontend dev server.$(NC)\n"; \
	fi

.PHONY: test-frontend
test-frontend: ## Run TypeScript/JavaScript tests
	@if [ -f "$(FRONTEND_DIR)/package.json" ]; then \
		printf "$(GREEN)Running frontend tests...$(NC)\n"; \
		cd $(FRONTEND_DIR) && npm test; \
	else \
		printf "$(YELLOW)No package.json found in $(FRONTEND_DIR). Skipping frontend tests.$(NC)\n"; \
	fi

.PHONY: lint-frontend
lint-frontend: ## Run frontend linter
	@if [ -f "$(FRONTEND_DIR)/package.json" ]; then \
		printf "$(GREEN)Running frontend linter...$(NC)\n"; \
		cd $(FRONTEND_DIR) && npm run lint; \
	else \
		printf "$(YELLOW)No package.json found in $(FRONTEND_DIR). Skipping frontend linting.$(NC)\n"; \
	fi

.PHONY: format-frontend
format-frontend: ## Format frontend code
	@if [ -f "$(FRONTEND_DIR)/package.json" ]; then \
		printf "$(GREEN)Formatting frontend code...$(NC)\n"; \
		cd $(FRONTEND_DIR) && npm run format; \
	else \
		printf "$(YELLOW)No package.json found in $(FRONTEND_DIR). Skipping frontend formatting.$(NC)\n"; \
	fi

.PHONY: clean-frontend
clean-frontend: ## Clean frontend build artifacts
	@if [ -f "$(FRONTEND_DIR)/package.json" ]; then \
		printf "$(GREEN)Cleaning frontend build artifacts...$(NC)\n"; \
		cd $(FRONTEND_DIR) && rm -rf dist build node_modules/.cache; \
	else \
		printf "$(YELLOW)No package.json found in $(FRONTEND_DIR). Skipping frontend cleanup.$(NC)\n"; \
	fi

# =============================================================================
# Docker Commands
# =============================================================================

.PHONY: docker-up
docker-up: ## Start Docker services
	@printf "$(GREEN)Starting Docker services...$(NC)\n"
	@docker compose -f $(DOCKER_COMPOSE_FILE) up -d

.PHONY: docker-down
docker-down: ## Stop Docker services
	@printf "$(GREEN)Stopping Docker services...$(NC)\n"
	@docker compose -f $(DOCKER_COMPOSE_FILE) down

.PHONY: docker-logs
docker-logs: ## Show Docker service logs
	@docker compose -f $(DOCKER_COMPOSE_FILE) logs -f

.PHONY: docker-build
docker-build: ## Build Docker images
	@printf "$(GREEN)Building Docker images...$(NC)\n"
	@docker compose -f $(DOCKER_COMPOSE_FILE) build

.PHONY: docker-clean
docker-clean: ## Clean Docker resources
	@printf "$(GREEN)Cleaning Docker resources...$(NC)\n"
	@docker compose -f $(DOCKER_COMPOSE_FILE) down --volumes --rmi all

# =============================================================================
# Utility Commands
# =============================================================================

.PHONY: setup-dev
setup-dev: ## Setup development environment
	@printf "$(GREEN)Setting up development environment...$(NC)\n"
	@echo "Installing development tools..."
	@printf "$(YELLOW)Recommended tools to install:$(NC)\n"
	go install github.com/air-verse/air@v1.62.0
	go install github.com/sqlc-dev/sqlc/cmd/sqlc@v1.29.0
	go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@v4.19.0
	@$(MAKE) install

.PHONY: check
check: ## Run all checks (lint, test, build)
	@printf "$(GREEN)Running all checks...$(NC)\n"
	@$(MAKE) lint
	@$(MAKE) test
	@$(MAKE) build

.PHONY: init-frontend
init-frontend: ## Initialize a new TypeScript frontend (using Vite + React)
	@printf "$(GREEN)Initializing TypeScript frontend...$(NC)\n"
	@if [ ! -f "$(FRONTEND_DIR)/package.json" ]; then \
		npm create vite@latest $(FRONTEND_DIR) -- --template react-ts; \
		printf "$(GREEN)Frontend initialized! Run 'make install-frontend' to install dependencies.$(NC)\n"; \
	else \
		printf "$(YELLOW)Frontend already exists!$(NC)\n"; \
	fi

# Legacy compatibility (matches your original Makefile)
.PHONY: run docker
run: run-backend ## Legacy: Run backend (same as run-backend)
docker: ## Legacy: Pass arguments to docker-compose
	@docker compose -f $(DOCKER_COMPOSE_FILE) $(filter-out $@,$(MAKECMDGOALS))

# Prevent make from interpreting docker arguments as targets
%:
	@:
