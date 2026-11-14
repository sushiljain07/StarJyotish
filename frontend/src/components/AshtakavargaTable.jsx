// Ashtakavarga table: Bhinnashtakavarga + Sarvashtakavarga
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { planetName, planetShort } from '../utils/astroNames'
import { API_BASE } from '../api/config'
import { PLANET_COLORS } from '../config/planetColors'
import ScrollHint from './ui/ScrollHint'

const SIGN_KEYS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
const PLANETS = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']

function PointCell({ value, max = 8 }) {
  const pct = value / max
  const bg = pct >= 0.75 ? '#d1fae5' : pct >= 0.5 ? '#fef9c3' : pct >= 0.375 ? '#fee2e2' : '#fecaca'
  return (
    <td style={{ backgroundColor: bg }}
        className="p-1.5 text-center border border-line font-bold text-sm tabular-nums">
      {value}
    </td>
  )
}

function SarvaCell({ value }) {
  const pct = value / 56
  const bg = pct >= 0.65 ? '#d1fae5' : pct >= 0.45 ? '#fef9c3' : '#fee2e2'
  return (
    <td style={{ backgroundColor: bg }}
        className="p-1.5 text-center border border-line font-bold text-sm tabular-nums">
      {value}
    </td>
  )
}

export default function AshtakavargaTable({ input }) {
  const { t } = useTranslation()
  const SIGN_ABBR = SIGN_KEYS.map(k => t(`sign_abbr.${k}`))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('sarva')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/kundli/ashtakavarga`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: input.date, time: input.time, place: input.place }),
      })
      if (!res.ok) throw new Error('Failed')
      setData(await res.json())
    } catch {
      setError('ashtakavarga_error')
    }
    setLoading(false)
  }

  // Pure Swiss Ephemeris calculation, not an LLM call — auto-load like
  // every other non-LLM tab, instead of gating behind a click.
  useEffect(() => { load() }, [])

  return (
    <div className="space-y-4">
      <div className="bg-primary-light border border-primary/30 rounded-xl p-4">
        <h2 className="text-primary-ink font-bold text-base">{t('ashtakavarga_title')}</h2>
        <p className="text-primary-ink text-xs mt-1">
          {t('ashtakavarga_intro')}
        </p>
        <button onClick={load} disabled={loading}
                className="mt-3 text-xs bg-primary text-night px-3 py-1.5 rounded-lg hover:bg-primary-dark disabled:opacity-50">
          {loading ? t('ashtakavarga_calculating') : t('transit_refresh')}
        </button>
      </div>

      {error && (
        <div className="bg-vermillion-light border border-vermillion/30 rounded-lg p-4 text-vermillion text-sm">⚠️ {t(error)}</div>
      )}
      {loading && (
        <div role="status" className="flex justify-center py-12">
          <span className="sr-only">{t('state_loading_label')}</span>
          <div aria-hidden="true" className="text-3xl motion-safe:animate-spin">🪐</div>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Sub-tabs */}
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setActiveTab('sarva')}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                      activeTab === 'sarva'
                        ? 'bg-primary border-primary text-night'
                        : 'bg-parchment-card border-line text-ink-muted hover:border-primary/50'
                    }`}>
              {t('ashtakavarga_tab_sarva')}
            </button>
            {PLANETS.map(p => (
              <button key={p} onClick={() => setActiveTab(p)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                        activeTab === p
                          ? 'text-white border-transparent'
                          : 'bg-parchment-card border-line text-ink-muted hover:border-ink-faint'
                      }`}
                      style={activeTab === p ? { backgroundColor: PLANET_COLORS[p] ?? '#666' } : {}}>
                {planetShort(t, p)}
              </button>
            ))}
          </div>

          {/* Sarvashtakavarga */}
          {activeTab === 'sarva' && (
            <div className="bg-parchment-card rounded-xl border border-line overflow-hidden">
              <div className="px-4 py-3 bg-primary-light border-b">
                <h3 className="font-semibold text-primary-ink text-sm">
                  {t('ashtakavarga_sarva_title')}
                </h3>
              </div>
              <div className="p-3">
                <ScrollHint fadeFrom="from-parchment-card">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-night/[0.03]">
                      {SIGN_ABBR.map(s => (
                        <th key={s} className="p-1.5 text-center border border-line text-ink-muted text-xs">{s}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {data.sarvashtakavarga.map((cell, i) => (
                        <SarvaCell key={i} value={cell.points} />
                      ))}
                    </tr>
                  </tbody>
                </table>
                </ScrollHint>
                <div className="flex gap-4 mt-3 text-xs text-ink-muted">
                  <span><span className="inline-block w-3 h-3 rounded bg-green-100 mr-1 align-middle"></span>{t('ashtakavarga_sarva_strong')}</span>
                  <span><span className="inline-block w-3 h-3 rounded bg-yellow-100 mr-1 align-middle"></span>{t('ashtakavarga_sarva_average')}</span>
                  <span><span className="inline-block w-3 h-3 rounded bg-red-100 mr-1 align-middle"></span>{t('ashtakavarga_sarva_weak')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Bhinnashtakavarga for selected planet */}
          {PLANETS.includes(activeTab) && data.bhinnashtakavarga[activeTab] && (
            <div className="bg-parchment-card rounded-xl border border-line overflow-hidden">
              <div className="px-4 py-3 border-b"
                   style={{ backgroundColor: PLANET_COLORS[activeTab] + '18' }}>
                <h3 className="font-semibold text-sm"
                    style={{ color: PLANET_COLORS[activeTab] }}>
                  {t('ashtakavarga_bhinna_title', { planet: planetName(t, activeTab) })}
                </h3>
              </div>
              <div className="p-3">
                <ScrollHint fadeFrom="from-parchment-card">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-night/[0.03]">
                      {SIGN_ABBR.map(s => (
                        <th key={s} className="p-1.5 text-center border border-line text-ink-muted text-xs">{s}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {data.bhinnashtakavarga[activeTab].map((cell, i) => (
                        <PointCell key={i} value={cell.points} />
                      ))}
                    </tr>
                  </tbody>
                </table>
                </ScrollHint>
                <div className="flex gap-4 mt-3 text-xs text-ink-muted">
                  <span><span className="inline-block w-3 h-3 rounded bg-green-100 mr-1 align-middle"></span>{t('ashtakavarga_bhinna_strong')}</span>
                  <span><span className="inline-block w-3 h-3 rounded bg-yellow-100 mr-1 align-middle"></span>{t('ashtakavarga_bhinna_average')}</span>
                  <span><span className="inline-block w-3 h-3 rounded bg-red-200 mr-1 align-middle"></span>{t('ashtakavarga_bhinna_weak')}</span>
                  <span><span className="inline-block w-3 h-3 rounded bg-red-300 mr-1 align-middle"></span>{t('ashtakavarga_bhinna_very_weak')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Combined view - all 7 planets + total */}
          {activeTab === 'sarva' && (
            <div className="bg-parchment-card rounded-xl border border-line overflow-hidden">
              <div className="px-4 py-3 bg-night/[0.03] border-b">
                <h3 className="font-semibold text-ink text-sm">{t('ashtakavarga_overview')}</h3>
              </div>
              <ScrollHint fadeFrom="from-parchment-card">
                <table className="w-full text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-night/[0.03]">
                      <th className="p-2 text-left border border-line sticky left-0 z-10 bg-[#F8F6F2]">{t('col_planet')}</th>
                      {SIGN_ABBR.map(s => (
                        <th key={s} className="p-1 text-center border border-line">{s}</th>
                      ))}
                      <th className="p-2 text-center border border-line">{t('ashtakavarga_total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLANETS.map((planet, pi) => {
                      const row = data.bhinnashtakavarga[planet]
                      if (!row) return null
                      const total = row.reduce((s, c) => s + c.points, 0)
                      return (
                        <tr key={planet} className={pi % 2 === 0 ? 'bg-parchment-card' : 'bg-night/[0.03]'}>
                          <td className={`p-2 border border-line font-bold sticky left-0 z-10 ${pi % 2 === 0 ? 'bg-parchment-card' : 'bg-[#F8F6F2]'}`}
                              style={{ color: PLANET_COLORS[planet] ?? '#333' }}>
                            {planetShort(t, planet)}
                          </td>
                          {row.map((cell, i) => (
                            <PointCell key={i} value={cell.points} />
                          ))}
                          <td className="p-2 text-center border border-line font-bold text-ink">
                            {total}
                          </td>
                        </tr>
                      )
                    })}
                    {/* Sarva total row */}
                    <tr className="bg-primary-light font-bold">
                      <td className="p-2 border border-primary/40 text-primary-ink">{t('ashtakavarga_total')}</td>
                      {data.sarvashtakavarga.map((cell, i) => (
                        <SarvaCell key={i} value={cell.points} />
                      ))}
                      <td className="p-2 text-center border border-primary/40 text-primary-ink">
                        {data.sarvashtakavarga.reduce((s, c) => s + c.points, 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </ScrollHint>
            </div>
          )}
        </>
      )}
    </div>
  )
}
