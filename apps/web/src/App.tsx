import { useState } from 'react'
import type { ScoredOpportunity } from '@opensam/sdk'

function App() {
  const [query, setQuery] = useState('cloud infrastructure')
  const [naics, setNaics] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<ScoredOpportunity[]>([])

  const [accessCode, setAccessCode] = useState('')
  const [capabilities, setCapabilities] = useState('')
  const [searched, setSearched] = useState(false)
  const [scope, setScope] = useState('')

  async function search(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      setResults([])
      setSearched(false)
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessCode}` },
        body: JSON.stringify({ query, naics, capabilities: capabilities.split(',').map(c => c.trim()).filter(Boolean) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Search unavailable')
      setResults(data.results)
      setScope(data.scope)
      setSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-brand-600 text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold">OpenSAM</h1>
          <p className="opacity-90 mt-1">Assisted opportunity research · Private pilot</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <section className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold">Build a shortlist for human review</h2>
          <p className="mt-2">Search notice titles from the last 30 days. The score measures NAICS and title keyword matches; it does not establish eligibility or likelihood of winning.</p>
          <a className="inline-block mt-3 underline text-brand-600" href="mailto:contact@alicelabs.site?subject=OpenSAM%20assisted%20pilot">Request an assisted pilot by email</a>
          <p className="text-sm text-gray-600">Opens your email app. Scope and price are agreed before service begins.</p>
        </section>
        <form onSubmit={search} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <div>
            <label htmlFor="query" className="block text-sm font-medium mb-1">Notice title contains</label>
            <input
              id="query" type="text" required minLength={2} maxLength={150}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="cloud infrastructure"
            />
          </div>
          <div>
            <label htmlFor="naics" className="block text-sm font-medium mb-1">Your NAICS code (optional)</label>
            <input
              id="naics" type="text" pattern="[0-9]{6}" maxLength={6}
              value={naics}
              onChange={e => setNaics(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="541512"
            />
          </div>
          <div><label htmlFor="capabilities" className="block text-sm font-medium mb-1">Your capabilities (comma separated, optional)</label><input id="capabilities" value={capabilities} onChange={e => setCapabilities(e.target.value)} maxLength={1600} className="w-full border rounded px-3 py-2" /></div>
          <div><label htmlFor="access" className="block text-sm font-medium mb-1">Pilot access code</label><input id="access" type="password" autoComplete="off" required value={accessCode} onChange={e => setAccessCode(e.target.value)} className="w-full border rounded px-3 py-2" /><p className="text-sm text-gray-600">Provided by your pilot operator. Kept in memory for this page only.</p></div>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 text-white px-6 py-2 rounded hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search & Score'}
          </button>
        </form>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-800 rounded p-4 mb-6">
            {error}
          </div>
        )}

        {searched && <p role="status" className="mb-6">{!results.length && 'No active records among the first 25 returned; more may exist. Try another title or NAICS. '}{scope}</p>}
        {results.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">
              {results.length} opportunities (sorted by profile match)
            </h2>
            {results.map(({ opportunity, score, label, matchedCapabilities }) => {
              const icon = label === 'high' ? '🟢' : label === 'medium' ? '🟡' : '🔴'
              const daysLeft = opportunity.responseDeadLine
                ? Math.round(
                    (new Date(opportunity.responseDeadLine).getTime() - Date.now()) / 86_400_000,
                  )
                : null
              return (
                <article key={opportunity.noticeId} className="bg-white rounded shadow p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {icon} {opportunity.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {opportunity.organizationHierarchy?.l1Name ?? 'Unknown agency'} · NAICS {opportunity.naicsCode}
                      </p>
                      <p className="text-sm text-gray-600">
                        Deadline: {opportunity.responseDeadLine ?? 'n/a'}
                        {daysLeft !== null && ` (${daysLeft}d left)`}
                      </p>
                      {matchedCapabilities.length > 0 && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Matched capabilities:</span>{' '}
                          {matchedCapabilities.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{score}</div>
                      <div className="text-xs uppercase text-gray-500">{label}</div>
                    </div>
                  </div>
                  <a
                    href={opportunity.uiLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-3 text-brand-600 hover:underline text-sm"
                  >
                    View on SAM.gov →
                  </a>
                </article>
              )
            })}
          </div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-8 text-sm text-gray-500">
        Built by AliceLabs LLC · Not affiliated with the U.S. Government ·{' '}
        <a href="https://github.com/eddyflores100-lang/OpenSAM" className="underline">GitHub</a>
      </footer>
    </div>
  )
}

export default App
