import { useState, useMemo } from 'react'
import { createClient, type ScoredOpportunity } from '@opensam/sdk'

const SAM_GOV_API_KEY = import.meta.env.VITE_SAM_GOV_API_KEY as string | undefined

const DEFAULT_PROFILE = {
  naicsCodes: ['541511', '541512', '541519'],
  capabilities: ['software development', 'cloud infrastructure', 'react', 'node.js'],
  certifications: ['Small Business', 'SBA 8(a)'],
}

function App() {
  const [query, setQuery] = useState('cloud infrastructure')
  const [naics, setNaics] = useState('541512')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<ScoredOpportunity[]>([])

  const client = useMemo(() => {
    if (!SAM_GOV_API_KEY) return null
    return createClient({ apiKey: SAM_GOV_API_KEY })
  }, [])

  async function search(e: React.FormEvent) {
    e.preventDefault()
    if (!client) {
      setError('Missing VITE_SAM_GOV_API_KEY. Get one at https://api.data.gov/signup/')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const scored = await client.searchAndScore(
        {
          query,
          naicsCode: naics || undefined,
          activeOnly: true,
          limit: 25,
        },
        DEFAULT_PROFILE,
      )
      setResults(scored)
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
          <p className="opacity-90 mt-1">Open-source autonomous agent for SAM.gov federal contracting</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={search} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Keyword</label>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="cloud infrastructure"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">NAICS code (optional)</label>
            <input
              type="text"
              value={naics}
              onChange={e => setNaics(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="541512"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 text-white px-6 py-2 rounded hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search & Score'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4 mb-6">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">
              {results.length} opportunities (sorted by viability)
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
