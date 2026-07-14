// frontend/src/components/BhavaChalit.jsx  v2
//
// Story-first redesign: intro → shifted planets summary → full table.
// The story comes first; the data comes second.

import { useState, useEffect } from 'react'
import { API_BASE } from '../api/config'
import { PLANET_COLORS } from '../config/planetColors'

// Brief interpretive notes for shifted planets.
// Keyed by "planet:fromHouse→toHouse" — falls back to a generic note.
function shiftNote(planetName, from, to) {
  const diff = to - from
  if (diff === 0) return null

  // House-specific notes for common shifts
  const notes = {
    'Saturn:10:9':  'Saturn moves from the career house to the house of dharma — wisdom, teaching, and philosophy gain prominence.',
    'Neptune:12:11':'Neptune shifts from isolation to community — friendships and idealistic pursuits become more significant.',
    'Jupiter:1:12': 'Jupiter retreats from the self to the house of surrender — a shift toward inner growth and spiritual seeking.',
    'Mars:7:6':     'Mars steps back from partnerships into daily work — energy pours into service, health, and routine.',
    'Venus:5:4':    'Venus moves from creativity to the home — domestic life and comfort become sources of deep pleasure.',
    'Moon:4:3':     'Moon shifts from home to communication — emotional expression, writing, and short travel become charged.',
    'Sun:10:9':     'Sun moves from career to dharma — purpose shifts from public achievement toward wisdom and teaching.',
    'Mercury:3:2':  'Mercury moves from communication to wealth — the mind turns toward material planning and financial thought.',
  }
  const key = `${planetName}:${from}:${to}`
  if (notes[key]) return notes[key]

  // Generic directional notes
  if (to > from) return `Shifts forward from house ${from} to ${to} — this planet's energy operates in a more ${to >= 10 ? 'public and visible' : to >= 7 ? 'relational' : 'grounded'} domain.`
  return `Shifts back from house ${from} to ${to} — this planet's themes become more ${to <= 3 ? 'personal and internal' : 'foundational'}.`
}

export default function BhavaChalit({ input }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
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

      {/* ── Intro ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl px-5 py-5"
           style={{ background: '#171B33', border: '1px solid rgba(212,175,55,0.25)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {['top-2 right-8','top-5 right-24'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} text-[8px]`}
                 style={{ color: 'rgba(212,175,55,0.35)' }}>✦</div>
          ))}
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1"
             style={{ color: 'rgba(212,175,55,0.6)' }}>Bhava Chalit</p>
          <h2 className="font-serif font-bold text-lg mb-2" style={{ color: '#E8DCC8' }}>
            How your planets actually behave.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(232,220,200,0.65)' }}>
            Unlike the birth chart, Bhava Chalit shows where your planets truly operate.
            It divides the sky into equal 30° segments centred on your exact ascendant degree —
            which means some planets shift to a different house than they appear in the Rashi chart.
            Those shifts matter.
          </p>
        </div>
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-14">
          <div className="text-3xl animate-spin mb-3">🏠</div>
          <div className="w-40 h-1.5 bg-night/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full animate-pulse bg-primary w-3/4" />
          </div>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && !loading && (
        <div className="rounded-xl p-4 text-sm" style={{ background: '#2A1010', border: '1px solid rgba(162,59,59,0.4)', color: '#E08080' }}>
          ⚠️ {error}
          <button onClick={load} className="ml-3 underline text-xs">Retry</button>
        </div>
      )}

      {/* ── Story layer: shifted planets ────────────────────────────────── */}
      {data && !loading && (
        <>
          {/* Ascendant context */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-semibold" style={{ color: 'rgba(212,175,55,0.7)' }}>Ascendant</span>
            <span className="text-sm font-bold" style={{ color: '#E8DCC8' }}>
              {data.ascendant.sign} {data.ascendant.degree.toFixed(1)}°
            </span>
          </div>

          {/* Summary headline */}
          <div className="rounded-xl px-4 py-4"
               style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <p className="text-sm font-bold mb-3" style={{ color: '#E8DCC8' }}>
              {shifted.length === 0
                ? 'All planets remain in their Rashi houses.'
                : `${shifted.length} planet${shifted.length > 1 ? 's' : ''} shifted ${shifted.length > 1 ? 'houses' : 'house'}.`}
            </p>

            {shifted.length === 0 && (
              <p className="text-xs" style={{ color: 'rgba(232,220,200,0.55)' }}>
                Your Bhava Chalit and Rashi charts are in perfect alignment — planets
                operate exactly where they appear in the birth chart.
              </p>
            )}

            {shifted.map(p => (
              <div key={p.name} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold" style={{ color: PLANET_COLORS[p.name] ?? '#D4AF37' }}>
                    {p.name}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}>
                    H{p.rashi_house} → H{p.bhava_house}
                  </span>
                </div>
                {shiftNote(p.name, p.rashi_house, p.bhava_house) && (
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,220,200,0.6)' }}>
                    {shiftNote(p.name, p.rashi_house, p.bhava_house)}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* ── Detailed table ─────────────────────────────────────────── */}
          <div>
            <button
              onClick={() => setShowFull(v => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold transition"
              style={{ color: 'rgba(212,175,55,0.65)' }}
            >
              {showFull ? '▲ Hide' : '▼ Show'} Detailed Table
            </button>

            {showFull && (
              <div className="mt-3 rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
                <div className="px-4 py-2.5" style={{ background: '#171B33' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.55)' }}>
                    All Planets — Rashi vs Bhava House
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: 'rgba(23,27,51,0.6)', color: 'rgba(232,220,200,0.45)' }}>
                        <th className="p-2.5 text-left border-b" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>Planet</th>
                        <th className="p-2.5 text-left border-b" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>Sign</th>
                        <th className="p-2.5 text-right border-b" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>Degree</th>
                        <th className="p-2.5 text-left border-b" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>Nakshatra</th>
                        <th className="p-2.5 text-center border-b" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>Rashi</th>
                        <th className="p-2.5 text-center border-b" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>Bhava</th>
                        <th className="p-2.5 text-center border-b" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>Shift</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.planets.map((p, i) => (
                        <tr key={p.name}
                            style={{ background: p.changed ? 'rgba(212,175,55,0.06)' : (i % 2 === 0 ? 'transparent' : 'rgba(23,27,51,0.2)') }}>
                          <td className="p-2.5 border-b font-bold" style={{ borderColor: 'rgba(212,175,55,0.08)', color: PLANET_COLORS[p.name] ?? '#E8DCC8' }}>
                            {p.name}
                          </td>
                          <td className="p-2.5 border-b" style={{ borderColor: 'rgba(212,175,55,0.08)', color: '#E8DCC8' }}>{p.sign}</td>
                          <td className="p-2.5 border-b text-right tabular-nums" style={{ borderColor: 'rgba(212,175,55,0.08)', color: 'rgba(232,220,200,0.6)' }}>
                            {p.degree.toFixed(2)}°
                          </td>
                          <td className="p-2.5 border-b" style={{ borderColor: 'rgba(212,175,55,0.08)', color: 'rgba(232,220,200,0.55)' }}>{p.nakshatra}</td>
                          <td className="p-2.5 border-b text-center font-bold" style={{ borderColor: 'rgba(212,175,55,0.08)', color: '#D4AF37' }}>
                            {p.rashi_house}
                          </td>
                          <td className="p-2.5 border-b text-center font-bold" style={{ borderColor: 'rgba(212,175,55,0.08)', color: '#D4AF37' }}>
                            {p.bhava_house}
                          </td>
                          <td className="p-2.5 border-b text-center text-xs" style={{ borderColor: 'rgba(212,175,55,0.08)' }}>
                            {p.changed
                              ? <span style={{ color: '#D4AF37', fontWeight: 600 }}>H{p.rashi_house}→H{p.bhava_house}</span>
                              : <span style={{ color: 'rgba(100,200,120,0.7)' }}>Same</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
