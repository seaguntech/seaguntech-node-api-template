<img width="2048" height="256" alt="template-node-nesst" src="https://github.com/user-attachments/assets/391ff907-a5d8-4d21-86d3-b46fc76d7dda" />

# SeagunTech Node API Template

NestJS-based REST API template with OpenAPI, Prisma-ready architecture, Redis-ready auth session design, and Vitest test baseline.

## Tech Baseline

- NestJS
- REST + OpenAPI
- class-validator + class-transformer
- Vitest (unit and e2e)

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Start local infrastructure (PostgreSQL + Redis):

```bash
docker compose up -d
```

4. Generate Prisma client:

```bash
pnpm run prisma:generate
```

5. Start app:

```bash
pnpm run start:dev
```

## Endpoints

- Liveness: `GET /api/v1/health/live`
- Readiness: `GET /api/v1/health/ready`
- System info: `GET /api/v1/system/info`
- Auth register: `POST /api/v1/auth/register`
- Auth login: `POST /api/v1/auth/login`
- Auth refresh: `POST /api/v1/auth/refresh`
- Auth logout: `POST /api/v1/auth/logout`
- Auth profile: `GET /api/v1/auth/profile`
- Users create: `POST /api/v1/users`
- Users list (pagination): `GET /api/v1/users?page=1&limit=20`
- Users detail: `GET /api/v1/users/:userId`
- Users update: `PATCH /api/v1/users/:userId`
- Users delete: `DELETE /api/v1/users/:userId`
- Swagger: `GET /api/v1/docs`

## Swagger Basic Auth (optional)

- Set `DOCS_BASIC_AUTH_ENABLED=true` to protect `/api/docs` with basic auth.
- Set `DOCS_USERNAME` and `DOCS_PASSWORD` when enabling it.

## Test Commands

- Unit: `pnpm run test:unit`
- Integration: `pnpm run test:int`
- E2E: `pnpm run test:e2e`
- Unit coverage: `pnpm run test:cov:unit`
- All: `pnpm run test`

## CI Workflows

- Lint + typecheck: `.github/workflows/lint-typecheck.yml`
- Unit tests + coverage: `.github/workflows/unit-test.yml`
- Integration + e2e: `.github/workflows/integration-e2e.yml`
- Build: `.github/workflows/build.yml`

## Delivery Process

- PR template: `.github/pull_request_template.md`
- Release checklist: `docs/10-RELEASE-CHECKLIST.md`
- Branch protection guide: `docs/06-DEVOPS-CICD.md`

## Prisma Commands

- Generate client: `pnpm run prisma:generate`
- Run migration locally: `pnpm run prisma:migrate:dev`
- Deploy migration: `pnpm run prisma:migrate:deploy`
- Open Prisma Studio: `pnpm run prisma:studio`

## OpenAPI Client Generation

- Export OpenAPI spec: `pnpm run openapi:export`
- Clean generated client: `pnpm run gen:client:clean`
- Generate TypeScript client: `pnpm run gen:client`
- Verify spec/client synced (CI-friendly): `pnpm run openapi:check`
- Generator config: `openapi-config.yaml`
- Exported spec: `openapi/openapi.json`
- Generated SDK output: `generated/openapi-client`
