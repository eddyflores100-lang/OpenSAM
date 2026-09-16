# Changelog

All notable changes to OpenSAM will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Consolidated three packages (`sam-gov-types`, `samgov-sdk`, `govcon-scoring`) into a single npm workspace monorepo.
- New top-level README, SECURITY, LEGAL, CONTRIBUTING, and CODE_OF_CONDUCT docs.
- Root `package.json` with workspace configuration and shared devDependencies.
- Unified CI/CD workflow at the repository root.

## [1.0.0] — 2026-03-28

### Added
- Initial release of `sam-gov-types` v1.0.0 — TypeScript type definitions for the SAM.gov Public API.
- Initial release of `samgov-sdk` v1.0.0 — HTTP client with retries, rate-limit handling, async iteration, and integrated scoring.
- Initial release of `govcon-scoring` v1.0.0 — Deterministic viability scoring engine (NAICS + set-aside + capabilities + deadline).
- MIT license, professional README, GitHub Actions CI workflows.
