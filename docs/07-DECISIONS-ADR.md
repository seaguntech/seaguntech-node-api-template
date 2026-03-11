# Architecture Decision Records (ADR)

Use this file to track major technical decisions.

## ADR-001: Core Framework

- Status: Accepted
- Date: 2026-03-06
- Decision: Use NestJS as core framework.
- Rationale: strong modular model, mature ecosystem, team-friendly conventions.
- Consequences: follow Nest module/provider patterns and dependency injection idioms.

## ADR-002: API Style

- Status: Accepted
- Date: 2026-03-06
- Decision: Use REST + OpenAPI.
- Rationale: straightforward adoption and clear API contracts for clients.

## ADR-003: Data Layer

- Status: Accepted
- Date: 2026-03-06
- Decision: Use Prisma + PostgreSQL.
- Rationale: type-safe queries, stable migration workflow, good DX.

## ADR-004: Validation Strategy

- Status: Accepted
- Date: 2026-03-06
- Decision: Use class-validator + class-transformer.
- Rationale: native NestJS integration and simple DTO-driven validation.

## ADR-005: Testing Framework

- Status: Accepted
- Date: 2026-03-06
- Decision: Use Vitest for unit, integration, and e2e.
- Rationale: fast execution and modern DX while keeping full test pyramid.

## ADR-006: Refresh Token Storage

- Status: Accepted
- Date: 2026-03-06
- Decision: Store refresh session state in Redis.
- Rationale: fast revocation checks and token rotation support.

## ADR-007: Deployment Baseline

- Status: Accepted
- Date: 2026-03-06
- Decision: Docker + GitHub Actions.
- Rationale: reproducible environments and simple CI integration.

## ADR Template

```txt
## ADR-XXX: <Title>
- Status: Proposed | Accepted | Deprecated
- Date: YYYY-MM-DD
- Context:
- Decision:
- Alternatives considered:
- Rationale:
- Consequences:
```
