# Dependency and toolchain policy

OpenSAM is an npm workspaces monorepo. The lockfile at the repository root is authoritative for reproducible development and CI.

## Supported development runtime

- Node.js 22.12 or newer.
- Node.js 22 and 24 are exercised in CI.
- The published SDK and scoring package runtime APIs remain separate from the web app's development-toolchain requirements.

## Security-sensitive toolchain

The CI baseline uses the Vite 8 / Vitest 5 toolchain and the current React plugin. This replaces the vulnerable Vite 5 / Vitest 2 development stack previously resolved by the lockfile. Root overrides keep the vulnerable transitive `minimatch` and PostCSS selector-parser ranges on patched releases.

## Lockfile workflow

For pull requests originating in this repository, the first CI job:

1. Resolves the declared workspace dependencies.
2. Applies only non-breaking fixes available to npm's current dependency ranges.
3. Commits a changed `package-lock.json` to the same PR branch.
4. Allows the Node 22 / 24 validation matrix to start only after that preparation completes.

The matrix then uses `npm ci`, runs `npm audit --audit-level=high`, builds every workspace, type-checks, tests, and runs pilot API contract/security tests.

For fork-originated pull requests, CI does not write to the contributor's branch. Contributors must update and commit the lockfile locally before requesting review.

## Local commands

```bash
npm ci
npm audit --audit-level=high
npm run build
npm run typecheck
npm test
npm run test:pilot
```

Use `npm audit fix` only for compatible updates. Do not use `npm audit fix --force` as a blanket remediation; major upgrades require explicit compatibility and test review.

## Automated maintenance

Dependabot groups related Vite/Vitest, ESLint/TypeScript-ESLint, and PostCSS updates weekly. Review the complete diff and CI results before merging.
