// frontend/src/components/DivisionalCharts.jsx  v2
//
// Redesigned from a raw button grid + blank chart area into a story-driven
// experience: thematic groups, rich selection cards, chart display with AI
// insight underneath, and dark night styling that matches the home page.
//
// Structure:
//  1. Intro context banner  — "What are divisional charts?"
//  2. Thematic group tabs   — Life, Career, Spirit, Body, Family, More
//  3. Chart selection cards — icon + name + one-line desc, highlight on active
//  4. Chart display area    — KundliChart + ChartHighlight (AI insight)

import { useState, useEffect } from 'react'
import KundliChart from './KundliChart'
import ChartHighlight from './ChartHighlight'
import { API_BASE } from '../api/config'

// ── Chart catalogue ──────────────────────────────────────────────────────────
// Each entry: division number, display name, one-line life-area description,
// icon, and the thematic group it belongs to.
const DIVISIONS = [
  { d:  1, name:'D1',  title:'Lagna',          desc:'Personality & overall life path',     icon:'🌅', group:'life'   },
  { d:  9, name:'D9',  title:'Navamsha',        desc:'Marriage, dharma & soul purpose',     icon:'💍', group:'life'   },
  { d: 10, name:'D10', title:'Dashamsha',       desc:'Career, profession & reputation',     icon:'🏆', group:'career' },
  { d:  2, name:'D2',  title:'Hora',            desc:'Wealth, income & money flow',         icon:'💰', group:'career' },
  { d: 24, name:'D24', title:'Siddhamsha',      desc:'Education, intellect & skills',       icon:'📚', group:'career' },
  { d:  6, name:'D6',  title:'Shashthamsha',    desc:'Health, immunity & service',          icon:'💚', group:'body'   },
  { d: 27, name:'D27', title:'Nakshatramsha',   desc:'Physical strength & vitality',        icon:'💪', group:'body'   },
  { d:  7, name:'D7',  title:'Saptamsha',       desc:'Children, creativity & progeny',      icon:'👶', group:'family' },
  { d: 12, name:'D12', title:'Dwadashamsha',    desc:'Parents, lineage & ancestral karma',  icon:'🌳', group:'family' },
  { d:  3, name:'D3',  title:'Drekkana',        desc:'Courage, siblings & short journeys',  icon:'⚔️',  group:'family' },
  { d:  4, name:'D4',  title:'Chaturthamsha',   desc:'Home, property & fixed assets',       icon:'🏠', group:'family' },
  { d: 20, name:'D20', title:'Vimshamsha',      desc:'Spiritual progress & devotion',       icon:'🕉️',  group:'spirit' },
  { d: 60, name:'D60', title:'Shashtiamsha',    desc:'Past-life karma & deep soul imprints',icon:'♾️',  group:'spirit' },
  { d: 16, name:'D16', title:'Shodashamsha',    desc:'Vehicles, comforts & pleasures',      icon:'🚗', group:'more'   },
  { d: 30, name:'D30', title:'Trimshamsha',     desc:'Misfortunes & karmic debts',          icon:'🔮', group:'more'   },
  { d: 40, name:'D40', title:'Khavedamsha',     desc:'Auspicious patterns from lineage',    icon:'✨', group:'more'   },
  { d: 45, name:'D45', title:'Akshavedamsha',   desc:'General well-being & character',      icon:'⚖️',  group:'more'   },
]

const GROUPS = [
  { id: 'life',   label: '🌟 Life',    sub: 'Core' },
  { id: 'career', label: '🏆 Career',  sub: 'Wealth' },
  { id: 'body',   label: '💚 Health',  sub: 'Body' },
  { id: 'family', label: '🏠 Family',  sub: 'Kin' },
  { id: 'spirit', label: '🕉️ Spirit',  sub: 'Karma' },
  { id: 'more',   label: '✦ More',    sub: 'Advanced' },
]

export default function DivisionalCharts({ input, defaultDivision }) {
  const [activeGroup, setActiveGroup] = useState('life')
  const [selectedD, setSelectedD]     = useState(defaultDivision ?? null)
  const [chartData, setChartData]     = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)

  // When topic provides a default division, switch to its group automatically
  useEffect(() => {
    if (!defaultDivision) return
    const found = DIVISIONS.find(d => d.d === defaultDivision)
    if (found) setActiveGroup(found.group)
  }, [defaultDivision])

  async function fetchDivisional(division) {
    setLoading(true)
    setError(null)
    setSelectedD(division)
    setChartData(null)
    try {
      const res = await fetch(`${API_BASE}/api/kundli/divisional?division=${division}`, {
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

  // Auto-load default division on mount
  useEffect(() => {
    if (defaultDivision) fetchDivisional(defaultDivision)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visibleDivisions = DIVISIONS.filter(d => d.group === activeGroup)
  const selected = DIVISIONS.find(d => d.d === selectedD)

  return (
    <div className="space-y-5">

      {/* ── Intro banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl px-5 py-4"
           style={{ background: '#171B33', border: '1px solid rgba(212,175,55,0.25)' }}>
        {/* Decorative stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {['top-2 right-8','top-5 right-24','top-1 right-40'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} text-[8px]`}
                 style={{ color: 'rgba(212,175,55,0.35)' }}>✦</div>
          ))}
        </div>
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1"
             style={{ color: 'rgba(212,175,55,0.6)' }}>Varga Charts</p>
          <h2 className="font-serif font-bold text-base mb-1" style={{ color: '#E8DCC8' }}>
            Your Chart in 17 Dimensions
          </h2>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,220,200,0.6)' }}>
            Vedic astrology sees beyond a single birth chart. Each Varga (divisional) chart
            zooms in on a different life domain — wealth, career, marriage, health — giving
            you pinpoint clarity no Western chart can match. Select a theme below to explore.
          </p>
        </div>
      </div>

      {/* ── Group tabs ───────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {GROUPS.map(g => (
          <button
            key={g.id}
            onClick={() => setActiveGroup(g.id)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={
              activeGroup === g.id
                ? { background: '#D9A441', color: '#171B33' }
                : { background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: 'rgba(212,175,55,0.7)' }
            }
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* ── Chart selection cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visibleDivisions.map(({ d, name, title, desc, icon }) => {
          const isActive = selectedD === d
          return (
            <button
              key={d}
              onClick={() => fetchDivisional(d)}
              className="text-left rounded-xl p-3 transition-all duration-200"
              style={
                isActive
                  ? { background: '#2A2050', border: '2px solid #D4AF37', boxShadow: '0 0 16px rgba(212,175,55,0.15)' }
                  : { background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)' }
              }
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-[11px] font-bold" style={{ color: isActive ? '#D4AF37' : 'rgba(212,175,55,0.5)' }}>
                    {name}
                  </p>
                  <p className="text-xs font-semibold leading-tight" style={{ color: isActive ? '#E8DCC8' : 'rgba(232,220,200,0.7)' }}>
                    {title}
                  </p>
                </div>
              </div>
              <p className="text-[11px] leading-snug" style={{ color: isActive ? 'rgba(232,220,200,0.75)' : 'rgba(232,220,200,0.4)' }}>
                {desc}
              </p>
              {isActive && (
                <div className="mt-2 text-[10px] font-semibold" style={{ color: '#D4AF37' }}>
                  Viewing ↓
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Chart display ────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-14">
          <div className="text-3xl animate-spin mb-3">🪐</div>
          <p className="text-sm font-medium" style={{ color: '#D4AF37' }}>
            Calculating {selected?.name} — {selected?.title}…
          </p>
          <div className="mt-3 w-40 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(212,175,55,0.1)' }}>
            <div className="h-full rounded-full animate-pulse" style={{ width: '70%', background: 'linear-gradient(90deg,#2D1B69,#D4AF37)' }} />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: '#2A1010', border: '1px solid rgba(162,59,59,0.4)', color: '#E08080' }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && chartData && selected && (
        <div className="space-y-1">
          {/* Chart title strip */}
          <div className="flex items-center gap-3 px-1 pb-2">
            <span className="text-2xl">{selected.icon}</span>
            <div>
              <h3 className="font-serif font-bold text-base" style={{ color: '#E8DCC8' }}>
                {selected.name} · {selected.title}
              </h3>
              <p className="text-xs" style={{ color: 'rgba(232,220,200,0.5)' }}>{selected.desc}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="flex justify-center">
            <div className="w-full sm:w-[480px]">
              <KundliChart
                planets={chartData.planets}
                ascendant={chartData.ascendant}
                title={`${selected.name} — ${selected.title}`}
              />
            </div>
          </div>

          {/* AI Highlight */}
          <ChartHighlight input={input} chartType={selected.name} />
        </div>
      )}

      {/* Empty state */}
      {!loading && !chartData && !error && (
        <div className="text-center py-14">
          <div className="text-4xl mb-3" style={{ filter: 'grayscale(0.3)' }}>🔭</div>
          <p className="text-sm font-medium" style={{ color: 'rgba(232,220,200,0.5)' }}>
            Select a chart above to view it
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(232,220,200,0.3)' }}>
            Each chart reveals a unique dimension of your life
          </p>
        </div>
      )}

    </div>
  )
}
