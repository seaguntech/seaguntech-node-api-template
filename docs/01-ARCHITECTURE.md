# Architecture Blueprint

## 1) Architecture Style

`Modular Monolith` with clean module boundaries.

Why:

- easier team onboarding,
- strong maintainability,
- ready for future extraction into services.

## 2) Layered Flow

Standard flow per feature:

`Controller -> Application Service -> Repository -> Prisma -> PostgreSQL`

Cross-cutting:

- `Guards` for auth,
- `Pipes` for validation,
- `Interceptors` for response/logging,
- `Filters` for exception mapping.

## 3) Module Boundaries

Baseline modules:

- `health`
- `auth`
- `users`
- `system`
- `shared/common` infrastructure

Rules:

- no direct cross-module repository access,
- inter-module calls via service contracts only,
- shared utilities live in `common`.

## 4) Proposed Directory Structure

```txt
src/
  main.ts
  app.module.ts
  common/
    decorators/
    exceptions/
    filters/
    guards/
    interceptors/
    pipes/
  config/
    env.schema.ts
    configuration.ts
  infrastructure/
    database/
      prisma.service.ts
      prisma.module.ts
    cache/
      redis.module.ts
      redis.service.ts
    logger/
  modules/
    health/
    auth/
    users/
    system/
```

## 5) API Conventions

- Base prefix: `/api`
- Versioning: URI-based (`/api/v1/...`)
- Response envelope:
  - success: `{ message, data, meta? }`
  - error: `{ statusCode, code, error, message, traceId? }`
- List endpoints must include pagination.

## 6) Caching Pattern

- Redis as centralized cache provider
- cache keys convention:
  - `module:resource:id`
  - `module:list:query-hash`
- explicit cache invalidation on write operations

## 7) Non-functional Baseline

- strict TypeScript
- structured logs with request id
- graceful shutdown
- health endpoints for readiness/liveness
