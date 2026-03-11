# Tech Stack

## 1) Core Runtime

- Node.js `22`
- TypeScript `strict`
- NestJS as application framework

## 2) API and Validation

- REST API
- OpenAPI via `@nestjs/swagger`
- Validation via `class-validator` + `class-transformer`
- Global `ValidationPipe` with safe defaults

## 3) Data and Persistence

- PostgreSQL
- Prisma ORM
- Prisma migrations for schema evolution

## 4) Auth and Security

- JWT access token
- JWT refresh token with rotation
- Refresh session storage: Redis
- Password hashing: argon2

## 5) Cache

- Redis cache module
- Cache manager integration for common read paths

## 6) Testing

- `Vitest` for unit, integration, e2e
- Supertest for e2e API assertions
- Separate setup files for integration/e2e environments

## 7) Developer Experience

- ESLint + Prettier
- Husky + lint-staged + commitlint
- Conventional commits

## 8) DevOps

- Docker multi-stage build
- Docker Compose for local stack: `api + postgres + redis`
- GitHub Actions for CI gates
