// Transit chart panel: shows current planet positions on natal chart
import { useState, useEffect } from 'react'
import KundliChart from './KundliChart'
import SouthIndiaChart from './SouthIndiaChart'

const PLANET_COLORS = {
  Sun: '#E53E3E', Moon: '#E53E3E', Mars: '#E53E3E', Rahu: '#E53E3E',
  Saturn: '#2563EB', Jupiter: '#2563EB', Mercury: '#16A34A', Venus: '#16A34A',
  Ketu: '#8B0000', Neptune: '#7C3AED', Uranus: '#7C3AED', Pluto: '#374151',
}

const SIGN_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                    'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']

export default function TransitPanel({ input, natalData }) {
  const [transitData, setTransitData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [chartStyle, setChartStyle] = useState('north')

  async function loadTransit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/kundli/transit', {
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
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-indigo-800 font-bold text-base">Transit Chart</h2>
            <p className="text-indigo-600 text-xs mt-0.5">
              Current planetary positions overlaid on your natal chart
            </p>
          </div>
          <button onClick={loadTransit}
                  className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
            Refresh
          </button>
        </div>
        {transitData && (
          <p className="text-xs text-indigo-500 mt-2">As of: {transitData.transit_date}</p>
        )}
      </div>

      {/* Chart style selector */}
      <div className="flex gap-2">
        {[['north','North Indian'], ['south','South Indian']].map(([id, label]) => (
          <button key={id} onClick={() => setChartStyle(id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    chartStyle === id
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                  }`}>
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="text-center">
            <div className="text-3xl animate-spin mb-3">🌍</div>
            <p className="text-slate-500 text-sm">Loading transit positions…</p>
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
              {chartStyle === 'south' ? (
                <SouthIndiaChart
                  planets={natalPlanets}
                  ascendant={natalAsc}
                  title="Transit on Natal (South Indian)"
                  transitPlanets={transitData.transit_planets}
                />
              ) : (
                <KundliChart
                  planets={natalPlanets}
                  ascendant={natalAsc}
                  title="Transit on Natal (North Indian)"
                  transitPlanets={transitData.transit_planets}
                />
              )}
            </div>
          </div>

          {/* Transit planet table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
              <h3 className="font-semibold text-amber-800 text-sm">Current Transit Positions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
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
                          className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-2 border-b font-medium"
                            style={{ color: PLANET_COLORS[tp.name] ?? '#333' }}>
                          {tp.name}
                          {tp.retrograde && <span className="text-amber-500 ml-1">R</span>}
                        </td>
                        <td className="p-2 border-b">{tp.sign}</td>
                        <td className="p-2 border-b text-right tabular-nums">
                          {tp.degree.toFixed(1)}°
                        </td>
                        <td className="p-2 border-b text-slate-600">{tp.nakshatra}</td>
                        <td className="p-2 border-b text-center text-indigo-700 font-medium">
                          {tp.house}
                        </td>
                        <td className="p-2 border-b text-slate-500">
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
