// frontend/src/components/BhavaChalit.jsx  v2
// Story-first: intro → shifted-planets summary → full table (collapsed).
// Parchment color scheme to match the Analysis tab context.

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { planetName, signName, nakshatraName } from '../utils/astroNames'
import { API_BASE } from '../api/config'
import { PLANET_COLORS } from '../config/planetColors'
import ScrollHint from './ui/ScrollHint'

// Hand-written notes exist for these shifts; any other shift gets a generic line.
const KNOWN_SHIFTS = new Set([
  'Saturn_10_9', 'Neptune_12_11', 'Jupiter_1_12', 'Mars_7_6',
  'Venus_5_4', 'Moon_4_3', 'Sun_10_9', 'Mercury_3_2',
])

function shiftNote(t, planet, from, to) {
  if (from === to) return null
  const key = `${planet}_${from}_${to}`
  if (KNOWN_SHIFTS.has(key)) return t(`bhava_note_${key}`)
  if (to > from) {
    const domain = to >= 10 ? 'public' : to >= 7 ? 'relational' : 'grounded'
    return t('bhava_shift_forward', { from, to, domain: t(`bhava_domain_${domain}`) })
  }
  const domain = to <= 3 ? 'personal' : 'foundational'
  return t('bhava_shift_back', { from, to, domain: t(`bhava_domain_${domain}`) })
}

export default function BhavaChalit({ input }) {
  const { t } = useTranslation()
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
      setError('bhava_error')
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
          {t('bhava_header')}
        </p>
        <h2 className="font-serif font-bold text-xl text-ink mb-2">
          {t('bhava_title')}
        </h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          {t('bhava_intro')}
        </p>
      </div>

      {loading && (
        <div role="status" aria-label={t('state_loading_label')} className="flex flex-col items-center justify-center py-14">
          <div aria-hidden="true" className="text-3xl motion-safe:animate-spin mb-3">🏠</div>
          <div className="w-40 h-1.5 bg-line rounded-full overflow-hidden">
            <div className="h-full rounded-full animate-pulse bg-primary w-3/4" />
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl p-4 text-sm bg-vermillion-light border border-vermillion/30 text-vermillion">
          ⚠️ {t(error)}
          <button onClick={load} className="ml-3 underline text-xs">{t('bhava_retry')}</button>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Ascendant */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-semibold" style={{ color: '#D9A441' }}>{t('bhava_ascendant')}</span>
            <span className="text-sm font-bold text-ink">
              {signName(t, data.ascendant.sign)} {data.ascendant.degree.toFixed(1)}°
            </span>
          </div>

          {/* Summary */}
          <div className="rounded-xl px-4 py-4 bg-parchment-card" style={{ border: '1px solid #EAE1CC' }}>
            <p className="text-sm font-bold text-ink mb-3">
              {shifted.length === 0
                ? t('bhava_all_same')
                : t(shifted.length > 1 ? 'bhava_n_shifted_many' : 'bhava_n_shifted_one', { count: shifted.length })}
            </p>

            {shifted.length === 0 && (
              <p className="text-xs text-ink-muted">
                {t('bhava_aligned')}
              </p>
            )}

            {shifted.map(p => (
              <div key={p.name} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold" style={{ color: PLANET_COLORS[p.name] ?? '#D9A441' }}>
                    {planetName(t, p.name)}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-light"
                        style={{ color: '#D9A441' }}>
                    H{p.rashi_house} → H{p.bhava_house}
                  </span>
                </div>
                {shiftNote(t, p.name, p.rashi_house, p.bhava_house) && (
                  <p className="text-xs leading-relaxed text-ink-muted">
                    {shiftNote(t, p.name, p.rashi_house, p.bhava_house)}
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
            {showFull ? t('bhava_hide_table') : t('bhava_show_table')}
          </button>

          {showFull && (
            <div className="rounded-xl border border-line overflow-hidden">
              <div className="px-4 py-2.5 bg-parchment-card border-b border-line">
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#D9A441' }}>
                  {t('bhava_table_title')}
                </p>
              </div>
              <ScrollHint fadeFrom="from-parchment">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-night/5 text-ink-muted">
                      <th className="p-2.5 text-left border-b border-line">{t('col_planet')}</th>
                      <th className="p-2.5 text-left border-b border-line">{t('col_sign')}</th>
                      {/* Degree hidden on mobile — too narrow for 7 cols */}
                      <th className="p-2.5 text-right border-b border-line hidden sm:table-cell">{t('col_degree')}</th>
                      <th className="p-2.5 text-left border-b border-line hidden sm:table-cell">{t('col_nakshatra')}</th>
                      <th className="p-2.5 text-center border-b border-line">{t('bhava_col_rashi_h')}</th>
                      <th className="p-2.5 text-center border-b border-line">{t('bhava_col_bhava_h')}</th>
                      <th className="p-2.5 text-center border-b border-line whitespace-nowrap">{t('bhava_col_shift')}</th>
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
                          {planetName(t, p.name)}
                        </td>
                        <td className="p-2.5 border-b border-line text-ink">{signName(t, p.sign)}</td>
                        <td className="p-2.5 border-b border-line text-right tabular-nums text-ink-muted hidden sm:table-cell">
                          {p.degree.toFixed(2)}°
                        </td>
                        <td className="p-2.5 border-b border-line text-ink-muted hidden sm:table-cell">{nakshatraName(t, p.nakshatra)}</td>
                        <td className="p-2.5 border-b border-line text-center font-bold" style={{ color: '#D9A441' }}>
                          {p.rashi_house}
                        </td>
                        <td className="p-2.5 border-b border-line text-center font-bold" style={{ color: '#D9A441' }}>
                          {p.bhava_house}
                        </td>
                        <td className="p-2.5 border-b border-line text-center whitespace-nowrap">
                          {p.changed
                            ? <span className="font-semibold" style={{ color: '#D9A441' }}>H{p.rashi_house}→H{p.bhava_house}</span>
                            : <span className="text-sage font-medium">{t('bhava_same')}</span>}
                        </td>
                      </tr>
                    ))}
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
