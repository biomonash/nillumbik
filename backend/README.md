# Backend Overview

The Nillumbik backend is a **Go-based REST API** built for the Nillumbik Shire project, designed to manage ecological observation data including sites, species, and wildlife observations. The backend follows a **clean architecture pattern** with clear separation of concerns.

## Quick start

Make sure you follow the _Quick start_ in [Project README](../README.md)

Run backend server (auto restart by Air):

```bash
make dev-backend
```

And open http://localhost:8000/swagger/index.html to test the API.

## Technology Stack

The backend uses modern Go technologies:

- **Gin Framework**: Fast HTTP router and middleware
- **PostgreSQL with PostGIS**: Geospatial database support
- **SQLC**: Type-safe SQL query generation
- **Swagger/OpenAPI**: Automatic API documentation
- **Air**: Hot reloading during development

## Directory Structure

### Core Application (`/cmd`)

- **`cmd/api/`**: Main API server entry point
- **`cmd/importer/`**: Data import utilities

You should keep minimal code in this directory.
It should be only used to create executive file and relative logic, like create HTTP server, shell arguments handling.

### Internal Modules (`/internal`)

The backend follows a domain-driven design with these modules:

- **`internal/config/`**: Configuration management
- **`internal/db/`**: Generated database queries (via SQLC)
  - **DO NOT EDIT MANUALLY**
  - Update by `make sqlc-generate`
- **`internal/observation/`**: Wildlife observation management
  - Handles `/api/observations/*`
- **`internal/site/`**: Monitoring site management
  - Handles `/api/sites/*`
- **`internal/species/`**: Species catalog management
  - Handles `/api/species/*`
- **`internal/importer/`**: Data import logic
  - Used by `cmd/importer`
- **`internal/utils/`**: Shared utilities

### Database (`/db`)

- **`db/migrations/`**: SQL schema migrations
  - Use `make db-migrate-up` (or `-down`) to run the migrations
  - Use `make db-migrate-create` to create a new migration file
- **`db/queries/`**: Raw SQL queries for SQLC generation
- **`db/seed.sql`**: Initial data seeding

**Every time updating `*.sql` should run `make sqlc-generate`.**

### Documentation (`/docs`)

- Auto-generated Swagger documentation files
- Written as doc comments in each controller function
- Run `make gen-doc` each time you modify the comment

## Database Schema

The system manages three core entities with PostGIS spatial support:

**Core Tables:**

1. **Sites**: Monitoring locations with geospatial coordinates, tenure, and forest type
2. **Species**: Catalog of wildlife with taxonomic classification and conservation status
3. **Observations**: Wildlife sightings linked to sites and species with environmental data

## API Architecture

The API follows RESTful principles with:

- **Dependency Injection**: Controllers receive database queriers
- **Modular Routing**: Each domain registers its own routes
- **Swagger Integration**: Automatic API documentation at `/swagger/*`
- **Environment Configuration**: Development environment via `.env.dev`

## Error Handling Strategy

The backend implements a **centralized error handling strategy** with clear separation between user and server errors:

### Error Types

**User Errors (4xx)**: Client-side issues that can be resolved by the user

- Invalid request parameters
- Resource not found (404)
- Validation failures
- Bad request format

**Server Errors (5xx)**: Unexpected server-side issues

- Database connection failures
- Internal processing errors
- Unexpected system failures

### Implementation Pattern

All controllers follow a consistent error handling pattern:

```go
// User errors - use HttpError with appropriate status code
if err := c.ShouldBindQuery(&req); err != nil {
    c.Error(utils.NewHttpError(http.StatusBadRequest, "Invalid query parameters", err))
    return
}

// Server errors - use fmt.Errorf with proper wrapping
if err != nil {
    c.Error(fmt.Errorf("failed to fetch data: %w", err))
    return
}
```

### Middleware Processing

The `errorHandler()` middleware automatically:

- Converts `HttpError` types to structured JSON responses with appropriate status codes
- Converts generic errors to 500 Internal Server Error responses
- Provides consistent error response format across all endpoints

### Error Response Format

```json
{
  "code": 400,
  "message": "Invalid query parameters",
  "detail": "validation error details"
}
```

## Development Features

- **Hot Reloading**: Air configuration for rapid development
- **Type Safety**: SQLC generates type-safe Go code from SQL queries
- **API Documentation**: Swagger annotations provide interactive documentation
- **Database Migrations**: Version-controlled schema changes

## Key Features

1. **Geospatial Support**: PostGIS integration for location-based queries
2. **Environmental Data**: Temperature, observation methods, and narrative logging
3. **Species Management**: Native/non-native classification, conservation indicators
4. **Flexible Observations**: Multiple detection methods (audio, camera, visual)
5. **Data Import Pipeline**: Dedicated importer for bulk data loading

## Dev References

- [Gin API](https://gin-gonic.com/en/docs/): Especially [Data binding](https://gin-gonic.com/en/docs/examples/bind-query-or-post/)
- [Validator](https://pkg.go.dev/github.com/go-playground/validator/v10#section-readme): Write `binding:` struct tags for controllers
- [SQLC](https://docs.sqlc.dev/en/stable/index.html): Especially [Configuration](https://docs.sqlc.dev/en/stable/reference/config.html) and [Data type](https://docs.sqlc.dev/en/stable/reference/datatypes.html)
- [Swaggo declarative comments format](https://github.com/swaggo/swag?tab=readme-ov-file#declarative-comments-format)
