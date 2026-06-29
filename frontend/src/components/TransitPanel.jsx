// Transit chart panel: shows current planet positions on natal chart
import { useState, useEffect } from 'react'
import KundliChart from './KundliChart'
import { API_BASE } from '../api/config'
import { PLANET_COLORS } from '../config/planetColors'

export default function TransitPanel({ input, natalData }) {
  const [transitData, setTransitData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  async function loadTransit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/kundli/transit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: input.date, time: input.time, place: input.place }),
      })
      if (!res.ok) throw new Error('Failed')
      setTransitData(await res.json())
    } catch {
      setError('Could not load transit data.')
    }
    setLoading(false)
  }

  useEffect(() => { loadTransit() }, [])

  const natalAsc = natalData?.ascendant
  const natalPlanets = natalData?.planets ?? []

  return (
    <div className="space-y-4">
      <div className="bg-primary-light border border-primary/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-primary-dark font-bold text-base">Transit Chart</h2>
            <p className="text-primary-dark text-xs mt-0.5">
              Current planetary positions overlaid on your natal chart
            </p>
          </div>
          <button onClick={loadTransit}
                  className="text-xs bg-primary text-night px-3 py-1.5 rounded-lg hover:bg-primary-dark">
            Refresh
          </button>
        </div>
        {transitData && (
          <p className="text-xs text-primary-dark mt-2">As of: {transitData.transit_date}</p>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="text-center">
            <div className="text-3xl animate-spin mb-3">🌍</div>
            <p className="text-ink-muted text-sm">Loading transit positions…</p>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {transitData && !loading && (
        <>
          {/* Chart with transit overlay */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="w-full sm:w-[460px]">
              <KundliChart
                planets={natalPlanets}
                ascendant={natalAsc}
                title="Transit on Natal (North Indian)"
                transitPlanets={transitData.transit_planets}
              />
            </div>
          </div>

          {/* Transit planet table */}
          <div className="bg-parchment-card rounded-xl border border-line overflow-hidden">
            <div className="px-4 py-3 bg-primary-light border-b border-primary/30">
              <h3 className="font-semibold text-primary-dark text-sm">Current Transit Positions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-night/[0.03] text-ink-muted">
                    <th className="p-2 text-left border-b">Planet</th>
                    <th className="p-2 text-left border-b">Transit Sign</th>
                    <th className="p-2 text-right border-b">Degree</th>
                    <th className="p-2 text-left border-b">Nakshatra</th>
                    <th className="p-2 text-center border-b">Natal House</th>
                    <th className="p-2 text-left border-b">Natal Sign</th>
                  </tr>
                </thead>
                <tbody>
                  {transitData.transit_planets.map((tp, i) => {
                    const natal = natalPlanets.find(p => p.name === tp.name)
                    return (
                      <tr key={tp.name}
                          className={i % 2 === 0 ? 'bg-parchment-card' : 'bg-night/[0.03]'}>
                        <td className="p-2 border-b font-medium"
                            style={{ color: PLANET_COLORS[tp.name] ?? '#333' }}>
                          {tp.name}
                          {tp.retrograde && <span className="text-vermillion ml-1">R</span>}
                        </td>
                        <td className="p-2 border-b">{tp.sign}</td>
                        <td className="p-2 border-b text-right tabular-nums">
                          {tp.degree.toFixed(1)}°
                        </td>
                        <td className="p-2 border-b text-ink-muted">{tp.nakshatra}</td>
                        <td className="p-2 border-b text-center text-primary-dark font-medium">
                          {tp.house}
                        </td>
                        <td className="p-2 border-b text-ink-muted">
                          {natal ? `${natal.sign} ${natal.degree.toFixed(0)}°` : '–'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
