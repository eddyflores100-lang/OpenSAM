# @opensam/scoring

Deterministic viability scoring engine for federal contract opportunities. No AI credits required.

Part of the [OpenSAM](https://github.com/eddyflores100-lang/OpenSAM) monorepo.

## What it does

Scores federal contract opportunities (0–100) against your company profile using:

- **NAICS code matching** — does the opportunity's primary NAICS match yours?
- **Set-aside alignment** — does your company hold the certification the set-aside requires?
- **Capability keywords** — are your capabilities mentioned in the opportunity description?
- **Deadline proximity** — is there enough time to write a competitive proposal?

## Install

```bash
npm install @opensam/scoring
```

## Usage

```typescript
import { scoreOpportunity, scoreWithBreakdown } from '@opensam/scoring'

const profile = {
  name: 'Acme Federal LLC',
  naicsCodes: ['541511', '541512', '541519'],
  capabilities: ['software development', 'cloud infrastructure', 'react', 'node.js'],
  certifications: ['Small Business', 'SBA 8(a)'],
}

const opportunity = {
  naicsCode: '541512',
  setAside: '8(a) Competitive',
  description: 'Cloud infrastructure modernization with react and node.js',
  responseDeadline: '2026-05-01T17:00:00Z',
}

const score = scoreOpportunity(opportunity, profile)
console.log(score)  // 90

const breakdown = scoreWithBreakdown(opportunity, profile)
console.log(breakdown)
// {
//   total: 90,
//   naicsMatch: 25,
//   certMatch: 15,
//   capabilityMatch: 15,    ← "software development" not in description, so 3 matches × 5
//   deadlinePenalty: 0,
//   matchedCapabilities: ['cloud infrastructure', 'react', 'node.js']
// }
```

## Score interpretation

| Label | Range | Action |
|---|---|---|
| 🟢 **high** | 70–100 | Bid this. |
| 🟡 **medium** | 40–69 | Worth a closer look. |
| 🔴 **low** | 0–39 | Probably skip. |

## Why deterministic?

- **Free** — runs in microseconds, no API calls.
- **Reproducible** — same input always produces the same score.
- **Auditable** — the formula is 119 lines of TypeScript.
- **Improvable** — if a factor is wrong, you can open a PR and fix it.

See [docs/SCORING.md](../../docs/SCORING.md) for the full methodology.

## License

MIT — see [LICENSE](../../LICENSE).
