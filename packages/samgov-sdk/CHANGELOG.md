# Changelog

## [1.1.0] — 2026-09-16

### Changed
- Renamed npm package to `@opensam/sdk` (scoped).
- Repository field now points to the consolidated monorepo.
- Updated internal imports to use `.js` extensions consistently (Node ESM compatibility).
- Added `labelFromScore` static method (referenced in tests).

## [1.0.0] — 2026-03-31

### Added
- Initial release: `createClient` factory, `SamGovClient` class.
- Search with filters: query, NAICS, notice type, agency, set-aside, dates, active-only.
- Async iterator `searchAll` for automatic pagination.
- Built-in scoring via static `SamGovClient.scoreOpportunity` method.
- Typed errors: `SamApiError`, `SamRateLimitError`, `SamTimeoutError`.
- Zero runtime dependencies, Node 18+ compatible.
- GitHub Actions CI (Node 18, 20, 22) and Release (npm publish on tag).
- Vitest unit tests for client factory and scoring engine.
