/**
 * govcon-scoring — Federal Contract Viability Scoring Engine
 * Open source by AliceLabs LLC (https://alicelabs.site)
 *
 * Scores federal opportunities (0–100) against a company profile
 * using NAICS matching, certification alignment, capability keywords,
 * and deadline proximity. No AI credits required.
 */

export interface CompanyProfile {
  name: string
  naicsCodes: string[]
  capabilities: string[]
  certifications: string[]
}

export interface Opportunity {
  naicsCode: string
  setAside?: string
  description: string
  responseDeadline: string
}

export interface ScoreBreakdown {
  total: number
  naicsMatch: number
  certMatch: number
  capabilityMatch: number
  deadlinePenalty: number
  matchedCapabilities: string[]
}

/**
 * Score a federal opportunity against a company profile.
 * Returns a number between 0 and 100.
 */
export function scoreOpportunity(
  opp: Opportunity,
  profile: CompanyProfile,
): number {
  return scoreWithBreakdown(opp, profile).total
}

/**
 * Score with full breakdown of how points were awarded.
 */
export function scoreWithBreakdown(
  opp: Opportunity,
  profile: CompanyProfile,
): ScoreBreakdown {
  let naicsMatch = 0
  let certMatch = 0
  let capabilityMatch = 0
  let deadlinePenalty = 0
  const matchedCapabilities: string[] = []

  // Base score
  let score = 50

  // ── NAICS match (+25) ────────────────────────────────────────
  if (profile.naicsCodes.includes(opp.naicsCode)) {
    naicsMatch = 25
    score += naicsMatch
  }

  // ── Set-aside / certification alignment (+10 to +15) ─────────
  const certs = profile.certifications.map(c => c.toLowerCase())
  const aside = opp.setAside ?? ''

  if (aside.includes('Small Business') && certs.length > 0) {
    certMatch = 10
  }
  if (aside.includes('8(a)') && certs.includes('sba 8(a)')) {
    certMatch = 15
  }
  if (aside.includes('Women') && certs.includes('wosb')) {
    certMatch = 15
  }
  if (aside.includes('HUBZone') && certs.includes('hubzone')) {
    certMatch = 15
  }
  if (aside.includes('Service-Disabled') && certs.includes('sdvosb')) {
    certMatch = 15
  }
  score += certMatch

  // ── Capability keyword matching (+5 each, max +20) ───────────
  const desc = opp.description.toLowerCase()
  for (const cap of profile.capabilities) {
    if (desc.includes(cap.toLowerCase())) {
      matchedCapabilities.push(cap)
    }
  }
  capabilityMatch = Math.min(matchedCapabilities.length * 5, 20)
  score += capabilityMatch

  // ── Deadline proximity penalty (-15 to -35) ──────────────────
  const daysLeft =
    (new Date(opp.responseDeadline).getTime() - Date.now()) / 86_400_000

  if (daysLeft < 3) {
    deadlinePenalty = -35
  } else if (daysLeft < 7) {
    deadlinePenalty = -15
  }
  score += deadlinePenalty

  // Clamp 0–100
  const total = Math.max(0, Math.min(100, score))

  return {
    total,
    naicsMatch,
    certMatch,
    capabilityMatch,
    deadlinePenalty,
    matchedCapabilities,
  }
}
