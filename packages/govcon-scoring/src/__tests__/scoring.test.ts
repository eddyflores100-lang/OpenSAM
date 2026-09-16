import { describe, it, expect } from 'vitest'
import { scoreOpportunity } from '../index'
import type { CompanyProfile, Opportunity } from '../index'

const baseProfile: CompanyProfile = {
  name: 'Acme Federal LLC',
  naicsCodes: ['541511', '541512', '541519'],
  capabilities: ['software development', 'cloud infrastructure', 'data processing', 'api integration'],
  certifications: ['Small Business', 'SBA 8(a)'],
}

const futureDate = (daysFromNow: number) =>
  new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString()

// ---------------------------------------------------------------------------

describe('scoreOpportunity', () => {
  it('returns a number between 0 and 100', () => {
    const opp: Opportunity = {
      naicsCode: '541512',
      setAside: 'Total Small Business',
      description: 'Cloud infrastructure modernization',
      responseDeadline: futureDate(30),
    }
    const score = scoreOpportunity(opp, baseProfile)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('scores higher when NAICS matches', () => {
    const matchingOpp: Opportunity = {
      naicsCode: '541512', // in profile
      setAside: 'None',
      description: 'Generic IT services',
      responseDeadline: futureDate(30),
    }
    const nonMatchingOpp: Opportunity = {
      naicsCode: '111110', // Agriculture — not in profile
      setAside: 'None',
      description: 'Generic IT services',
      responseDeadline: futureDate(30),
    }
    expect(scoreOpportunity(matchingOpp, baseProfile)).toBeGreaterThan(
      scoreOpportunity(nonMatchingOpp, baseProfile)
    )
  })

  it('adds points for matching certifications', () => {
    const withSetAside: Opportunity = {
      naicsCode: '999999',
      setAside: '8(a) Competitive',
      description: 'Nothing relevant',
      responseDeadline: futureDate(30),
    }
    const withoutSetAside: Opportunity = {
      ...withSetAside,
      setAside: 'None',
    }
    expect(scoreOpportunity(withSetAside, baseProfile)).toBeGreaterThan(
      scoreOpportunity(withoutSetAside, baseProfile)
    )
  })

  it('awards points per matched capability keyword', () => {
    const richDescription: Opportunity = {
      naicsCode: '999999',
      setAside: 'None',
      description: 'software development cloud infrastructure data processing api integration',
      responseDeadline: futureDate(30),
    }
    const emptyDescription: Opportunity = {
      ...richDescription,
      description: 'Unrelated farming operations',
    }
    expect(scoreOpportunity(richDescription, baseProfile)).toBeGreaterThan(
      scoreOpportunity(emptyDescription, baseProfile)
    )
  })

  it('applies deadline penalty for opportunities closing within 7 days', () => {
    const urgentOpp: Opportunity = {
      naicsCode: '541512',
      setAside: 'Total Small Business',
      description: 'cloud infrastructure',
      responseDeadline: futureDate(2), // 2 days — heavy penalty
    }
    const comfortableOpp: Opportunity = {
      ...urgentOpp,
      responseDeadline: futureDate(60),
    }
    expect(scoreOpportunity(urgentOpp, baseProfile)).toBeLessThan(
      scoreOpportunity(comfortableOpp, baseProfile)
    )
  })

  it('handles missing optional fields gracefully', () => {
    const minimalOpp: Opportunity = {
      naicsCode: '541512',
      setAside: '',
      description: '',
      responseDeadline: futureDate(30),
    }
    expect(() => scoreOpportunity(minimalOpp, baseProfile)).not.toThrow()
  })
})
