# Security Policy

## Supported versions

OpenSAM is currently in active development. Security fixes will be applied to the `main` branch and released as patch versions.

| Version | Supported |
|---|---|
| `main` branch | ✅ |
| Latest tagged release | ✅ |
| Older releases | ❌ |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, email `security@alicelabs.site` with:

1. A description of the vulnerability
2. Steps to reproduce (POC, code snippet, or detailed instructions)
3. The affected package(s) and version(s)
4. Suggested fix (optional but appreciated)

We will acknowledge receipt within 72 hours and aim to issue a fix within 30 days for high-severity issues.

## Scope

This policy covers the following packages in this repository:

- `@opensam/sam-gov-types`
- `@opensam/sdk`
- `@opensam/scoring`
- The `apps/web` reference application

Out of scope:

- Vulnerabilities in third-party dependencies (report them upstream)
- Issues that require privileged access to a target's infrastructure
- Theoretical issues without a working proof of concept

## Security best practices for users

- **Never commit your SAM.gov API key.** Use environment variables.
- **Rotate keys quarterly** via https://api.data.gov/signup/.
- **Use Supabase RLS** if you build a multi-user app on top of OpenSAM.
- **Encrypt PII at rest.** The reference app uses pgcrypto for this purpose.

## Disclosure policy

We follow a coordinated disclosure model:

1. Reporter privately discloses to `security@alicelabs.site`.
2. We acknowledge receipt and triage within 72 hours.
3. We work with the reporter to confirm and fix the issue.
4. Once a fix is released, we publish a GitHub Security Advisory and credit the reporter (if desired).
