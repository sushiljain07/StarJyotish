// Bhava Chalit: equal 30°-wide houses centred on the ascendant degree
// Shows where planets shift between Rashi (whole-sign) and Bhava houses
import { useState } from 'react'
import { API_BASE } from '../api/config'

const PLANET_COLORS = {
  Sun: '#E53E3E', Moon: '#7B61FF', Mars: '#CC2200', Mercury: '#16A34A',
  Jupiter: '#2563EB', Venus: '#E91E8C', Saturn: '#1E40AF', Rahu: '#8B0000',
  Ketu: '#5B21B6', Neptune: '#7C3AED', Uranus: '#0891B2', Pluto: '#374151',
}

export default function BhavaChality({ input }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loaded, setLoaded] = useState(false)
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
      setLoaded(true)
    } catch {
      setError('Could not load Bhava Chalit data.')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
        <h2 className="text-teal-800 font-bold text-base">Bhava Chalit Chart</h2>
        <p className="text-teal-600 text-xs mt-1">
          Equal 30°-wide houses centred on your ascendant degree. Shows where planets
          shift from their Rashi (whole-sign) house to their actual Bhava house.
        </p>
        {!loaded && (
          <button onClick={load} disabled={loading}
                  className="mt-3 text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50">
            {loading ? 'Calculating…' : 'Load Bhava Chalit'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">⚠️ {error}</div>
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
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-teal-400'
                      }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Ascendant info */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm">
            <span className="font-semibold text-amber-800">Ascendant: </span>
            <span className="text-amber-700">
              {data.ascendant.sign} {data.ascendant.degree.toFixed(2)}°
            </span>
            <span className="text-amber-500 text-xs ml-2">
              (Bhava 1 centre = {data.ascendant.degree.toFixed(2)}° {data.ascendant.sign})
            </span>
          </div>

          {/* Planet comparison table */}
          {view === 'table' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b">
                <h3 className="font-semibold text-slate-700 text-sm">
                  Planet House Comparison — Rashi vs Bhava
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600">
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
                          className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} ${p.changed ? 'ring-1 ring-inset ring-amber-300' : ''}`}>
                        <td className="p-2.5 border-b font-bold"
                            style={{ color: PLANET_COLORS[p.name] ?? '#333' }}>
                          {p.name}
                        </td>
                        <td className="p-2.5 border-b">{p.sign}</td>
                        <td className="p-2.5 border-b text-right tabular-nums">
                          {p.degree.toFixed(2)}°
                        </td>
                        <td className="p-2.5 border-b text-slate-600">{p.nakshatra}</td>
                        <td className="p-2.5 border-b text-center font-bold text-indigo-700">
                          {p.rashi_house}
                        </td>
                        <td className={`p-2.5 border-b text-center font-bold ${p.changed ? 'text-amber-700' : 'text-indigo-700'}`}>
                          {p.bhava_house}
                        </td>
                        <td className="p-2.5 border-b text-center">
                          {p.changed
                            ? <span className="text-amber-600 font-bold">H{p.rashi_house}→H{p.bhava_house}</span>
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
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-teal-50 border-b">
                <h3 className="font-semibold text-teal-800 text-sm">Bhava Madhya (House Centres)</h3>
                <p className="text-teal-600 text-xs mt-0.5">The midpoint degree of each house</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50">
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
                        <tr key={bm.bhava} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-2 border-b text-center font-bold text-teal-700">{bm.bhava}</td>
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
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-teal-50 border-b">
                <h3 className="font-semibold text-teal-800 text-sm">Bhava Sandhi (House Boundaries)</h3>
                <p className="text-teal-600 text-xs mt-0.5">The cusp/boundary where each house begins</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-2 text-left border-b">Boundary (before Bhava)</th>
                      <th className="p-2 text-left border-b">Sign</th>
                      <th className="p-2 text-right border-b">Degree</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bhava_sandhi.map((bs, i) => (
                      <tr key={bs.boundary_before_bhava} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-2 border-b text-slate-600">Before Bhava {bs.boundary_before_bhava}</td>
                        <td className="p-2 border-b font-medium">{bs.sign}</td>
                        <td className="p-2 border-b text-right tabular-nums">{bs.degree.toFixed(2)}°</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-700 mb-1">About Bhava Chalit</p>
            <p>In Bhava Chalit, each house is 30° wide and centred on the exact ascendant degree.
               A planet near the boundary (sandhi) between two signs may shift to a different house
               than its Rashi (whole-sign) placement indicates. Planets marked <strong className="text-amber-600">yellow</strong> have shifted.</p>
          </div>
        </>
      )}
    </div>
  )
}
