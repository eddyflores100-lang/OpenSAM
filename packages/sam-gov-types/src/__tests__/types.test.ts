import { describe, it, expectTypeOf } from 'vitest'
import type {
  Opportunity,
  OpportunityType,
  SetAsideType,
  NoticeType,
  SearchParams,
  SearchResult,
  OpportunityDetail,
  ContactInfo,
  Award,
  Address,
} from '../index'

// ---------------------------------------------------------------------------
// Opportunity shape
// ---------------------------------------------------------------------------

describe('Opportunity type', () => {
  it('has required string fields', () => {
    expectTypeOf<Opportunity['noticeId']>().toBeString()
    expectTypeOf<Opportunity['title']>().toBeString()
    expectTypeOf<Opportunity['solicitationNumber']>().toEqualTypeOf<string | undefined>()
  })

  it('has correct naicsCode type', () => {
    expectTypeOf<Opportunity['naicsCode']>().toEqualTypeOf<string | undefined>()
  })

  it('has responseDeadline as string or undefined', () => {
    expectTypeOf<Opportunity['responseDeadline']>().toEqualTypeOf<string | undefined>()
  })
})

// ---------------------------------------------------------------------------
// SearchParams
// ---------------------------------------------------------------------------

describe('SearchParams type', () => {
  it('accepts valid search params object', () => {
    const params: SearchParams = {
      query: 'cloud infrastructure',
      naicsCode: '541512',
      limit: 10,
      offset: 0,
    }
    expectTypeOf(params).toMatchTypeOf<SearchParams>()
  })

  it('noticeType is typed union', () => {
    expectTypeOf<NonNullable<SearchParams['noticeType']>>().toEqualTypeOf<NoticeType>()
  })
})

// ---------------------------------------------------------------------------
// SearchResult
// ---------------------------------------------------------------------------

describe('SearchResult type', () => {
  it('has opportunities array and total count', () => {
    expectTypeOf<SearchResult['opportunities']>().toEqualTypeOf<Opportunity[]>()
    expectTypeOf<SearchResult['total']>().toBeNumber()
  })
})

// ---------------------------------------------------------------------------
// Enum-like union types
// ---------------------------------------------------------------------------

describe('SetAsideType', () => {
  it('includes expected values', () => {
    const value: SetAsideType = 'Total Small Business'
    expectTypeOf(value).toEqualTypeOf<SetAsideType>()
  })
})

describe('NoticeType', () => {
  it('includes Solicitation and Sources Sought', () => {
    const s: NoticeType = 'Solicitation'
    const ss: NoticeType = 'Sources Sought'
    expectTypeOf(s).toEqualTypeOf<NoticeType>()
    expectTypeOf(ss).toEqualTypeOf<NoticeType>()
  })
})
