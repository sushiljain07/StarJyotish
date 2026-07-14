// frontend/src/components/DivisionalCharts.jsx  v5
//
// All 17 backend-supported divisional charts (D1–D60) mapped to 6 life-domain
// groups: Life / Career / Relationships / Wealth / Health / Spiritual.
// D27 appears in Life + Career; D60 in Life + Spiritual (editorially correct).
// D3 appears only in Relationships (Siblings & Courage).
// D8 only in Health (Longevity).
// D40 and D45 only in Spiritual.
// Every division the backend computes is reachable from at least one group.

import { useState, useEffect } from 'react'
import KundliChart from './KundliChart'
import ChartHighlight from './ChartHighlight'
import { API_BASE } from '../api/config'

// Backend supports: D1 D2 D3 D4 D6 D7 D8 D9 D10 D12 D16 D20 D24 D27 D30 D40 D45 D60
// Coverage check below — every D must appear at least once across all groups.

const GROUPS = [
  // ── Life ──────────────────────────────────────────────────────────────────
  {
    id: 'life',
    label: 'Life',
    emoji: '🧑',
    charts: [
      {
        area: 'Life Path',
        chart: 'Rashi / Lagna',
        code: 'D1',
        d: 1,
        governs: "Overall life, personality, physical body, and destiny. The birth chart itself — the lens through which all other divisional charts are interpreted.",
      },
      {
        area: 'Strengths & Talents',
        chart: 'Saptavimshamsa',
        code: 'D27',
        d: 27,
        governs: "Inner strengths, weaknesses, resilience, and abilities. The D27 gives a nakshatra-level view of your raw energetic capacity, natural talents, and areas of constitutional strength.",
      },
      {
        area: 'Challenges & Obstacles',
        chart: 'Trimshamsha',
        code: 'D30',
        d: 30,
        governs: "Misfortunes, suffering, hidden weaknesses, and karmic challenges. The D30 reveals what difficulties are karmically prescribed and how to work with — rather than against — them.",
      },
      {
        area: 'Past Karma',
        chart: 'Shashtiamsa',
        code: 'D60',
        d: 60,
        governs: "Past-life karma and the deepest karmic influences shaping this life. The D60 is the subtlest and most powerful chart — used to trace unexplained patterns and fated events across lifetimes.",
      },
    ],
  },
  // ── Career ────────────────────────────────────────────────────────────────
  {
    id: 'career',
    label: 'Career',
    emoji: '💼',
    charts: [
      {
        area: 'Career & Profession',
        chart: 'Dasamsa',
        code: 'D10',
        d: 10,
        governs: "Career, profession, reputation, and success. The D10 reveals what you are built to create in the public world and which planetary periods accelerate your professional rise.",
      },
      {
        area: 'Education & Learning',
        chart: 'Chaturvimshamsa',
        code: 'D24',
        d: 24,
        governs: "Education, learning, knowledge, and wisdom. The D24 reveals where your mind excels, which fields of study are karmically supported, and the depth of your intellectual potential.",
      },
      {
        area: 'Strengths & Talents',
        chart: 'Saptavimshamsa',
        code: 'D27',
        d: 27,
        governs: "Inner strengths, weaknesses, resilience, and abilities. The D27 gives a nakshatra-level view of your raw energetic capacity, natural talents, and areas of constitutional strength.",
      },
    ],
  },
  // ── Relationships ─────────────────────────────────────────────────────────
  {
    id: 'relationships',
    label: 'Relationships',
    emoji: '❤️',
    charts: [
      {
        area: 'Marriage & Relationships',
        chart: 'Navamsa',
        code: 'D9',
        d: 9,
        governs: "Marriage, spouse, relationships, dharma, and inner strength. The D9 is considered equally important as the birth chart — a strong Navamsa elevates everything indicated in D1.",
      },
      {
        area: 'Children & Family',
        chart: 'Saptamsa',
        code: 'D7',
        d: 7,
        governs: "Children, fertility, parenting, and creative output. The D7 is consulted for timing of childbirth, fertility questions, and the karmic quality of the parent-child bond.",
      },
      {
        area: 'Parents & Heritage',
        chart: 'Dwadashamsa',
        code: 'D12',
        d: 12,
        governs: "Parents, ancestors, lineage, and family heritage. The D12 illuminates the karmic quality of the parent-child bond and the patterns you carry forward from your bloodline.",
      },
      {
        area: 'Courage & Siblings',
        chart: 'Drekkana',
        code: 'D3',
        d: 3,
        governs: "Siblings, courage, initiative, and communication. The D3 reveals the quality of your will, your bonds with siblings, and how you navigate challenges with initiative.",
      },
    ],
  },
  // ── Wealth ────────────────────────────────────────────────────────────────
  {
    id: 'wealth',
    label: 'Wealth',
    emoji: '💰',
    charts: [
      {
        area: 'Wealth & Money',
        chart: 'Hora',
        code: 'D2',
        d: 2,
        governs: "Wealth, income, financial stability, and assets. The D2 shows whether wealth flows through Solar effort or Lunar inheritance — only two signs, so patterns are very clear.",
      },
      {
        area: 'Home & Property',
        chart: 'Chaturthamsa',
        code: 'D4',
        d: 4,
        governs: "Property, home, vehicles, and inheritance. The D4 is the chart of fixed assets — where you settle, what you accumulate, and the security of your physical foundation.",
      },
      {
        area: 'Comforts & Lifestyle',
        chart: 'Shodashamsa',
        code: 'D16',
        d: 16,
        governs: "Vehicles, luxuries, comforts, and happiness. The D16 reveals the ease or difficulty surrounding material pleasures, lifestyle quality, and conveyances in your life.",
      },
    ],
  },
  // ── Health ────────────────────────────────────────────────────────────────
  {
    id: 'health',
    label: 'Health',
    emoji: '💚',
    charts: [
      {
        area: 'Health & Wellness',
        chart: 'Shashtamsa',
        code: 'D6',
        d: 6,
        governs: "Diseases, health challenges, enemies, and recovery. The D6 reveals constitutional vulnerabilities, immunity, the nature of illnesses, and the path to recovery.",
      },
      {
        area: 'Longevity & Transformation',
        chart: 'Ashtamsa',
        code: 'D8',
        d: 8,
        governs: "Longevity, obstacles, hidden events, and deep transformation. The D8 reveals karmic debts that manifest as sudden crises — and the resilience available to meet them.",
      },
    ],
  },
  // ── Spiritual ─────────────────────────────────────────────────────────────
  {
    id: 'spiritual',
    label: 'Spiritual',
    emoji: '🙏',
    charts: [
      {
        area: 'Spiritual Journey',
        chart: 'Vimshamsa',
        code: 'D20',
        d: 20,
        governs: "Spirituality, devotion, and religious practices. The D20 shows the quality of your inner practice and which deity, mantra, or path is naturally aligned with your soul.",
      },
      {
        area: 'Fortune & Grace',
        chart: 'Khavedamsa',
        code: 'D40',
        d: 40,
        governs: "Maternal blessings, fortune, and auspicious karma. The D40 reveals fortunate combinations inherited through the maternal lineage and the quality of divine grace available in this life.",
      },
      {
        area: 'Character & Values',
        chart: 'Akshavedamsa',
        code: 'D45',
        d: 45,
        governs: "Character, ethics, paternal blessings, and virtues. The D45 integrates multiple dimensions of the chart for a holistic view of your essential nature and dharmic path.",
      },
      {
        area: 'Past Karma',
        chart: 'Shashtiamsa',
        code: 'D60',
        d: 60,
        governs: "Past-life karma and the deepest karmic influences shaping this life. The D60 is the subtlest and most powerful chart — used to trace unexplained patterns and fated events across lifetimes.",
      },
    ],
  },
]

// Flat lookup for defaultDivision prop — first match wins
const ALL_CHARTS = GROUPS.flatMap(g => g.charts.map(c => ({ ...c, groupLabel: g.label })))

export default function DivisionalCharts({ input, defaultDivision }) {
  const [selected, setSelected]   = useState(null)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  useEffect(() => {
    if (!defaultDivision) return
    const match = ALL_CHARTS.find(c => c.d === defaultDivision)
    if (match) openChart(match)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function openChart(chart) {
    setSelected(chart)
    setChartData(null)
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/kundli/divisional?division=${chart.d}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: input.date, time: input.time, place: input.place }),
      })
      if (!res.ok) throw new Error('Failed')
      setChartData(await res.json())
    } catch {
      setError('Could not load chart. Please try again.')
    }
    setLoading(false)
  }

  function back() {
    setSelected(null)
    setChartData(null)
    setError(null)
  }

  // ── Gallery ───────────────────────────────────────────────────────────────
  if (!selected) {
    return (
      <div>
        {/* Header */}
        <div className="mb-6 pb-4" style={{ borderBottom: '2px solid #EAE1CC' }}>
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

        {/* Groups */}
        <div className="space-y-7">
          {GROUPS.map(group => (
            <div key={group.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{group.emoji}</span>
                <h3 className="font-serif font-bold text-base text-ink">{group.label}</h3>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #EAE1CC' }}>
                {group.charts.map((chart, idx) => (
                  <button
                    key={`${group.id}-${chart.d}`}
                    onClick={() => openChart({ ...chart, groupLabel: group.label })}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-primary-light/40"
                    style={{ borderBottom: idx < group.charts.length - 1 ? '1px solid #EAE1CC' : 'none' }}
                  >
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-ink">{chart.area}</span>
                      <span className="text-xs ml-2 text-ink-muted">
                        {chart.chart} · {chart.code}
                      </span>
                    </div>
                    <span className="shrink-0 ml-3 text-xs font-semibold" style={{ color: '#D9A441' }}>
                      View →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Chart detail ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <button
        onClick={back}
        className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink transition-colors"
      >
        ← Life Areas
      </button>

      <div className="pb-4" style={{ borderBottom: '1px solid #EAE1CC' }}>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#D9A441' }}>
          {selected.groupLabel}
        </p>
        <h2 className="font-serif font-bold text-xl text-ink leading-tight">{selected.area}</h2>
        <p className="text-xs font-semibold mt-0.5 text-ink-muted">
          {selected.chart} · {selected.code}
        </p>
      </div>

      <div className="rounded-xl px-4 py-3.5 bg-parchment-card" style={{ border: '1px solid #EAE1CC' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#D9A441' }}>
          This chart governs
        </p>
        <p className="text-sm leading-relaxed text-ink">{selected.governs}</p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-14">
          <div className="text-3xl animate-spin mb-3">🪐</div>
          <p className="text-sm font-medium text-ink-muted">Calculating {selected.code}…</p>
          <div className="mt-3 w-40 h-1 rounded-full overflow-hidden bg-line">
            <div className="h-full rounded-full animate-pulse bg-primary w-3/4" />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-4 text-sm bg-vermillion-light border border-vermillion/30 text-vermillion">
          ⚠️ {error}
          <button onClick={() => openChart(selected)} className="ml-3 underline text-xs">Retry</button>
        </div>
      )}

      {!loading && chartData && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-full sm:w-[480px]">
              <KundliChart
                planets={chartData.planets}
                ascendant={chartData.ascendant}
                title={`${selected.code} — ${selected.chart}`}
              />
            </div>
          </div>
          <ChartHighlight input={input} chartType={selected.code} />
        </div>
      )}
    </div>
  )
}
