# Contributing to OpenSAM

Thanks for your interest in contributing to OpenSAM. This document explains how to set up your environment and submit changes.

## Project layout

OpenSAM is an npm workspace monorepo. The three publishable packages live under `packages/`:

- `packages/sam-gov-types` — TypeScript type definitions
- `packages/samgov-sdk` — HTTP client and high-level API
- `packages/govcon-scoring` — Standalone scoring engine

The reference web app lives under `apps/web`.

Each package is independently versionable. Keep changes scoped: a fix to the scoring engine should not require changes to the SDK or types.

## Prerequisites

- Node.js 18+ (we test on 18, 20, and 22)
- npm 9+

## Setup

```bash
git clone https://github.com/eddyflores100-lang/OpenSAM.git
cd OpenSAM
npm install
```

This installs dependencies for the root and all workspaces.

## Development workflow

1. **Create a branch**

   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make your changes**

   - Each package has its own `src/`, `__tests__/`, and `package.json`.
   - Keep functions small and pure where possible.
   - Update tests in the same package.

3. **Run tests and type-check before committing**

   ```bash
   npm run typecheck
   npm test
   ```

   Both must pass for CI to go green.

4. **Commit message format**

   We use conventional commits:

   ```
   feat: add filter for socioeconomic set-aside
   fix: handle null description in scoring engine
   docs: clarify NAICS scoring weights
   chore: bump typescript devDependency
   ```

5. **Push and open a pull request**

   - Target the `main` branch.
   - Fill in the PR template (what, why, how, tests, screenshots if relevant).
   - Link any related issue.

## Testing guidelines

- **Unit tests are required** for any non-trivial change to `samgov-sdk` or `govcon-scoring`.
- Tests live in `src/__tests__/` next to the source they test.
- Tests use plain `console.assert`-style logging (no test runner required) so they run with `node --import tsx` directly. We also accept `vitest`-style tests.
- Run a single package's tests with:

   ```bash
   npm test --workspace @opensam/scoring
   ```

## Code style

- **TypeScript strict mode** everywhere — no `any` without a justification comment.
- **ESM** (`"type": "module"`).
- **No runtime dependencies** in published packages — only `devDependencies`.
- **JSDoc** on exported functions, types, and classes. The first sentence should be a complete description.
- **2-space indentation, single quotes for strings, no semicolons** (enforced by Prettier).

## Releasing

Releases are automated via GitHub Actions:

1. Tag a commit on `main` with `v1.2.3` format.
2. The `release.yml` workflow builds, tests, and publishes to npm.
3. A GitHub Release is created with auto-generated notes.

Only maintainers can push tags. If you're an external contributor, ask a maintainer to cut a release.

## Reporting issues

- Bugs: open a GitHub issue with a minimal reproduction.
- Feature requests: open a discussion first.
- Security: see [`SECURITY.md`](SECURITY.md) — do not open a public issue.

## Code of conduct

By participating, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).
