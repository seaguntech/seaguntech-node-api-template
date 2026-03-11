# Release Checklist

Use this checklist before tagging or promoting a release.

## 1) Code Quality Gates

- `pnpm run lint` passes
- `pnpm run typecheck` passes
- `pnpm run test` passes
- `pnpm run build` passes

## 2) Data Safety

- Prisma migrations are generated and reviewed
- `npm run prisma:migrate:deploy` tested against target environment
- backward compatibility for schema changes reviewed

## 3) Security and Auth

- auth endpoints still pass integration suite
- secrets are set in target environment
- no secrets committed in repository

## 4) CI/CD Gates

- `Lint and Typecheck` green
- `Unit Tests` green
- `Integration and E2E Tests` green
- `Build` green

## 5) Release Notes

- summarize user-facing changes
- include migration notes if applicable
- include rollback steps

## 6) Post-Release Verification

- health endpoint: `/api/v1/health/live`
- readiness endpoint: `/api/v1/health/ready`
- smoke test auth login and profile
