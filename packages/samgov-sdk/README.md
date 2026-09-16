# @opensam/sdk

A fully typed, zero-dependency TypeScript SDK for the [SAM.gov Federal Opportunities API](https://open.gsa.gov/api/get-opportunities-public-api/).

Part of the [OpenSAM](https://github.com/eddyflores100-lang/OpenSAM) monorepo.

## Features

- 🔎 **Search** federal contract opportunities with full type safety
- 📄 **Paginate** automatically with async iterators (`searchAll`)
- 📊 **Score** opportunities against your company profile
- ⚡ **Retry** on 5xx, **back off** on 429 (rate limit)
- 🛡️ **Typed errors** — `SamApiError`, `SamRateLimitError`, `SamTimeoutError`
- 🪶 **Zero runtime dependencies** — works on Node 18+, browsers, edge runtimes
- 🔁 **Static scoring method** — call without instantiating a client

## Install

```bash
npm install @opensam/sdk
```

## Quick start

```typescript
import { createClient } from '@opensam/sdk'

const sam = createClient({
  apiKey: process.env.SAM_GOV_API_KEY!,  // get one at https://api.data.gov/signup/
})

const results = await sam.search({
  query: 'cloud infrastructure',
  naicsCode: '541512',
  noticeType: 'Solicitation',
  activeOnly: true,
  limit: 10,
})

console.log(`Found ${results.total} opportunities`)
results.opportunities.forEach(opp => {
  console.log(`${opp.title} — ${opp.organizationHierarchy?.l1Name}`)
})
```

## Search and score in one call

```typescript
const scored = await sam.searchAndScore(
  { query: 'cybersecurity', limit: 25 },
  {
    naicsCodes: ['541511', '541512'],
    capabilities: ['cybersecurity', 'cloud infrastructure'],
    certifications: ['Small Business', 'SBA 8(a)'],
  },
)

scored.forEach(({ opportunity, score, label }) => {
  console.log(`[${label.toUpperCase()} ${score}/100] ${opportunity.title}`)
})
```

## Iterate all pages

```typescript
for await (const opp of sam.searchAll({ query: 'AI services', limit: 100 })) {
  console.log(opp.title)
}
```

## Error handling

```typescript
import { SamRateLimitError, SamTimeoutError } from '@opensam/sdk'

try {
  await sam.search({ query: 'something rare' })
} catch (err) {
  if (err instanceof SamRateLimitError) {
    console.log(`Rate limited. Retry in ${err.retryAfter}s`)
  } else if (err instanceof SamTimeoutError) {
    console.log('Request timed out')
  } else {
    throw err
  }
}
```

## Static scoring

You can score an opportunity without instantiating a client:

```typescript
import { SamGovClient } from '@opensam/sdk'

const result = SamGovClient.scoreOpportunity(opportunity, profile)
console.log(result.score, result.label, result.matchedCapabilities)
```

## Configuration

| Option | Default | Description |
|---|---|---|
| `apiKey` | (required) | Your api.data.gov key |
| `baseUrl` | `https://api.sam.gov/opportunities/v2` | Override for testing |
| `timeout` | `30000` (30s) | Request timeout in ms |
| `retries` | `3` | Max retries on 5xx errors |

## License

MIT — see [LICENSE](../../LICENSE).
