# Development Guide

## Prerequisites

- Node.js 20+ recommended
- npm
- Git
- A PostgreSQL instance when database-backed features are enabled
- A Gemini API key only when the AI assistant is enabled

## Installation

```bash
npm install
```

## Environment

Copy `.env.example` to `.env` and provide values for the services you use.

Never commit `.env` or API credentials.

## Development

```bash
npm run dev
```

The development server starts the application through `server.ts`.

## Validation

Run TypeScript validation:

```bash
npm run lint
```

Build the application:

```bash
npm run build
```

Run the production bundle:

```bash
npm start
```

## Commit Convention

Use Conventional Commit-style messages:

- `feat:` new functionality
- `fix:` bug fixes
- `docs:` documentation
- `refactor:` code restructuring
- `test:` tests
- `ci:` automation
- `chore:` maintenance

## Pull Request Expectations

Before opening a PR:

1. Verify the application locally.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Explain the change and its user impact.
5. Add screenshots for significant UI changes.
6. Confirm that no secrets are included.
