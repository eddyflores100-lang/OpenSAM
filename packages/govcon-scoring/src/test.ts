import { scoreOpportunity, scoreWithBreakdown } from './index.js'
import type { CompanyProfile, Opportunity } from './index.js'

// ── Example company profile ────────────────────────────────────
const acme: CompanyProfile = {
  name: 'Acme Federal LLC',
  naicsCodes: ['541511', '541512', '541519', '518210'],
  capabilities: [
    'software development',
    'cloud infrastructure',
    'data processing',
    'API integration',
    'machine learning',
  ],
  certifications: ['Small Business', 'SBA 8(a)'],
}

// ── Test opportunities ─────────────────────────────────────────
const opportunities: Opportunity[] = [
  {
    naicsCode: '541512',
    setAside: '8(a) Competitive',
    description:
      'Cloud infrastructure modernization and data processing services for federal agency. Requires experience with API integration and machine learning capabilities.',
    responseDeadline: '2026-05-01T17:00:00Z',
  },
  {
    naicsCode: '236220',
    setAside: 'HUBZone',
    description: 'Commercial building construction and renovation services.',
    responseDeadline: '2026-04-02T17:00:00Z',
  },
  {
    naicsCode: '541511',
    setAside: 'Small Business',
    description: 'Custom software development for benefits administration portal.',
    responseDeadline: new Date(Date.now() + 5 * 86400000).toISOString(),
  },
]

// ── Run scoring ────────────────────────────────────────────────
console.log('govcon-scoring — test run\n')

for (const opp of opportunities) {
  const score = scoreOpportunity(opp, acme)
  const breakdown = scoreWithBreakdown(opp, acme)

  const label =
    score >= 70 ? '🟢 HIGH' : score >= 40 ? '🟡 MEDIUM' : '🔴 LOW'

  console.log(`${label}  ${score}/100  NAICS:${opp.naicsCode}  Set-aside:${opp.setAside ?? 'None'}`)
  console.log(`  NAICS +${breakdown.naicsMatch}  Certs +${breakdown.certMatch}  Caps +${breakdown.capabilityMatch} (${breakdown.matchedCapabilities.join(', ')})  Deadline ${breakdown.deadlinePenalty}`)
  console.log()
}
