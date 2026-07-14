// frontend/src/components/DivisionalCharts.jsx  v3
//
// Life-area card gallery. The entry screen shows 9 life domains — not raw
// chart codes. Clicking a domain reveals the chart with a human-readable
// description of what it governs, then the AI highlight below.
//
// Structure:
//   1. Life-area cards  — emoji + area name + chart code + one-liner
//   2. Chart view       — full-width chart + "what this chart governs" prose
//   3. AI Highlight     — ChartHighlight (loaded on demand)

import { useState, useEffect } from 'react'
import KundliChart from './KundliChart'
import ChartHighlight from './ChartHighlight'
import { API_BASE } from '../api/config'

// ── Life-area catalogue ───────────────────────────────────────────────────────
// Ordered by the most recognisable life domains first.
// Each entry: display area, chart code (shown after click), division number,
// governing description shown in the chart view, emoji, and group.
const LIFE_AREAS = [
  {
    area: 'Relationships',
    chart: 'Navamsa',
    code: 'D9',
    d: 9,
    emoji: '❤️',
    governs: 'Marriage, long-term partnerships, dharma, and the soul's deeper purpose. The D9 is considered equally important as the birth chart — a strong Navamsa protects and elevates.',
  },
  {
    area: 'Career',
    chart: 'Dasamsa',
    code: 'D10',
    d: 10,
    emoji: '💼',
    governs: 'Profession, status, reputation, and achievements in the outer world. The D10 reveals what you are here to build — and which planetary periods accelerate it.',
  },
  {
    area: 'Wealth',
    chart: 'Hora',
    code: 'D2',
    d: 2,
    emoji: '💰',
    governs: 'Income, money flow, and material accumulation. The D2 shows whether your wealth comes through Sun-ruled effort or Moon-ruled inheritance and flow.',
  },
  {
    area: 'Children',
    chart: 'Saptamsha',
    code: 'D7',
    d: 7,
    emoji: '👶',
    governs: 'Children, progeny, and creative output. The D7 is consulted for timing of childbirth and the nature of the parent-child relationship.',
  },
  {
    area: 'Education',
    chart: 'Siddhamsha',
    code: 'D24',
    d: 24,
    emoji: '📚',
    governs: 'Formal learning, intellect, skill acquisition, and academic success. The D24 reveals the depth and direction of your intellectual potential.',
  },
  {
    area: 'Property',
    chart: 'Chaturthamsha',
    code: 'D4',
    d: 4,
    emoji: '🏡',
    governs: 'Home, fixed assets, land, and immovable property. The D4 is the chart of roots — where you settle and what you accumulate in terms of physical foundation.',
  },
  {
    area: 'Spiritual',
    chart: 'Vimsamsa',
    code: 'D20',
    d: 20,
    emoji: '🙏',
    governs: 'Spiritual progress, devotion, and sadhana. The D20 shows the quality of your inner practice and which deity or path is naturally aligned with your soul.',
  },
  {
    area: 'Past Karma',
    chart: 'Shashtiamsha',
    code: 'D60',
    d: 60,
    emoji: '♾️',
    governs: 'Deep past-life imprints and karmic residues carried into this life. The D60 is the subtlest chart — used by advanced practitioners to trace unexplained patterns.',
  },
  {
    area: 'Health',
    chart: 'Shashthamsha',
    code: 'D6',
    d: 6,
    emoji: '💚',
    governs: 'Physical health, immunity, service, and the nature of illnesses. The D6 reveals constitutional strengths and vulnerabilities at the cellular level.',
  },
]

export default function DivisionalCharts({ input, defaultDivision }) {
  const [selectedArea, setSelectedArea] = useState(null)  // LIFE_AREAS entry
  const [chartData, setChartData]       = useState(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)

  // Auto-load the default division if provided by topic
  useEffect(() => {
    if (!defaultDivision) return
    const area = LIFE_AREAS.find(a => a.d === defaultDivision)
    if (area) openArea(area)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function openArea(area) {
    setSelectedArea(area)
    setChartData(null)
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/kundli/divisional?division=${area.d}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: input.date, time: input.time, place: input.place }),
      })
      if (!res.ok) throw new Error('Failed to fetch chart')
      setChartData(await res.json())
    } catch {
      setError('Could not load chart. Please try again.')
    }
    setLoading(false)
  }

  function clearSelection() {
    setSelectedArea(null)
    setChartData(null)
    setError(null)
  }

  // ── Gallery view ───────────────────────────────────────────────────────────
  if (!selectedArea) {
    return (
      <div className="space-y-5">

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl px-5 py-4"
             style={{ background: '#171B33', border: '1px solid rgba(212,175,55,0.25)' }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {['top-2 right-8','top-5 right-24','top-1 right-40'].map((pos, i) => (
              <div key={i} className={`absolute ${pos} text-[8px]`}
                   style={{ color: 'rgba(212,175,55,0.35)' }}>✦</div>
            ))}
          </div>
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1"
               style={{ color: 'rgba(212,175,55,0.6)' }}>Divisional Charts</p>
            <h2 className="font-serif font-bold text-base mb-1" style={{ color: '#E8DCC8' }}>
              Explore Every Dimension of Your Life
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,220,200,0.6)' }}>
              Each chart zooms in on one area of life with precision no single birth chart can offer.
              Select a domain to see the chart that governs it.
            </p>
          </div>
        </div>

        {/* Life-area cards */}
        <div className="divide-y" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
          {LIFE_AREAS.map(area => (
            <button
              key={area.d}
              onClick={() => openArea(area)}
              className="w-full flex items-center justify-between px-1 py-4 text-left group transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl shrink-0">{area.emoji}</span>
                <div>
                  <p className="font-serif font-bold text-base leading-tight" style={{ color: '#E8DCC8' }}>
                    {area.area}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(212,175,55,0.6)' }}>
                    {area.chart} ({area.code})
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold shrink-0 ml-4 transition-transform group-hover:translate-x-0.5"
                    style={{ color: 'rgba(212,175,55,0.6)' }}>
                View →
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Chart view ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Back link */}
      <button
        onClick={clearSelection}
        className="flex items-center gap-1.5 text-xs font-semibold transition"
        style={{ color: 'rgba(212,175,55,0.7)' }}
      >
        ← All Life Areas
      </button>

      {/* Chart identity header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{selectedArea.emoji}</span>
        <div>
          <h2 className="font-serif font-bold text-xl leading-tight" style={{ color: '#E8DCC8' }}>
            {selectedArea.area}
          </h2>
          <p className="text-xs font-semibold" style={{ color: 'rgba(212,175,55,0.6)' }}>
            {selectedArea.chart} · {selectedArea.code}
          </p>
        </div>
      </div>

      {/* Governs description */}
      <div className="rounded-xl px-4 py-3"
           style={{ background: '#171B33', border: '1px solid rgba(212,175,55,0.15)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
           style={{ color: 'rgba(212,175,55,0.5)' }}>
          This chart governs
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(232,220,200,0.75)' }}>
          {selectedArea.governs}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-14">
          <div className="text-3xl animate-spin mb-3">🪐</div>
          <p className="text-sm font-medium" style={{ color: '#D4AF37' }}>
            Calculating {selectedArea.code}…
          </p>
          <div className="mt-3 w-40 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(212,175,55,0.1)' }}>
            <div className="h-full rounded-full animate-pulse" style={{ width: '70%', background: 'linear-gradient(90deg,#2D1B69,#D4AF37)' }} />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: '#2A1010', border: '1px solid rgba(162,59,59,0.4)', color: '#E08080' }}>
          ⚠️ {error}
          <button onClick={() => openArea(selectedArea)} className="ml-3 underline text-xs">Retry</button>
        </div>
      )}

      {/* Chart + AI insight */}
      {!loading && chartData && (
        <div className="space-y-1">
          <div className="flex justify-center">
            <div className="w-full sm:w-[480px]">
              <KundliChart
                planets={chartData.planets}
                ascendant={chartData.ascendant}
                title={`${selectedArea.code} — ${selectedArea.chart}`}
              />
            </div>
          </div>
          <ChartHighlight input={input} chartType={selectedArea.code} />
        </div>
      )}

    </div>
  )
}
