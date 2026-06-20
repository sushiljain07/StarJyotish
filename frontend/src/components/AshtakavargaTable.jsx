// Ashtakavarga table: Bhinnashtakavarga + Sarvashtakavarga
import { useState } from 'react'
import { API_BASE } from '../api/config'

const SIGN_ABBR = ['Ar','Ta','Ge','Ca','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi']
const PLANETS = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']

const PLANET_COLORS = {
  Sun: '#E53E3E', Moon: '#7B61FF', Mars: '#CC2200', Mercury: '#16A34A',
  Jupiter: '#2563EB', Venus: '#E91E8C', Saturn: '#2563EB',
}

function PointCell({ value, max = 8 }) {
  const pct = value / max
  const bg = pct >= 0.75 ? '#d1fae5' : pct >= 0.5 ? '#fef9c3' : pct >= 0.375 ? '#fee2e2' : '#fecaca'
  return (
    <td style={{ backgroundColor: bg }}
        className="p-1.5 text-center border border-slate-200 font-bold text-sm tabular-nums">
      {value}
    </td>
  )
}

function SarvaCell({ value }) {
  const pct = value / 56
  const bg = pct >= 0.65 ? '#d1fae5' : pct >= 0.45 ? '#fef9c3' : '#fee2e2'
  return (
    <td style={{ backgroundColor: bg }}
        className="p-1.5 text-center border border-slate-200 font-bold text-sm tabular-nums">
      {value}
    </td>
  )
}

export default function AshtakavargaTable({ input }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loaded, setLoaded] = useState(false)
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
      setLoaded(true)
    } catch {
      setError('Could not load Ashtakavarga data.')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <h2 className="text-amber-800 font-bold text-base">Ashtakavarga</h2>
        <p className="text-amber-600 text-xs mt-1">
          Shows benefic point scores for each planet across all 12 signs. Higher scores (green) indicate stronger positions.
        </p>
        {!loaded && (
          <button onClick={load} disabled={loading}
                  className="mt-3 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 disabled:opacity-50">
            {loading ? 'Calculating…' : 'Calculate Ashtakavarga'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">⚠️ {error}</div>
      )}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-3xl animate-spin">🪐</div>
        </div>
      )}

      {data && loaded && !loading && (
        <>
          {/* Sub-tabs */}
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setActiveTab('sarva')}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                      activeTab === 'sarva'
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-amber-400'
                    }`}>
              Sarvashtakavarga (Total)
            </button>
            {PLANETS.map(p => (
              <button key={p} onClick={() => setActiveTab(p)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                        activeTab === p
                          ? 'text-white border-transparent'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}
                      style={activeTab === p ? { backgroundColor: PLANET_COLORS[p] ?? '#666' } : {}}>
                {p.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Sarvashtakavarga */}
          {activeTab === 'sarva' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-amber-50 border-b">
                <h3 className="font-semibold text-amber-800 text-sm">
                  Sarvashtakavarga — Total Benefic Points per Sign (Max 56)
                </h3>
              </div>
              <div className="overflow-x-auto p-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      {SIGN_ABBR.map(s => (
                        <th key={s} className="p-1.5 text-center border border-slate-200 text-slate-600 text-xs">{s}</th>
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
                <div className="flex gap-4 mt-3 text-xs text-slate-500">
                  <span><span className="inline-block w-3 h-3 rounded bg-green-100 mr-1 align-middle"></span>Strong (≥28)</span>
                  <span><span className="inline-block w-3 h-3 rounded bg-yellow-100 mr-1 align-middle"></span>Average (25-28)</span>
                  <span><span className="inline-block w-3 h-3 rounded bg-red-100 mr-1 align-middle"></span>Weak (&lt;25)</span>
                </div>
              </div>
            </div>
          )}

          {/* Bhinnashtakavarga for selected planet */}
          {PLANETS.includes(activeTab) && data.bhinnashtakavarga[activeTab] && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
                    <tr className="bg-slate-50">
                      {SIGN_ABBR.map(s => (
                        <th key={s} className="p-1.5 text-center border border-slate-200 text-slate-600 text-xs">{s}</th>
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
                <div className="flex gap-4 mt-3 text-xs text-slate-500">
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
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b">
                <h3 className="font-semibold text-slate-700 text-sm">All Planets Overview</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-2 text-left border border-slate-200">Planet</th>
                      {SIGN_ABBR.map(s => (
                        <th key={s} className="p-1 text-center border border-slate-200">{s}</th>
                      ))}
                      <th className="p-2 text-center border border-slate-200">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLANETS.map((planet, pi) => {
                      const row = data.bhinnashtakavarga[planet]
                      if (!row) return null
                      const total = row.reduce((s, c) => s + c.points, 0)
                      return (
                        <tr key={planet} className={pi % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-2 border border-slate-200 font-bold"
                              style={{ color: PLANET_COLORS[planet] ?? '#333' }}>
                            {planet.slice(0, 3)}
                          </td>
                          {row.map((cell, i) => (
                            <PointCell key={i} value={cell.points} />
                          ))}
                          <td className="p-2 text-center border border-slate-200 font-bold text-slate-700">
                            {total}
                          </td>
                        </tr>
                      )
                    })}
                    {/* Sarva total row */}
                    <tr className="bg-amber-50 font-bold">
                      <td className="p-2 border border-amber-300 text-amber-800">Total</td>
                      {data.sarvashtakavarga.map((cell, i) => (
                        <SarvaCell key={i} value={cell.points} />
                      ))}
                      <td className="p-2 text-center border border-amber-300 text-amber-800">
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
