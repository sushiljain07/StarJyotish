// frontend/src/components/DashaTable.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

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
  mahadasha:  { active: 'bg-indigo-600',  light: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-800',  bar: 'bg-indigo-500'  },
  antardasha: { active: 'bg-violet-600',  light: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-800',  bar: 'bg-violet-500'  },
  pratyantar: { active: 'bg-rose-600',    light: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-800',    bar: 'bg-rose-500'    },
  sookshma:   { active: 'bg-amber-600',   light: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-800',   bar: 'bg-amber-500'   },
}

const TABS = [
  { id: 'mahadasha',  label: 'Mahadasha' },
  { id: 'antardasha', label: 'Antardasha' },
  { id: 'pratyantar', label: 'Pratyantar' },
  { id: 'sookshma',   label: 'Sookshma' },
]

function PeriodTable({ rows, currentPlanet, currentStart, color, labelFn }) {
  if (!rows || rows.length === 0)
    return <p className="text-sm text-slate-400 italic">No data available.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className={`${color.light} ${color.text}`}>
            <th className="text-left p-2 border border-slate-200">Period</th>
            <th className="text-left p-2 border border-slate-200">Start</th>
            <th className="text-left p-2 border border-slate-200">End</th>
            <th className="text-left p-2 border border-slate-200">Duration</th>
            <th className="p-2 border border-slate-200 w-24">Progress</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isCurrent = r.planet === currentPlanet && r.start === currentStart
            const isPast    = new Date(r.end) < new Date()
            return (
              <tr key={i}
                  className={isCurrent ? `${color.light} font-semibold`
                    : isPast ? 'bg-white text-slate-400' : 'bg-white text-slate-600'}>
                <td className="p-2 border border-slate-100">
                  {isCurrent && <span className="mr-1">▶</span>}
                  {labelFn(r)}
                </td>
                <td className="p-2 border border-slate-100">{r.start}</td>
                <td className="p-2 border border-slate-100">{r.end}</td>
                <td className="p-2 border border-slate-100">{durationLabel(r.start, r.end)}</td>
                <td className="p-2 border border-slate-100">
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className={`h-2 rounded-full ${isCurrent ? color.bar : isPast ? 'bg-slate-300' : 'bg-slate-200'}`}
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
    current_sookshma:   sk,
    antardashas,
    pratyantars,
    sookshmas,
    full_sequence,
  } = dasha

  const yrsLeft = ((new Date(md.end) - Date.now()) / (365.25 * 86400000)).toFixed(1)
  const c = LEVEL_COLORS[activeTab]

  return (
    <div className="space-y-4">

      {/* Current chain banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex flex-wrap gap-2 items-center text-sm">
        <span className="font-bold text-indigo-900">{md.planet} MD</span>
        {ad && <><span className="text-slate-400">›</span><span className="font-semibold text-violet-700">{ad.planet} AD</span></>}
        {pd && <><span className="text-slate-400">›</span><span className="font-semibold text-rose-700">{pd.planet} PD</span></>}
        {sk && <><span className="text-slate-400">›</span><span className="font-semibold text-amber-700">{sk.planet} SK</span></>}
        <span className="ml-auto text-xs text-slate-500">{yrsLeft}y left in MD</span>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium ${
                    activeTab === tab.id
                      ? `${LEVEL_COLORS[tab.id].active} text-white border-transparent shadow-sm`
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
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
              <span className="text-2xl font-bold text-indigo-900">{md.planet}</span>
              <span className="text-sm text-slate-500">{md.start} – {md.end} · {md.years}y</span>
            </div>
            <div className="mt-2 h-2 bg-indigo-100 rounded-full">
              <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${pct(md.start, md.end)}%` }} />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Full Dasha Sequence</h3>
            <div className="flex flex-wrap gap-2">
              {full_sequence.map((m, i) => {
                const isCurr = m.planet === md.planet && m.start === md.start
                return (
                  <span key={i}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isCurr ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'
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
              ({ad.start} to {ad.end})
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

      {/* ── Sookshma tab ── */}
      {activeTab === 'sookshma' && (
        <div className="space-y-3">
          {pd && (
            <div className={`${c.light} border ${c.border} rounded-lg px-3 py-2 text-xs ${c.text}`}>
              Sookshma periods within <strong>{md.planet}–{ad?.planet}–{pd.planet}</strong> Pratyantar
              ({pd.start} to {pd.end})
            </div>
          )}
          <PeriodTable
            rows={sookshmas}
            currentPlanet={sk?.planet}
            currentStart={sk?.start}
            color={c}
            labelFn={r => `${md.planet}–${ad?.planet}–${pd?.planet}–${r.planet}`}
          />
        </div>
      )}

    </div>
  )
}
