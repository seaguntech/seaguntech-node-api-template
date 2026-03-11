# Module Blueprint

## 1) Goal

Provide a repeatable, strict module pattern for all business domains.

## 2) Module Structure

```txt
modules/<feature>/
  <feature>.module.ts
  controllers/
    <feature>.controller.ts
  services/
    <feature>.service.ts
  repositories/
    <feature>.repository.ts
  dto/
    create-<feature>.dto.ts
    update-<feature>.dto.ts
    query-<feature>.dto.ts
```

## 3) Responsibilities

- Controller: HTTP transport and route decorators only
- Service: business use-cases and orchestration
- Repository: data access and query concerns only
- DTO: request/response contracts and validation metadata

## 4) Standard Endpoint Set (for CRUD modules)

- `POST /api/v1/<features>`
- `GET /api/v1/<features>` with pagination
- `GET /api/v1/<features>/:id`
- `PATCH /api/v1/<features>/:id`
- `DELETE /api/v1/<features>/:id`

## 5) Pagination Contract

Required query params:

- `page`
- `limit`

Optional query params:

- `sortBy`
- `sortOrder`

Response meta:

- `meta.page`
- `meta.limit`
- `meta.total`
- `meta.totalPages`

## 6) Error Handling Contract

- use domain-friendly error codes
- map internal exceptions via global filter
- avoid leaking stack traces to clients

## 7) Naming Rules

- feature names in kebab-case for routes
- class names in PascalCase
- files in kebab-case
