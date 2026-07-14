// frontend/src/components/DivisionalCharts.jsx  v4
//
// Life-area gallery — shows all D charts the backend supports (D1–D60).
// Entry screen: named life domains grouped by category.
// Chart screen: chart + "this chart governs" prose + AI highlight.
//
// Color scheme: parchment background with night/amber accents, matching
// the landing page and Knowledge Center design system.

import { useState, useEffect } from 'react'
import KundliChart from './KundliChart'
import ChartHighlight from './ChartHighlight'
import { API_BASE } from '../api/config'

// ── Complete chart catalogue ──────────────────────────────────────────────────
// All divisions the backend supports via _get_divisional_sign()
// Grouped into: Primary life areas + Others (specialist/advanced)

const LIFE_AREAS = [
  // ── Core life domains (shown first — everyone understands these) ──────────
  {
    area: 'Relationships',
    chart: 'Navamsa',
    code: 'D9',
    d: 9,
    emoji: '❤️',
    group: 'main',
    governs: `Marriage, long-term partnerships, dharma, and the soul's deeper purpose. The D9 is considered equally important as the birth chart — a strong Navamsa protects and elevates everything indicated in D1.`,
  },
  {
    area: 'Career & Status',
    chart: 'Dasamsa',
    code: 'D10',
    d: 10,
    emoji: '💼',
    group: 'main',
    governs: `Profession, reputation, status, and achievements in the outer world. The D10 reveals what you are built to create publicly — and which planetary periods accelerate it most.`,
  },
  {
    area: 'Wealth & Income',
    chart: 'Hora',
    code: 'D2',
    d: 2,
    emoji: '💰',
    group: 'main',
    governs: `Money flow, income, and material accumulation. The D2 shows whether wealth comes through Sun-ruled effort or Moon-ruled inheritance and passive flow. Only two signs exist here — Solar or Lunar.`,
  },
  {
    area: 'Children',
    chart: 'Saptamsha',
    code: 'D7',
    d: 7,
    emoji: '👶',
    group: 'main',
    governs: `Children, progeny, and creative output. The D7 is consulted for timing of childbirth, fertility questions, and the nature of the parent-child bond across generations.`,
  },
  {
    area: 'Education & Intellect',
    chart: 'Siddhamsha',
    code: 'D24',
    d: 24,
    emoji: '📚',
    group: 'main',
    governs: `Formal learning, academic success, skill acquisition, and depth of intellect. The D24 reveals where your mind naturally excels and which fields of study are karmically supported.`,
  },
  {
    area: 'Property & Home',
    chart: 'Chaturthamsha',
    code: 'D4',
    d: 4,
    emoji: '🏡',
    group: 'main',
    governs: `Home, fixed assets, land, and immovable property. The D4 is the chart of roots — where you settle, what you accumulate in terms of physical foundation, and domestic happiness.`,
  },
  {
    area: 'Health',
    chart: 'Shashthamsha',
    code: 'D6',
    d: 6,
    emoji: '💚',
    group: 'main',
    governs: `Physical health, immunity, constitutional strength, and service. The D6 reveals chronic vulnerabilities, recovery capacity, and the kind of work that aligns with your body's natural rhythm.`,
  },
  {
    area: 'Spiritual Growth',
    chart: 'Vimsamsa',
    code: 'D20',
    d: 20,
    emoji: '🙏',
    group: 'main',
    governs: `Spiritual progress, devotion, sadhana, and inner development. The D20 shows the quality of your inner practice and which deity, mantra, or path is naturally aligned with your soul's design.`,
  },
  {
    area: 'Past Life & Karma',
    chart: 'Shashtiamsha',
    code: 'D60',
    d: 60,
    emoji: '♾️',
    group: 'main',
    governs: `Deep past-life imprints and karmic residues carried into this life. The D60 is the subtlest and most powerful chart — used by advanced practitioners to trace unexplained patterns and fated events.`,
  },
  // ── Personality & Life path ───────────────────────────────────────────────
  {
    area: 'Personality & Life Path',
    chart: 'Lagna',
    code: 'D1',
    d: 1,
    emoji: '🌅',
    group: 'other',
    governs: `The birth chart itself — your personality, overall life path, physical body, and the lens through which all other charts are interpreted. The foundation of Vedic astrology.`,
  },
  // ── Others / Specialist ───────────────────────────────────────────────────
  {
    area: 'Courage & Siblings',
    chart: 'Drekkana',
    code: 'D3',
    d: 3,
    emoji: '⚔️',
    group: 'other',
    governs: `Courage, initiative, siblings, short journeys, and communication. The D3 shows the quality of your will and how you navigate challenges and sibling relationships.`,
  },
  {
    area: 'Longevity & Transformation',
    chart: 'Ashtamsha',
    code: 'D8',
    d: 8,
    emoji: '🔄',
    group: 'other',
    governs: `Obstacles, longevity, sudden events, transformation, and the occult. The D8 reveals karmic debts that manifest as unexpected crises — and the depth of resilience available to meet them.`,
  },
  {
    area: 'Parents & Ancestry',
    chart: 'Dwadashamsha',
    code: 'D12',
    d: 12,
    emoji: '🌳',
    group: 'other',
    governs: `Parents, ancestors, lineage, and inherited patterns from family. The D12 illuminates the karmic quality of the parent-child bond and what you carry forward from your bloodline.`,
  },
  {
    area: 'Vehicles & Comforts',
    chart: 'Shodashamsha',
    code: 'D16',
    d: 16,
    emoji: '🚗',
    group: 'other',
    governs: `Vehicles, comforts, luxuries, travel pleasures, and conveyances. The D16 reveals the ease or difficulty surrounding material pleasures and modes of transportation in your life.`,
  },
  {
    area: 'Physical Strength',
    chart: 'Nakshatramsha',
    code: 'D27',
    d: 27,
    emoji: '💪',
    group: 'other',
    governs: `Physical vitality, bodily strength, athleticism, and constitutional endurance. The D27 provides a nakshatra-level view of your body's raw energetic capacity.`,
  },
  {
    area: 'Misfortunes & Debts',
    chart: 'Trimshamsha',
    code: 'D30',
    d: 30,
    emoji: '🔮',
    group: 'other',
    governs: `Misfortunes, karmic debts, chronic difficulties, and the nature of challenges. The D30 is studied to understand what kinds of suffering are karmically prescribed and how to mitigate them.`,
  },
  {
    area: 'Auspicious Patterns',
    chart: 'Khavedamsha',
    code: 'D40',
    d: 40,
    emoji: '✨',
    group: 'other',
    governs: `Auspicious yogas and patterns inherited through the maternal lineage. The D40 reveals blessings, fortunate combinations, and the quality of auspiciousness available in your life.`,
  },
  {
    area: 'General Well-being',
    chart: 'Akshavedamsha',
    code: 'D45',
    d: 45,
    emoji: '⚖️',
    group: 'other',
    governs: `Overall well-being, character, and general life quality. The D45 integrates multiple dimensions of the chart — consulted for a holistic view when other charts give contradictory signals.`,
  },
]

const MAIN_AREAS   = LIFE_AREAS.filter(a => a.group === 'main')
const OTHER_AREAS  = LIFE_AREAS.filter(a => a.group === 'other')

export default function DivisionalCharts({ input, defaultDivision }) {
  const [selectedArea, setSelectedArea] = useState(null)
  const [chartData, setChartData]       = useState(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [showOthers, setShowOthers]     = useState(false)

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

  // ── Area row component ────────────────────────────────────────────────────
  function AreaRow({ area }) {
    return (
      <button
        onClick={() => openArea(area)}
        className="w-full flex items-center justify-between px-0 py-3.5 text-left group transition-colors"
        style={{ borderBottom: '1px solid #EAE1CC' }}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Emoji in a small round container */}
          <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg"
               style={{ background: 'rgba(217,164,65,0.1)', border: '1px solid rgba(217,164,65,0.2)' }}>
            {area.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink leading-tight truncate">
              {area.area}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#A39C8C' }}>
              {area.chart} · {area.code}
            </p>
          </div>
        </div>
        <span className="shrink-0 ml-4 text-xs font-semibold transition-all group-hover:translate-x-0.5"
              style={{ color: '#D9A441' }}>
          View →
        </span>
      </button>
    )
  }

  // ── Gallery view ──────────────────────────────────────────────────────────
  if (!selectedArea) {
    return (
      <div>
        {/* Header */}
        <div className="mb-5 pb-4" style={{ borderBottom: '2px solid #EAE1CC' }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#D9A441' }}>
            Divisional Charts
          </p>
          <h2 className="font-serif font-bold text-xl text-ink mb-1">
            Explore Every Dimension of Your Life
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Each chart zooms into one life domain with precision the birth chart alone cannot offer.
            Select an area to view the chart that governs it.
          </p>
        </div>

        {/* Primary life areas */}
        <div className="mb-2">
          {MAIN_AREAS.map(area => (
            <AreaRow key={area.d} area={area} />
          ))}
        </div>

        {/* Others — collapsed by default */}
        <div className="mt-4">
          <button
            onClick={() => setShowOthers(v => !v)}
            className="flex items-center gap-2 text-sm font-semibold mb-2 transition"
            style={{ color: '#7A7264' }}
          >
            <span className="text-xs">{showOthers ? '▲' : '▼'}</span>
            {showOthers ? 'Hide' : 'Show'} specialist charts
            <span className="text-xs font-normal text-ink-faint">
              ({OTHER_AREAS.length} more)
            </span>
          </button>

          {showOthers && (
            <div>
              {OTHER_AREAS.map(area => (
                <AreaRow key={area.d} area={area} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Chart view ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Back */}
      <button
        onClick={clearSelection}
        className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
        style={{ color: '#7A7264' }}
      >
        ← All Life Areas
      </button>

      {/* Identity */}
      <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid #EAE1CC' }}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-2xl shrink-0"
             style={{ background: 'rgba(217,164,65,0.1)', border: '1px solid rgba(217,164,65,0.25)' }}>
          {selectedArea.emoji}
        </div>
        <div>
          <h2 className="font-serif font-bold text-xl text-ink leading-tight">
            {selectedArea.area}
          </h2>
          <p className="text-xs font-semibold mt-0.5" style={{ color: '#D9A441' }}>
            {selectedArea.chart} · {selectedArea.code}
          </p>
        </div>
      </div>

      {/* Governs description */}
      <div className="rounded-xl px-4 py-3.5 bg-parchment-card"
           style={{ border: '1px solid #EAE1CC' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#D9A441' }}>
          This chart governs
        </p>
        <p className="text-sm leading-relaxed text-ink">
          {selectedArea.governs}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-14">
          <div className="text-3xl animate-spin mb-3">🪐</div>
          <p className="text-sm font-medium text-ink-muted">Calculating {selectedArea.code}…</p>
          <div className="mt-3 w-40 h-1 rounded-full overflow-hidden bg-line">
            <div className="h-full rounded-full animate-pulse bg-primary w-3/4" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl p-4 text-sm bg-vermillion-light border border-vermillion/30 text-vermillion">
          ⚠️ {error}
          <button onClick={() => openArea(selectedArea)} className="ml-3 underline text-xs">Retry</button>
        </div>
      )}

      {/* Chart + AI insight */}
      {!loading && chartData && (
        <div className="space-y-4">
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
