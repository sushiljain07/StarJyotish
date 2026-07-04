// frontend/src/components/DivisionalCharts.jsx
// Save this as a NEW file in: frontend/src/components/DivisionalCharts.jsx

import { useState, useEffect } from 'react'
import KundliChart from './KundliChart'
import { API_BASE } from '../api/config'

// All divisional charts info
const DIVISIONS = [
  { d: 1,  name: 'D1',  title: 'Lagna',           desc: 'Overall life & personality' },
  { d: 2,  name: 'D2',  title: 'Hora',             desc: 'Wealth & finances' },
  { d: 3,  name: 'D3',  title: 'Drekkana',         desc: 'Courage & siblings' },
  { d: 4,  name: 'D4',  title: 'Chaturthamsha',    desc: 'Fortune & home' },
  { d: 6,  name: 'D6',  title: 'Shashthamsha',     desc: 'Health & diseases' },
  { d: 7,  name: 'D7',  title: 'Saptamsha',        desc: 'Children & progeny' },
  { d: 9,  name: 'D9',  title: 'Navamsha',         desc: 'Marriage & dharma' },
  { d: 10, name: 'D10', title: 'Dashamsha',        desc: 'Career & profession' },
  { d: 12, name: 'D12', title: 'Dwadashamsha',     desc: 'Parents & ancestry' },
  { d: 16, name: 'D16', title: 'Shodashamsha',     desc: 'Vehicles & comforts' },
  { d: 20, name: 'D20', title: 'Vimshamsha',       desc: 'Spiritual progress' },
  { d: 24, name: 'D24', title: 'Siddhamsha',       desc: 'Education & learning' },
  { d: 27, name: 'D27', title: 'Nakshatramsha',    desc: 'Strength & vitality' },
  { d: 30, name: 'D30', title: 'Trimshamsha',      desc: 'Misfortunes & evils' },
  { d: 40, name: 'D40', title: 'Khavedamsha',      desc: 'Auspicious & inauspicious' },
  { d: 45, name: 'D45', title: 'Akshavedamsha',    desc: 'General well-being' },
  { d: 60, name: 'D60', title: 'Shashtiamsha',     desc: 'Past-life karma' },
]

export default function DivisionalCharts({ input, defaultDivision }) {
  const [selectedD, setSelectedD] = useState(defaultDivision ?? null)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchDivisional(division) {
    setLoading(true)
    setError(null)
    setSelectedD(division)
    try {
      const res = await fetch(`${API_BASE}/api/kundli/divisional?division=${division}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: input.date,
          time: input.time,
          place: input.place,
        }),
      })
      if (!res.ok) throw new Error('Failed to fetch chart')
      const data = await res.json()
      setChartData(data)
    } catch {
      setError('Could not load chart. Please try again.')
    }
    setLoading(false)
  }

  // Auto-load the topic-relevant chart on first render — selectedD alone
  // only highlights the pill; the actual data still needs fetching.
  useEffect(() => {
    if (defaultDivision) fetchDivisional(defaultDivision)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selected = DIVISIONS.find(d => d.d === selectedD)

  return (
    <div className="space-y-4">

      {/* Title */}
      <div className="bg-primary-light border border-primary/30 rounded-xl p-4">
        <h2 className="text-primary-dark font-bold text-base">
          🪐 Divisional Charts (Varga Charts)
        </h2>
        <p className="text-primary-dark text-xs mt-1">
          Click any chart below to view it. Each chart reveals a different area of life.
        </p>
      </div>

      {/* Chart buttons grid */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {DIVISIONS.map(({ d, name, title, desc }) => (
          <button
            key={d}
            onClick={() => fetchDivisional(d)}
            title={`${title} — ${desc}`}
            className={`
              flex flex-col items-center justify-center min-w-0
              rounded-xl p-2 border text-center
              transition-all duration-150 cursor-pointer
              ${selectedD === d
                ? 'bg-primary border-primary text-night shadow-md scale-105'
                : 'bg-parchment-card border-line text-ink hover:border-primary/50 hover:bg-primary-light'
              }
            `}
          >
            <span className="font-bold text-sm">{name}</span>
            <span className={`text-[10px] mt-0.5 w-full truncate px-0.5 ${selectedD === d ? 'text-primary-light' : 'text-ink-faint'}`}>
              {title}
            </span>
          </button>
        ))}
      </div>

      {/* Selected chart info banner */}
      {selected && (
        <div className="bg-vermillion-light border border-vermillion/30 rounded-lg px-4 py-2 flex items-center gap-3 flex-wrap">
          <span className="text-vermillion font-bold text-sm">{selected.name} — {selected.title}</span>
          <span className="text-vermillion text-xs">{selected.desc}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-3xl animate-spin mb-3">🪐</div>
            <p className="text-ink-muted text-sm">Calculating {selected?.name} chart...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Chart display */}
      {!loading && chartData && selected && (
        <div className="flex justify-center">
          <div className="w-full sm:w-[480px]">
            <KundliChart
              planets={chartData.planets}
              ascendant={chartData.ascendant}
              title={`${selected.name} — ${selected.title} (${selected.desc})`}
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !chartData && (
        <div className="text-center py-12 text-ink-faint">
          <img src="/starjyotish.svg" alt="" className="w-10 h-10 mx-auto mb-3 opacity-60" />
          <p className="text-sm">Select a divisional chart above to view it</p>
        </div>
      )}

    </div>
  )
}
