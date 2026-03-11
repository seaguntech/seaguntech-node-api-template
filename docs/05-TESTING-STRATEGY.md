# Testing Strategy

## 1) Test Pyramid

- Unit tests: service logic, helpers, guards
- Integration tests: repository + database interactions
- E2E tests: full HTTP flow with app bootstrap

## 2) Frameworks and Tools

- Vitest as the test runner
- Supertest for HTTP assertions
- Dedicated env files for integration/e2e

## 3) Test Folders

```txt
test/
  unit/
  integration/
    setup/
  e2e/
    setup/
```

## 4) Database Test Isolation

- integration/e2e should use isolated schema or isolated test database
- run migrations before suites
- cleanup after suites to keep tests deterministic

## 5) Minimum Coverage Goals

- global: 80%+
- critical auth and permission paths: 90%+

## 6) Required Cases

- happy path
- validation failures
- unauthorized and forbidden scenarios
- not found and conflict scenarios
- cache hit and cache invalidation behavior

## 7) CI Test Gates

- run unit on every PR
- run integration and e2e on every PR
- fail fast on flaky test detection patterns
