// KP (Krishnamurti Paddhati) chart display
// Shows planet → Sign → House → Star (nakshatra lord) → Sub → Sub-sub
import { useState, useEffect } from 'react'
import { API_BASE } from '../api/config'

const PLANET_COLORS = {
  Sun: '#E53E3E', Moon: '#7B61FF', Mars: '#E53E3E', Rahu: '#8B0000',
  Saturn: '#2563EB', Jupiter: '#2563EB', Mercury: '#16A34A', Venus: '#E91E8C',
  Ketu: '#8B0000', Neptune: '#7C3AED', Uranus: '#7C3AED', Pluto: '#374151',
}

const LORD_COLORS = {
  Sun: '#E53E3E', Moon: '#7B61FF', Mars: '#E53E3E', Rahu: '#8B0000',
  Saturn: '#2563EB', Jupiter: '#2563EB', Mercury: '#16A34A', Venus: '#E91E8C',
  Ketu: '#8B0000',
}

function LordChip({ lord }) {
  if (!lord) return <span className="text-ink-faint">—</span>
  return (
    <span className="inline-block px-1.5 py-0.5 rounded text-white text-xs font-bold"
          style={{ backgroundColor: LORD_COLORS[lord] ?? '#64748b' }}>
      {lord.slice(0, 3)}
    </span>
  )
}

export default function KPChart({ input }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function loadKP() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/kundli/kp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: input.date, time: input.time, place: input.place }),
      })
      if (!res.ok) throw new Error('Failed')
      setData(await res.json())
    } catch {
      setError('Could not load KP chart.')
    }
    setLoading(false)
  }

  // Pure Swiss Ephemeris calculation, not an LLM call — auto-load like
  // every other non-LLM tab, instead of gating behind a click.
  useEffect(() => { loadKP() }, [])

  return (
    <div className="space-y-4">
      <div className="bg-primary-light border border-primary/30 rounded-xl p-4">
        <h2 className="text-primary-dark font-bold text-base">KP (Krishnamurti Paddhati) Chart</h2>
        <p className="text-primary-dark text-xs mt-1">
          Shows Star lord, Sub lord, and Sub-sub lord for each planet based on Vimshottari proportions
        </p>
        <button onClick={loadKP} disabled={loading}
                className="mt-3 text-xs bg-primary text-night px-3 py-1.5 rounded-lg hover:bg-primary-dark disabled:opacity-50">
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">⚠️ {error}</div>
      )}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <img src="/starjyotish.svg" alt="" className="w-8 h-8 mx-auto animate-spin mb-2" />
            <p className="text-ink-muted text-sm">Calculating KP chart…</p>
          </div>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Ascendant KP data */}
          <div className="bg-primary-light border border-primary/30 rounded-xl p-4">
            <h3 className="text-primary-dark font-semibold text-sm mb-2">Ascendant (Lagna)</h3>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="text-ink font-medium">
                {data.ascendant.sign} {data.ascendant.degree.toFixed(2)}°
              </span>
              <span className="text-ink-muted">Nakshatra: <strong>{data.ascendant.nakshatra}</strong></span>
              <span>Star Lord: <LordChip lord={data.ascendant.star_lord} /></span>
              <span>Sub: <LordChip lord={data.ascendant.sub} /></span>
              <span>Sub-Sub: <LordChip lord={data.ascendant.sub_sub} /></span>
            </div>
          </div>

          {/* KP Planet table */}
          <div className="bg-parchment-card rounded-xl border border-line overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-primary-light text-primary-dark">
                    <th className="p-2.5 text-left border-b border-primary/30">Planet</th>
                    <th className="p-2.5 text-left border-b border-primary/30">Sign / Deg</th>
                    <th className="p-2.5 text-center border-b border-primary/30">House</th>
                    <th className="p-2.5 text-left border-b border-primary/30">Nakshatra</th>
                    <th className="p-2.5 text-center border-b border-primary/30">Star Lord</th>
                    <th className="p-2.5 text-center border-b border-primary/30">Sub Lord</th>
                    <th className="p-2.5 text-center border-b border-primary/30">Sub-Sub</th>
                    <th className="p-2.5 text-center border-b border-primary/30">Retro</th>
                  </tr>
                </thead>
                <tbody>
                  {data.planets.map((p, i) => (
                    <tr key={p.name} className={i % 2 === 0 ? 'bg-parchment-card' : 'bg-night/[0.03]'}>
                      <td className="p-2.5 border-b font-bold"
                          style={{ color: PLANET_COLORS[p.name] ?? '#333' }}>
                        {p.name}
                      </td>
                      <td className="p-2.5 border-b">
                        <span className="font-medium">{p.sign}</span>
                        <span className="text-ink-faint ml-1">{p.degree.toFixed(2)}°</span>
                      </td>
                      <td className="p-2.5 border-b text-center text-primary-dark font-bold">{p.house}</td>
                      <td className="p-2.5 border-b text-ink-muted">{p.nakshatra}</td>
                      <td className="p-2.5 border-b text-center"><LordChip lord={p.star_lord} /></td>
                      <td className="p-2.5 border-b text-center"><LordChip lord={p.sub} /></td>
                      <td className="p-2.5 border-b text-center"><LordChip lord={p.sub_sub} /></td>
                      <td className="p-2.5 border-b text-center text-vermillion">
                        {p.retrograde ? 'R' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KP Legend */}
          <div className="bg-night/[0.03] rounded-xl p-4 text-xs text-ink-muted space-y-1">
            <p className="font-semibold text-ink mb-2">KP System Guide</p>
            <p><strong>Star Lord</strong>: Nakshatra lord (primary significator of the planet's energy)</p>
            <p><strong>Sub Lord</strong>: Finer level — critical for KP predictions and timing</p>
            <p><strong>Sub-Sub</strong>: Most precise level, used for very specific event timing</p>
            <p className="mt-2 text-ink-faint">
              Sequence: Ke·Ve·Su·Mo·Ma·Ra·Ju·Sa·Me (Vimshottari proportions within each Nakshatra)
            </p>
          </div>
        </>
      )}
    </div>
  )
}
