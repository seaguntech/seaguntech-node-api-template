# DevOps and CI/CD Plan

## 1) Local Development Stack

Docker Compose services:

- `api`
- `postgres`
- `redis`

## 2) Docker Build Strategy

- multi-stage Dockerfile
- production image includes only runtime artifacts
- healthcheck command for container readiness

## 3) GitHub Actions Workflows

- `lint-typecheck.yml`
- `unit-test.yml`
- `integration-e2e.yml`
- `build.yml`

## 4) CI Quality Gates

- lint must pass
- type-check must pass
- unit, integration, e2e must pass
- build image must pass

## 5) Environment Strategy

- `.env.example` for local guidance
- `.env.test` for automated tests
- secrets managed via GitHub Actions secrets

## 6) Release Baseline

- merge to main triggers build validation
- optional tag-based image publish strategy
- changelog generated from conventional commits (future enhancement)

## 7) Branch Protection Baseline

Required status checks before merge:

- `Lint and Typecheck / lint-typecheck`
- `Unit Tests / unit-test`
- `Integration and E2E Tests / integration-e2e`
- `Build / build`

Recommended repository settings:

- require pull request review before merge
- require branch to be up to date before merge
- block force-push and branch deletion on `main`

## 8) Repository Setup Steps

To finish CI/CD finalization in GitHub repository settings:

1. Go to `Settings -> Branches -> Branch protection rules`.
2. Add rule for `main`.
3. Enable:
   - require pull request before merging,
   - require approvals,
   - require status checks to pass before merging,
   - require branches to be up to date before merging,
   - disable force pushes,
   - disable branch deletion.
4. Select required checks listed in section 7.
