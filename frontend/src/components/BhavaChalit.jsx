// Bhava Chalit: equal 30°-wide houses centred on the ascendant degree
// Shows where planets shift between Rashi (whole-sign) and Bhava houses
import { useState, useEffect } from 'react'
import { API_BASE } from '../api/config'
import { PLANET_COLORS } from '../config/planetColors'

export default function BhavaChalit({ input }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [view, setView] = useState('table')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/kundli/bhava-chalit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: input.date, time: input.time, place: input.place }),
      })
      if (!res.ok) throw new Error('Failed')
      setData(await res.json())
    } catch {
      setError('Could not load Bhava Chalit data.')
    }
    setLoading(false)
  }

  // Pure Swiss Ephemeris calculation, not an LLM call — auto-load like
  // every other non-LLM tab, instead of gating behind a click.
  useEffect(() => { load() }, [])

  return (
    <div className="space-y-4">
      <div className="bg-sage-light border border-sage/30 rounded-xl p-4">
        <h2 className="text-sage font-bold text-base">Bhava Chalit Chart</h2>
        <p className="text-sage text-xs mt-1">
          Equal 30°-wide houses centred on your ascendant degree. Shows where planets
          shift from their Rashi (whole-sign) house to their actual Bhava house.
        </p>
        <button onClick={load} disabled={loading}
                className="mt-3 text-xs bg-sage text-white px-3 py-1.5 rounded-lg hover:bg-sage/80 disabled:opacity-50">
          {loading ? 'Calculating…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-vermillion-light border border-vermillion/30 rounded-lg p-4 text-vermillion text-sm">⚠️ {error}</div>
      )}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-3xl animate-spin">🏠</div>
        </div>
      )}

      {data && !loading && (
        <>
          {/* View toggle */}
          <div className="flex gap-2">
            {[['table','Planets'], ['madhya','House Centres'], ['sandhi','House Boundaries']].map(([id, label]) => (
              <button key={id} onClick={() => setView(id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                        view === id
                          ? 'bg-sage border-sage text-white'
                          : 'bg-parchment-card border-line text-ink-muted hover:border-sage/50'
                      }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Ascendant info */}
          <div className="bg-primary-light border border-primary/30 rounded-xl px-4 py-2.5 text-sm">
            <span className="font-semibold text-primary-dark">Ascendant: </span>
            <span className="text-primary-dark">
              {data.ascendant.sign} {data.ascendant.degree.toFixed(2)}°
            </span>
            <span className="text-primary-dark/70 text-xs ml-2">
              (Bhava 1 centre = {data.ascendant.degree.toFixed(2)}° {data.ascendant.sign})
            </span>
          </div>

          {/* Planet comparison table */}
          {view === 'table' && (
            <div className="bg-parchment-card rounded-xl border border-line overflow-hidden">
              <div className="px-4 py-3 bg-night/[0.03] border-b">
                <h3 className="font-semibold text-ink text-sm">
                  Planet House Comparison — Rashi vs Bhava
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-night/[0.03] text-ink-muted">
                      <th className="p-2.5 text-left border-b">Planet</th>
                      <th className="p-2.5 text-left border-b">Sign</th>
                      <th className="p-2.5 text-right border-b">Degree</th>
                      <th className="p-2.5 text-left border-b">Nakshatra</th>
                      <th className="p-2.5 text-center border-b">Rashi House</th>
                      <th className="p-2.5 text-center border-b">Bhava House</th>
                      <th className="p-2.5 text-center border-b">Shifted?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.planets.map((p, i) => (
                      <tr key={p.name}
                          className={`${i % 2 === 0 ? 'bg-parchment-card' : 'bg-night/[0.03]'} ${p.changed ? 'ring-1 ring-inset ring-primary/50' : ''}`}>
                        <td className="p-2.5 border-b font-bold"
                            style={{ color: PLANET_COLORS[p.name] ?? '#333' }}>
                          {p.name}
                        </td>
                        <td className="p-2.5 border-b">{p.sign}</td>
                        <td className="p-2.5 border-b text-right tabular-nums">
                          {p.degree.toFixed(2)}°
                        </td>
                        <td className="p-2.5 border-b text-ink-muted">{p.nakshatra}</td>
                        <td className="p-2.5 border-b text-center font-bold text-primary-dark">
                          {p.rashi_house}
                        </td>
                        <td className={`p-2.5 border-b text-center font-bold ${p.changed ? 'text-primary-dark' : 'text-primary-dark'}`}>
                          {p.bhava_house}
                        </td>
                        <td className="p-2.5 border-b text-center">
                          {p.changed
                            ? <span className="text-primary-dark font-bold">H{p.rashi_house}→H{p.bhava_house}</span>
                            : <span className="text-green-600">Same</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bhava madhya */}
          {view === 'madhya' && (
            <div className="bg-parchment-card rounded-xl border border-line overflow-hidden">
              <div className="px-4 py-3 bg-sage-light border-b">
                <h3 className="font-semibold text-sage text-sm">Bhava Madhya (House Centres)</h3>
                <p className="text-sage text-xs mt-0.5">The midpoint degree of each house</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-night/[0.03]">
                      <th className="p-2 text-center border-b">Bhava</th>
                      <th className="p-2 text-left border-b">Sign</th>
                      <th className="p-2 text-right border-b">Degree</th>
                      <th className="p-2 text-left border-b">Planets (Bhava)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bhava_madhya.map((bm, i) => {
                      const planetsHere = data.planets.filter(p => p.bhava_house === bm.bhava)
                      return (
                        <tr key={bm.bhava} className={i % 2 === 0 ? 'bg-parchment-card' : 'bg-night/[0.03]'}>
                          <td className="p-2 border-b text-center font-bold text-sage">{bm.bhava}</td>
                          <td className="p-2 border-b">{bm.sign}</td>
                          <td className="p-2 border-b text-right tabular-nums">{bm.degree.toFixed(2)}°</td>
                          <td className="p-2 border-b">
                            {planetsHere.map(p => (
                              <span key={p.name} className="inline-block px-1 mr-1 rounded text-white text-xs"
                                    style={{ backgroundColor: PLANET_COLORS[p.name] ?? '#888' }}>
                                {p.name.slice(0, 2)}
                              </span>
                            ))}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bhava sandhi */}
          {view === 'sandhi' && (
            <div className="bg-parchment-card rounded-xl border border-line overflow-hidden">
              <div className="px-4 py-3 bg-sage-light border-b">
                <h3 className="font-semibold text-sage text-sm">Bhava Sandhi (House Boundaries)</h3>
                <p className="text-sage text-xs mt-0.5">The cusp/boundary where each house begins</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-night/[0.03]">
                      <th className="p-2 text-left border-b">Boundary (before Bhava)</th>
                      <th className="p-2 text-left border-b">Sign</th>
                      <th className="p-2 text-right border-b">Degree</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bhava_sandhi.map((bs, i) => (
                      <tr key={bs.boundary_before_bhava} className={i % 2 === 0 ? 'bg-parchment-card' : 'bg-night/[0.03]'}>
                        <td className="p-2 border-b text-ink-muted">Before Bhava {bs.boundary_before_bhava}</td>
                        <td className="p-2 border-b font-medium">{bs.sign}</td>
                        <td className="p-2 border-b text-right tabular-nums">{bs.degree.toFixed(2)}°</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-night/[0.03] rounded-xl p-4 text-xs text-ink-muted">
            <p className="font-semibold text-ink mb-1">About Bhava Chalit</p>
            <p>In Bhava Chalit, each house is 30° wide and centred on the exact ascendant degree.
               A planet near the boundary (sandhi) between two signs may shift to a different house
               than its Rashi (whole-sign) placement indicates. Planets marked <strong className="text-primary-dark">yellow</strong> have shifted.</p>
          </div>
        </>
      )}
    </div>
  )
}
