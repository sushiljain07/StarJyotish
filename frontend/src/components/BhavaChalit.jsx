// frontend/src/components/BhavaChalit.jsx  v2
// Story-first: intro → shifted-planets summary → full table (collapsed).
// Parchment color scheme to match the Analysis tab context.

import { useState, useEffect } from 'react'
import { API_BASE } from '../api/config'
import { PLANET_COLORS } from '../config/planetColors'

function shiftNote(planetName, from, to) {
  if (from === to) return null
  const key = `${planetName}:${from}:${to}`
  const notes = {
    'Saturn:10:9':  'Saturn moves from career to dharma — wisdom, teaching, and philosophy gain prominence.',
    'Neptune:12:11':'Neptune shifts from isolation to community — friendships and idealistic pursuits become more significant.',
    'Jupiter:1:12': 'Jupiter retreats from self to the house of surrender — inner growth and spiritual seeking deepen.',
    'Mars:7:6':     'Mars steps back from partnerships into daily work — energy pours into service, health, and routine.',
    'Venus:5:4':    'Venus moves from creativity to the home — domestic life and comfort become sources of deep pleasure.',
    'Moon:4:3':     'Moon shifts from home to communication — emotional expression and writing become charged.',
    'Sun:10:9':     'Sun moves from career to dharma — purpose shifts from public achievement toward wisdom.',
    'Mercury:3:2':  'Mercury moves from communication to wealth — the mind turns toward material planning.',
  }
  if (notes[key]) return notes[key]
  if (to > from) return `Shifts forward from house ${from} to ${to} — energy operates in a more ${to >= 10 ? 'public' : to >= 7 ? 'relational' : 'grounded'} domain.`
  return `Shifts back from house ${from} to ${to} — themes become more ${to <= 3 ? 'personal and internal' : 'foundational'}.`
}

export default function BhavaChalit({ input }) {
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [showFull, setShowFull] = useState(false)

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
    } catch {
      setError('Could not load Bhava Chalit data.')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const shifted = data?.planets?.filter(p => p.changed) ?? []

  return (
    <div className="space-y-5">

      {/* Intro */}
      <div className="pb-4" style={{ borderBottom: '2px solid #EAE1CC' }}>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#D9A441' }}>
          Bhava Chalit
        </p>
        <h2 className="font-serif font-bold text-xl text-ink mb-2">
          How your planets actually behave.
        </h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          Unlike the birth chart, Bhava Chalit shows where your planets truly operate.
          Equal 30° segments centred on your ascendant degree — some planets shift house.
          Those shifts matter.
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-14">
          <div className="text-3xl animate-spin mb-3">🏠</div>
          <div className="w-40 h-1.5 bg-line rounded-full overflow-hidden">
            <div className="h-full rounded-full animate-pulse bg-primary w-3/4" />
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl p-4 text-sm bg-vermillion-light border border-vermillion/30 text-vermillion">
          ⚠️ {error}
          <button onClick={load} className="ml-3 underline text-xs">Retry</button>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Ascendant */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-semibold" style={{ color: '#D9A441' }}>Ascendant</span>
            <span className="text-sm font-bold text-ink">
              {data.ascendant.sign} {data.ascendant.degree.toFixed(1)}°
            </span>
          </div>

          {/* Summary */}
          <div className="rounded-xl px-4 py-4 bg-parchment-card" style={{ border: '1px solid #EAE1CC' }}>
            <p className="text-sm font-bold text-ink mb-3">
              {shifted.length === 0
                ? 'All planets remain in their Rashi houses.'
                : `${shifted.length} planet${shifted.length > 1 ? 's' : ''} shifted ${shifted.length > 1 ? 'houses' : 'house'}.`}
            </p>

            {shifted.length === 0 && (
              <p className="text-xs text-ink-muted">
                Your Bhava Chalit and Rashi charts are perfectly aligned — planets operate
                exactly where they appear in the birth chart.
              </p>
            )}

            {shifted.map(p => (
              <div key={p.name} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold" style={{ color: PLANET_COLORS[p.name] ?? '#D9A441' }}>
                    {p.name}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-light"
                        style={{ color: '#D9A441' }}>
                    H{p.rashi_house} → H{p.bhava_house}
                  </span>
                </div>
                {shiftNote(p.name, p.rashi_house, p.bhava_house) && (
                  <p className="text-xs leading-relaxed text-ink-muted">
                    {shiftNote(p.name, p.rashi_house, p.bhava_house)}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Detailed table toggle */}
          <button
            onClick={() => setShowFull(v => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
          >
            {showFull ? '▲ Hide' : '▼ Show'} Detailed Table
          </button>

          {showFull && (
            <div className="rounded-xl border border-line overflow-hidden">
              <div className="px-4 py-2.5 bg-parchment-card border-b border-line">
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#D9A441' }}>
                  All Planets — Rashi vs Bhava House
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-night/5 text-ink-muted">
                      <th className="p-2.5 text-left border-b border-line">Planet</th>
                      <th className="p-2.5 text-left border-b border-line">Sign</th>
                      <th className="p-2.5 text-right border-b border-line">Degree</th>
                      <th className="p-2.5 text-left border-b border-line">Nakshatra</th>
                      <th className="p-2.5 text-center border-b border-line">Rashi H</th>
                      <th className="p-2.5 text-center border-b border-line">Bhava H</th>
                      <th className="p-2.5 text-center border-b border-line">Shift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.planets.map((p, i) => (
                      <tr
                        key={p.name}
                        className={p.changed ? 'bg-primary-light/40' : (i % 2 === 0 ? '' : 'bg-night/[0.03]')}
                      >
                        <td className="p-2.5 border-b border-line font-bold"
                            style={{ color: PLANET_COLORS[p.name] ?? '#2A2724' }}>
                          {p.name}
                        </td>
                        <td className="p-2.5 border-b border-line text-ink">{p.sign}</td>
                        <td className="p-2.5 border-b border-line text-right tabular-nums text-ink-muted">
                          {p.degree.toFixed(2)}°
                        </td>
                        <td className="p-2.5 border-b border-line text-ink-muted">{p.nakshatra}</td>
                        <td className="p-2.5 border-b border-line text-center font-bold" style={{ color: '#D9A441' }}>
                          {p.rashi_house}
                        </td>
                        <td className="p-2.5 border-b border-line text-center font-bold" style={{ color: '#D9A441' }}>
                          {p.bhava_house}
                        </td>
                        <td className="p-2.5 border-b border-line text-center">
                          {p.changed
                            ? <span className="font-semibold" style={{ color: '#D9A441' }}>H{p.rashi_house}→H{p.bhava_house}</span>
                            : <span className="text-sage font-medium">Same</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
