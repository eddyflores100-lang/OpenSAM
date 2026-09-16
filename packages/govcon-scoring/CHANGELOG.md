# Changelog

## [1.1.0] — 2026-09-16

### Changed
- Renamed npm package to `@opensam/scoring` (scoped).
- Repository field now points to the consolidated monorepo.
- Added `exports` field in `package.json` for proper ESM/CJS resolution.

## [1.0.0] — 2026-03-28

### Added
- Initial release: `scoreOpportunity` and `scoreWithBreakdown` functions.
- Scoring factors: NAICS match (+25), set-aside alignment (+10 to +15), capability keywords (+5 each, max +20), deadline proximity (-15 to -35).
- Base score 50, clamped to 0–100.
- Vitest unit tests covering all factors.
- MIT license, README, GitHub Actions CI and Release.
