# Contributing to Device Tracking

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/device-tracking.git
   cd device-tracking
   ```
3. **Install dependencies:**
   ```bash
   pnpm install
   ```
4. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase credentials
   ```
5. **Create a branch** from `staging`:
   ```bash
   git checkout staging
   git pull origin staging
   git checkout -b feat/your-feature-name
   ```

## Branch Strategy

| Branch    | Purpose                                      |
| --------- | -------------------------------------------- |
| `main`    | Production-ready code, deployed automatically |
| `staging` | Integration branch, pre-production testing    |
| `feat/*`  | New features                                  |
| `fix/*`   | Bug fixes                                     |
| `docs/*`  | Documentation changes                         |

- **Never push directly** to `main` or `staging` — always open a Pull Request.
- All PRs should target `staging` unless it's a hotfix for production.

## Pull Request Process

1. Ensure your code passes linting: `pnpm lint`
2. Ensure the project builds: `pnpm build`
3. Update documentation if you've changed any public APIs or behavior
4. Fill in the PR template completely
5. Request a review from a maintainer
6. PRs require at least **1 approving review** before merge

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add device category filter to inventory page
fix: resolve QR scanner crash on iOS Safari
docs: update README with new environment variables
refactor: extract device form into custom hook
```

Prefixes: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`

## Code Style

- TypeScript strict mode — no `any` types without justification
- Use server actions for data mutations (`src/server/`)
- Use TanStack Query for server state
- Use `nuqs` for URL-based state
- Follow existing patterns in the codebase

## Reporting Bugs

Use the [Bug Report](https://github.com/deveshmanani/device-tracking/issues/new?template=bug_report.md) issue template.

## Requesting Features

Use the [Feature Request](https://github.com/deveshmanani/device-tracking/issues/new?template=feature_request.md) issue template.

## Security Issues

**Do not open a public issue.** See [SECURITY.md](./SECURITY.md) for responsible disclosure instructions.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
