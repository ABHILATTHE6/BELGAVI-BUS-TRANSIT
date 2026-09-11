# Testing Guide

The project uses Node's built-in test runner together with `tsx` so API validation helpers can be tested without adding a large test framework.

## Run Tests

```bash
npm test
```

## Static Checks

```bash
npm run lint
npm run build
```

## Test Structure

```text
src/utils/
├── apiValidation.ts
└── apiValidation.test.ts
```

The current tests cover:

- search-query normalization
- pagination limits
- passenger-count validation
- geographic coordinate validation
- supported bus-status values

## CI

GitHub Actions runs type checking, unit tests, and the production build for pushes to `main`/`dev` and pull requests targeting `main`.

## Future Coverage

The next testing layers should cover HTTP endpoint contracts, authentication behavior, telemetry simulation, route filtering, database repositories, and critical React user flows.
