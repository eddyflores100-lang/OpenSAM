/**
 * @opensam/sdk — Client factory and integration tests
 *
 * NOTE: Scoring logic is exhaustively tested in scoring.test.ts.
 * These tests cover the client factory and the SDK's behavior with
 * properly-typed SamOpportunity objects (using SAM.gov's actual field
 * names like 'responseDeadLine' with capital L, not 'responseDeadline').
 */

import { describe, it, expect } from 'vitest'
import { SamGovClient, createClient } from '../index'
import type { SamOpportunity } from '../types.js'

// ---------------------------------------------------------------------------
// Helper: build a valid SamOpportunity with the correct SAM.gov field names
// ---------------------------------------------------------------------------

function makeSamOpportunity(overrides: Partial<SamOpportunity> = {}): SamOpportunity {
  return {
    noticeId: 'test-001',
    title: 'Test Opportunity',
    solicitationNumber: 'TEST-2026-001',
    fullParentPathName: 'Department of Defense',
    postedDate: '2026-03-01',
    type: 'Solicitation',
    baseType: 'Solicitation',
    archiveType: 'auto25',
    archiveDate: '2026-12-31',
    typeOfSetAsideDescription: '',
    responseDeadLine: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    naicsCode: '541512',
    naicsCodes: ['541512'],
    classificationCode: 'D',
    active: 'Yes',
    pointOfContact: [],
    description: 'Cloud infrastructure modernization and software development services.',
    organizationHierarchy: { l1Name: 'Department of Defense' },
    links: [],
    uiLink: 'https://sam.gov/opp/test-001',
    ...overrides,
  } as SamOpportunity
}

const profile = {
  naicsCodes: ['541511', '541512', '541519'],
  capabilities: ['software development', 'cloud infrastructure', 'react', 'node.js'],
  certifications: ['Small Business', 'SBA 8(a)'],
}

// ---------------------------------------------------------------------------
// createClient factory
// ---------------------------------------------------------------------------

describe('createClient', () => {
  it('returns a SamGovClient instance', () => {
    const client = createClient({ apiKey: 'test-key' })
    expect(client).toBeInstanceOf(SamGovClient)
  })

  it('throws if no apiKey is provided', () => {
    // @ts-expect-error intentional missing arg
    expect(() => createClient({})).toThrow()
  })
})

// ---------------------------------------------------------------------------
// scoreOpportunity (static method) — using correct SamOpportunity fields
// ---------------------------------------------------------------------------

describe('SamGovClient.scoreOpportunity', () => {
  it('returns a score between 0 and 100', () => {
    const opp = makeSamOpportunity()
    const result = SamGovClient.scoreOpportunity(opp, profile)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('gives a high score for perfect match', () => {
    const opp = makeSamOpportunity({
      typeOfSetAsideDescription: 'Total Small Business',
      description: 'cloud infrastructure react node.js api integration services',
      responseDeadLine: new Date(Date.now() + 60 * 86_400_000).toISOString(),
    })
    const result = SamGovClient.scoreOpportunity(opp, profile)
    expect(result.score).toBeGreaterThanOrEqual(70)
    expect(result.label).toBe('high')
  })

  it('penalizes deadlines within 7 days (uses responseDeadLine, capital L)', () => {
    const farDeadline = makeSamOpportunity({
      responseDeadLine: new Date(Date.now() + 60 * 86_400_000).toISOString(),
    })
    const closeDeadline = makeSamOpportunity({
      responseDeadLine: new Date(Date.now() + 3 * 86_400_000).toISOString(), // < 3 days → -35
    })
    const farResult = SamGovClient.scoreOpportunity(farDeadline, profile)
    const closeResult = SamGovClient.scoreOpportunity(closeDeadline, profile)
    expect(closeResult.score).toBeLessThan(farResult.score)
    expect(closeResult.deadlinePenalty).toBe(-35)
    expect(farResult.deadlinePenalty).toBe(0)
  })

  it('applies -15 penalty for deadlines between 3 and 7 days', () => {
    const opp = makeSamOpportunity({
      responseDeadLine: new Date(Date.now() + 5 * 86_400_000).toISOString(),
    })
    const result = SamGovClient.scoreOpportunity(opp, profile)
    expect(result.deadlinePenalty).toBe(-15)
  })

  it('awards +25 for NAICS match', () => {
    const matched = makeSamOpportunity({ naicsCode: '541512' })
    const unmatched = makeSamOpportunity({ naicsCode: '236220' })
    expect(SamGovClient.scoreOpportunity(matched, profile).naicsMatch).toBe(25)
    expect(SamGovClient.scoreOpportunity(unmatched, profile).naicsMatch).toBe(0)
  })

  it('awards +15 for 8(a) set-aside when certification is held', () => {
    const opp = makeSamOpportunity({ typeOfSetAsideDescription: '8(a) Competitive' })
    const result = SamGovClient.scoreOpportunity(opp, profile)
    expect(result.certMatch).toBe(15)
  })

  it('awards +0 when set-aside requires a cert you do not hold', () => {
    const opp = makeSamOpportunity({ typeOfSetAsideDescription: 'HUBZone' })
    const result = SamGovClient.scoreOpportunity(opp, profile)
    expect(result.certMatch).toBe(0)
  })

  it('lists matched capabilities', () => {
    const opp = makeSamOpportunity({
      description: 'We need react and node.js expertise',
    })
    const result = SamGovClient.scoreOpportunity(opp, profile)
    expect(result.matchedCapabilities).toContain('react')
    expect(result.matchedCapabilities).toContain('node.js')
  })

  it('returns low label for mismatched opportunity with close deadline', () => {
    const opp = makeSamOpportunity({
      naicsCode: '111110', // Agriculture — not in profile
      typeOfSetAsideDescription: '',
      description: 'Corn farming operations',
      responseDeadLine: new Date(Date.now() + 2 * 86_400_000).toISOString(), // -35 penalty
    })
    const result = SamGovClient.scoreOpportunity(opp, profile)
    // 50 base + 0 naics + 0 cert + 0 capability - 35 deadline = 15 → low
    expect(result.score).toBeLessThanOrEqual(39)
    expect(result.label).toBe('low')
  })
})

// ---------------------------------------------------------------------------
// labelFromScore static method
// ---------------------------------------------------------------------------

describe('SamGovClient.labelFromScore', () => {
  it('labels 70+ as high', () => {
    expect(SamGovClient.labelFromScore(70)).toBe('high')
    expect(SamGovClient.labelFromScore(100)).toBe('high')
  })

  it('labels 40-69 as medium', () => {
    expect(SamGovClient.labelFromScore(40)).toBe('medium')
    expect(SamGovClient.labelFromScore(69)).toBe('medium')
  })

  it('labels 0-39 as low', () => {
    expect(SamGovClient.labelFromScore(0)).toBe('low')
    expect(SamGovClient.labelFromScore(39)).toBe('low')
  })
})
