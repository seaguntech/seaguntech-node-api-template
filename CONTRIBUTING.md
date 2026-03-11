# Contributing to SeagunTech Node API Template

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/seaguntech-node-api-template.git`
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/your-feature`

## Development Setup

```bash
# Copy environment file
cp .env.example .env

# Start local infrastructure
docker compose up -d

# Generate Prisma client
pnpm run prisma:generate

# Run development server
pnpm run start:dev
```

## Code Quality

Before submitting a PR, ensure:

- [ ] `pnpm run lint` passes
- [ ] `pnpm run typecheck` passes
- [ ] `pnpm run test` passes (all test suites)
- [ ] `pnpm run build` passes
- [ ] `pnpm run openapi:check` passes

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix a bug
docs: update documentation
style: code style changes (formatting, semicolons)
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

## Testing

```bash
# Run all tests
pnpm run test

# Run specific test suite
pnpm run test:unit
pnpm run test:e2e
pnpm run test:int

# Run with coverage
pnpm run test:cov:unit
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all CI checks pass
4. Update the CHANGELOG if applicable
5. Request review from maintainers

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow

## Questions?

For questions, please open an issue or contact dev@seaguntech.com
