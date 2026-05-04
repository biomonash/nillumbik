# Nillumbik Shire Project

## Overview

A data visualisation platform for wildlife observation data in [Nillumbik Shire](https://nillumbik.vic.gov.au)

[Check Life Demo](https://nillumbik.wancat.cc)

## Project Structure

```
├── backend/        # Go API server
├── frontend/       # TypeScript frontend
├── docker/         # Docker compose files
└── Makefile        # Build automation
```

## Frontend Quick Start

### Requirements

* Node.js: version 24
* Yarn: 1.22


    cd frontend
    yarn install
    yarn dev

*Note: You don't need to install Docker and database to develop frontend. You will connect to the demo server backend.*

## Backend Quick Start

### Requirements

* Go: 1.24 or later
* Make
* Docker

We use Make as command runner

```bash
# Setup development environment
make setup-dev

# Install dependencies
make install

# Start database
make docker-up

# Migrate database
make db-migrate-up

# Seed database with sample values
make db-seed

# Start development servers
make dev
```

Backend API documents: http://localhost:8000/swagger/index.html

### Import Data

Put the detections CSV file in `backend/data/nillumbik.csv` and run the following:

```
make run-import
```

## Available Commands

### Development
- `make dev` - Start both backend and frontend dev servers
- `make build` - Build both projects
- `make test` - Run all tests
- `make check` - Run linting, tests, and build

### Backend (Go)
- `make run-backend` - Run Go backend
- `make run-import` - Run CSV importer `cmd/importer/main.go`
- `make sqlc-generate` - Generate code from SQL (only required when schema changed)
- `make gen-doc` - Generate Swagger API documents from comments (See [swaggo document](https://github.com/swaggo/swag?tab=readme-ov-file#declarative-comments-format))
- `make test-backend-coverage` - Run tests with coverage

### Frontend (TypeScript)
- `make init-frontend` - Initialize new React+TypeScript frontend
- `make dev-frontend` - Start frontend dev server

### Database
- `make docker-up` - Start PostgreSQL database
- `make docker-down` - Stop PostgreSQL database
- `make db-migrate-up` - Run database migrations
- `make db-migrate-down` - Revert database migrations
- `make db-migrate-create name=[migration name]` - Create new migration files

### Utilities
- `make help` - Show all available commands
- `make clean` - Clean build artifacts
