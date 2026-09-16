/**
 * examples/basic-search.ts
 *
 * Run with:  npx tsx examples/basic-search.ts
 *
 * Demonstrates: searching SAM.gov, scoring opportunities, iterating all pages.
 */

import { createClient, type SamGovClient } from '@opensam/sdk'

async function main() {
  const apiKey = process.env.SAM_GOV_API_KEY
  if (!apiKey) {
    console.error('Set SAM_GOV_API_KEY env var. Get one at https://api.data.gov/signup/')
    process.exit(1)
  }

  const client: SamGovClient = createClient({ apiKey })

  // Your company profile — change these to match your business
  const profile = {
    naicsCodes: ['541511', '541512', '541519', '518210'],
    capabilities: [
      'software development',
      'cloud infrastructure',
      'data processing',
      'api integration',
      'machine learning',
    ],
    certifications: ['Small Business', 'SBA 8(a)'],
  }

  console.log('Searching SAM.gov for cloud infrastructure solicitations...\n')

  // 1. Basic search + score in one call
  const scored = await client.searchAndScore(
    {
      query: 'cloud infrastructure',
      naicsCode: '541512',
      activeOnly: true,
      limit: 25,
    },
    profile,
  )

  if (scored.length === 0) {
    console.log('No active opportunities found. Try a broader query.')
    return
  }

  console.log(`Found ${scored.length} opportunities (sorted by viability):\n`)

  for (const { opportunity, score, label, matchedCapabilities, deadlinePenalty } of scored) {
    const icon = label === 'high' ? '🟢' : label === 'medium' ? '🟡' : '🔴'
    const daysLeft = opportunity.responseDeadLine
      ? Math.round(
          (new Date(opportunity.responseDeadLine).getTime() - Date.now()) / 86_400_000,
        )
      : '?'

    console.log(`${icon} [${score}/100] ${opportunity.title}`)
    console.log(`   Agency:    ${opportunity.organizationHierarchy?.l1Name ?? 'unknown'}`)
    console.log(`   NAICS:     ${opportunity.naicsCode}`)
    console.log(`   Deadline:  ${opportunity.responseDeadLine ?? 'n/a'} (${daysLeft}d left)`)
    console.log(`   Matched:   ${matchedCapabilities.join(', ') || '(none)'}`)
    console.log(`   Penalty:   ${deadlinePenalty}`)
    console.log(`   URL:       ${opportunity.uiLink}`)
    console.log()
  }

  // 2. Iterate all pages (useful for big searches)
  console.log('\n--- Iterating ALL opportunities with "AI services" ---\n')
  let count = 0
  for await (const opp of client.searchAll({ query: 'AI services', limit: 100 })) {
    count++
    if (count <= 3) console.log(`${count}. ${opp.title} — ${opp.naicsCode}`)
    if (count % 50 === 0) console.log(`  ... ${count} fetched so far`)
  }
  console.log(`\nTotal fetched: ${count}`)

  // 3. Client stats
  console.log('\nClient stats:', client.stats)
}

main().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
