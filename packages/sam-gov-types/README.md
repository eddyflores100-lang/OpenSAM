# sam-gov-types

TypeScript type definitions for the [SAM.gov Public Opportunities API](https://open.gsa.gov/api/get-opportunities-public-api/).

Part of the [OpenSAM](https://github.com/eddyflores100-lang/OpenSAM) monorepo.

## Install

```bash
npm install @opensam/sam-gov-types
```

## Usage

```typescript
import type {
  SamOpportunity,
  SamSearchParams,
  SamSearchResponse,
  OrganizationHierarchy,
  PointOfContact,
  PlaceOfPerformance,
  Award,
} from '@opensam/sam-gov-types'

// Type-safe API call
async function searchSam(params: SamSearchParams): Promise<SamSearchResponse> {
  const qs = new URLSearchParams(params as Record<string, string>)
  const res = await fetch(`https://api.sam.gov/opportunities/v2/search?${qs}`)
  return res.json()
}

const opp: SamOpportunity = await getOpportunity('some-id')
console.log(opp.title)                              // string
console.log(opp.organizationHierarchy.l1Name)      // string — agency
console.log(opp.pointOfContact[0].email)            // string
console.log(opp.placeOfPerformance?.city?.name)      // string | undefined
```

## Covered endpoints

| Endpoint | Types |
|---|---|
| `GET /opportunities/v2/search` | `SamSearchParams`, `SamSearchResponse` |
| Opportunity object | `SamOpportunity` |

## Why

The SAM.gov API returns deeply nested JSON with inconsistent field names (`responseDeadLine` vs `postedDate`), optional fields everywhere, and zero TypeScript support. This package gives you full type safety with autocomplete on every field.
