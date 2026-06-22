// frontend/src/components/DashaTable.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../utils/format'

function pct(start, end) {
  const now = Date.now()
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (now <= s) return 0
  if (now >= e) return 100
  return Math.round(((now - s) / (e - s)) * 100)
}

function daysBetween(start, end) {
  return Math.round((new Date(end) - new Date(start)) / 86400000)
}

function durationLabel(start, end) {
  const d = daysBetween(start, end)
  if (d < 30)  return `${d}d`
  if (d < 365) return `${Math.round(d / 30.4)}m`
  return `${(d / 365.25).toFixed(1)}y`
}

const LEVEL_COLORS = {
  mahadasha:  { active: 'bg-primary',    activeText: 'text-night', light: 'bg-primary-light',    border: 'border-primary/30',    text: 'text-primary-dark', bar: 'bg-primary'    },
  antardasha: { active: 'bg-mauve',      activeText: 'text-white',  light: 'bg-mauve-light',      border: 'border-mauve/30',      text: 'text-mauve',        bar: 'bg-mauve'      },
  pratyantar: { active: 'bg-vermillion', activeText: 'text-white',  light: 'bg-vermillion-light', border: 'border-vermillion/30', text: 'text-vermillion',   bar: 'bg-vermillion' },
}

const TABS = [
  { id: 'mahadasha',  label: 'Mahadasha' },
  { id: 'antardasha', label: 'Antardasha' },
  { id: 'pratyantar', label: 'Pratyantar' },
]

function PeriodTable({ rows, currentPlanet, currentStart, color, labelFn }) {
  if (!rows || rows.length === 0)
    return <p className="text-sm text-ink-faint italic">No data available.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className={`${color.light} ${color.text}`}>
            <th className="text-left p-2 border border-line">Period</th>
            <th className="text-left p-2 border border-line">Start</th>
            <th className="text-left p-2 border border-line">End</th>
            <th className="text-left p-2 border border-line">Duration</th>
            <th className="p-2 border border-line w-24">Progress</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isCurrent = r.planet === currentPlanet && r.start === currentStart
            const isPast    = new Date(r.end) < new Date()
            return (
              <tr key={i}
                  className={isCurrent ? `${color.light} font-semibold`
                    : isPast ? 'bg-parchment-card text-ink-faint' : 'bg-parchment-card text-ink-muted'}>
                <td className="p-2 border border-line">
                  {isCurrent && <span className="mr-1">▶</span>}
                  {labelFn(r)}
                </td>
                <td className="p-2 border border-line">{formatDate(r.start)}</td>
                <td className="p-2 border border-line">{formatDate(r.end)}</td>
                <td className="p-2 border border-line">{durationLabel(r.start, r.end)}</td>
                <td className="p-2 border border-line">
                  <div className="h-2 bg-night/10 rounded-full">
                    <div className={`h-2 rounded-full ${isCurrent ? color.bar : isPast ? 'bg-ink-faint/50' : 'bg-ink-faint/25'}`}
                         style={{ width: `${pct(r.start, r.end)}%` }} />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function DashaTable({ dasha }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('mahadasha')

  if (!dasha) return null

  const {
    current_mahadasha: md,
    current_antardasha: ad,
    current_pratyantar: pd,
    antardashas,
    pratyantars,
    full_sequence,
  } = dasha

  const yrsLeft = ((new Date(md.end) - Date.now()) / (365.25 * 86400000)).toFixed(1)
  const c = LEVEL_COLORS[activeTab]

  return (
    <div className="space-y-4">

      {/* Current chain banner */}
      <div className="bg-primary-light border border-primary/30 rounded-lg p-3 flex flex-wrap gap-2 items-center text-sm">
        <span className="font-bold text-primary-dark">{md.planet} MD</span>
        {ad && <><span className="text-ink-faint">›</span><span className="font-semibold text-mauve">{ad.planet} AD</span></>}
        {pd && <><span className="text-ink-faint">›</span><span className="font-semibold text-vermillion">{pd.planet} PD</span></>}
        <span className="ml-auto text-xs text-ink-muted">{yrsLeft}y left in MD</span>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium ${
                    activeTab === tab.id
                      ? `${LEVEL_COLORS[tab.id].active} ${LEVEL_COLORS[tab.id].activeText} border-transparent shadow-sm`
                      : 'bg-parchment-card border-line text-ink-muted hover:border-primary/40'
                  }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Mahadasha tab ── */}
      {activeTab === 'mahadasha' && (
        <div className="space-y-4">
          <div className={`${c.light} border ${c.border} rounded-lg p-4`}>
            <div className={`text-xs ${c.text} uppercase tracking-wide mb-1`}>Current Mahadasha</div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-2xl font-bold text-primary-dark">{md.planet}</span>
              <span className="text-sm text-ink-muted">{formatDate(md.start)} – {formatDate(md.end)} · {md.years}y</span>
            </div>
            <div className="mt-2 h-2 bg-primary-light rounded-full">
              <div className="h-2 bg-primary rounded-full" style={{ width: `${pct(md.start, md.end)}%` }} />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Full Dasha Sequence</h3>
            <div className="flex flex-wrap gap-2">
              {full_sequence.map((m, i) => {
                const isCurr = m.planet === md.planet && m.start === md.start
                return (
                  <span key={i}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isCurr ? 'bg-primary text-night' : 'bg-primary-light text-primary-dark'
                        }`}>
                    {m.planet} · {m.years}y
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Antardasha tab ── */}
      {activeTab === 'antardasha' && (
        <PeriodTable
          rows={antardashas}
          currentPlanet={ad?.planet}
          currentStart={ad?.start}
          color={c}
          labelFn={r => `${md.planet}–${r.planet}`}
        />
      )}

      {/* ── Pratyantar tab ── */}
      {activeTab === 'pratyantar' && (
        <div className="space-y-3">
          {ad && (
            <div className={`${c.light} border ${c.border} rounded-lg px-3 py-2 text-xs ${c.text}`}>
              Pratyantar periods within <strong>{md.planet}–{ad.planet}</strong> Antardasha
              ({formatDate(ad.start)} to {formatDate(ad.end)})
            </div>
          )}
          <PeriodTable
            rows={pratyantars}
            currentPlanet={pd?.planet}
            currentStart={pd?.start}
            color={c}
            labelFn={r => `${md.planet}–${ad?.planet}–${r.planet}`}
          />
        </div>
      )}

    </div>
  )
}
