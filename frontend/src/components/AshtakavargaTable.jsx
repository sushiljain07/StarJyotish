// Ashtakavarga table: Bhinnashtakavarga + Sarvashtakavarga
import { useState, useEffect } from 'react'
import { API_BASE } from '../api/config'
import { PLANET_COLORS } from '../config/planetColors'

const SIGN_ABBR = ['Ar','Ta','Ge','Ca','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi']
const PLANETS = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']

function PointCell({ value, max = 8 }) {
  const pct = value / max
  const bg = pct >= 0.75 ? '#d1fae5' : pct >= 0.5 ? '#fef9c3' : pct >= 0.375 ? '#fee2e2' : '#fecaca'
  return (
    <td style={{ backgroundColor: bg }}
        className="p-1.5 text-center border border-line font-bold text-sm tabular-nums">
      {value}
    </td>
  )
}

function SarvaCell({ value }) {
  const pct = value / 56
  const bg = pct >= 0.65 ? '#d1fae5' : pct >= 0.45 ? '#fef9c3' : '#fee2e2'
  return (
    <td style={{ backgroundColor: bg }}
        className="p-1.5 text-center border border-line font-bold text-sm tabular-nums">
      {value}
    </td>
  )
}

export default function AshtakavargaTable({ input }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('sarva')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/kundli/ashtakavarga`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: input.date, time: input.time, place: input.place }),
      })
      if (!res.ok) throw new Error('Failed')
      setData(await res.json())
    } catch {
      setError('Could not load Ashtakavarga data.')
    }
    setLoading(false)
  }

  // Pure Swiss Ephemeris calculation, not an LLM call — auto-load like
  // every other non-LLM tab, instead of gating behind a click.
  useEffect(() => { load() }, [])

  return (
    <div className="space-y-4">
      <div className="bg-primary-light border border-primary/30 rounded-xl p-4">
        <h2 className="text-primary-dark font-bold text-base">Ashtakavarga</h2>
        <p className="text-primary-dark text-xs mt-1">
          Shows benefic point scores for each planet across all 12 signs. Higher scores (green) indicate stronger positions.
        </p>
        <button onClick={load} disabled={loading}
                className="mt-3 text-xs bg-primary text-night px-3 py-1.5 rounded-lg hover:bg-primary-dark disabled:opacity-50">
          {loading ? 'Calculating…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-vermillion-light border border-vermillion/30 rounded-lg p-4 text-vermillion text-sm">⚠️ {error}</div>
      )}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-3xl animate-spin">🪐</div>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Sub-tabs */}
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setActiveTab('sarva')}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                      activeTab === 'sarva'
                        ? 'bg-primary border-primary text-night'
                        : 'bg-parchment-card border-line text-ink-muted hover:border-primary/50'
                    }`}>
              Sarvashtakavarga (Total)
            </button>
            {PLANETS.map(p => (
              <button key={p} onClick={() => setActiveTab(p)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                        activeTab === p
                          ? 'text-white border-transparent'
                          : 'bg-parchment-card border-line text-ink-muted hover:border-ink-faint'
                      }`}
                      style={activeTab === p ? { backgroundColor: PLANET_COLORS[p] ?? '#666' } : {}}>
                {p.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Sarvashtakavarga */}
          {activeTab === 'sarva' && (
            <div className="bg-parchment-card rounded-xl border border-line overflow-hidden">
              <div className="px-4 py-3 bg-primary-light border-b">
                <h3 className="font-semibold text-primary-dark text-sm">
                  Sarvashtakavarga — Total Benefic Points per Sign (Max 56)
                </h3>
              </div>
              <div className="overflow-x-auto p-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-night/[0.03]">
                      {SIGN_ABBR.map(s => (
                        <th key={s} className="p-1.5 text-center border border-line text-ink-muted text-xs">{s}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {data.sarvashtakavarga.map((cell, i) => (
                        <SarvaCell key={i} value={cell.points} />
                      ))}
                    </tr>
                  </tbody>
                </table>
                <div className="flex gap-4 mt-3 text-xs text-ink-muted">
                  <span><span className="inline-block w-3 h-3 rounded bg-green-100 mr-1 align-middle"></span>Strong (≥28)</span>
                  <span><span className="inline-block w-3 h-3 rounded bg-yellow-100 mr-1 align-middle"></span>Average (25-28)</span>
                  <span><span className="inline-block w-3 h-3 rounded bg-red-100 mr-1 align-middle"></span>Weak (&lt;25)</span>
                </div>
              </div>
            </div>
          )}

          {/* Bhinnashtakavarga for selected planet */}
          {PLANETS.includes(activeTab) && data.bhinnashtakavarga[activeTab] && (
            <div className="bg-parchment-card rounded-xl border border-line overflow-hidden">
              <div className="px-4 py-3 border-b"
                   style={{ backgroundColor: PLANET_COLORS[activeTab] + '18' }}>
                <h3 className="font-semibold text-sm"
                    style={{ color: PLANET_COLORS[activeTab] }}>
                  {activeTab} Bhinnashtakavarga (Max 8 points per sign)
                </h3>
              </div>
              <div className="overflow-x-auto p-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-night/[0.03]">
                      {SIGN_ABBR.map(s => (
                        <th key={s} className="p-1.5 text-center border border-line text-ink-muted text-xs">{s}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {data.bhinnashtakavarga[activeTab].map((cell, i) => (
                        <PointCell key={i} value={cell.points} />
                      ))}
                    </tr>
                  </tbody>
                </table>
                <div className="flex gap-4 mt-3 text-xs text-ink-muted">
                  <span><span className="inline-block w-3 h-3 rounded bg-green-100 mr-1 align-middle"></span>Strong (≥6)</span>
                  <span><span className="inline-block w-3 h-3 rounded bg-yellow-100 mr-1 align-middle"></span>Average (4-5)</span>
                  <span><span className="inline-block w-3 h-3 rounded bg-red-200 mr-1 align-middle"></span>Weak (3)</span>
                  <span><span className="inline-block w-3 h-3 rounded bg-red-300 mr-1 align-middle"></span>Very Weak (&lt;3)</span>
                </div>
              </div>
            </div>
          )}

          {/* Combined view - all 7 planets + total */}
          {activeTab === 'sarva' && (
            <div className="bg-parchment-card rounded-xl border border-line overflow-hidden">
              <div className="px-4 py-3 bg-night/[0.03] border-b">
                <h3 className="font-semibold text-ink text-sm">All Planets Overview</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-night/[0.03]">
                      <th className="p-2 text-left border border-line">Planet</th>
                      {SIGN_ABBR.map(s => (
                        <th key={s} className="p-1 text-center border border-line">{s}</th>
                      ))}
                      <th className="p-2 text-center border border-line">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLANETS.map((planet, pi) => {
                      const row = data.bhinnashtakavarga[planet]
                      if (!row) return null
                      const total = row.reduce((s, c) => s + c.points, 0)
                      return (
                        <tr key={planet} className={pi % 2 === 0 ? 'bg-parchment-card' : 'bg-night/[0.03]'}>
                          <td className="p-2 border border-line font-bold"
                              style={{ color: PLANET_COLORS[planet] ?? '#333' }}>
                            {planet.slice(0, 3)}
                          </td>
                          {row.map((cell, i) => (
                            <PointCell key={i} value={cell.points} />
                          ))}
                          <td className="p-2 text-center border border-line font-bold text-ink">
                            {total}
                          </td>
                        </tr>
                      )
                    })}
                    {/* Sarva total row */}
                    <tr className="bg-primary-light font-bold">
                      <td className="p-2 border border-primary/40 text-primary-dark">Total</td>
                      {data.sarvashtakavarga.map((cell, i) => (
                        <SarvaCell key={i} value={cell.points} />
                      ))}
                      <td className="p-2 text-center border border-primary/40 text-primary-dark">
                        {data.sarvashtakavarga.reduce((s, c) => s + c.points, 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
