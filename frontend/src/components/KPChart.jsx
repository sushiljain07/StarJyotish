// KP (Krishnamurti Paddhati) chart display
// Shows planet → Sign → House → Star (nakshatra lord) → Sub → Sub-sub
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { planetName, signName, nakshatraName, planetShort } from '../utils/astroNames'
import { API_BASE } from '../api/config'
import { PLANET_COLORS, LORD_COLORS } from '../config/planetColors'

function LordChip({ lord }) {
  const { t } = useTranslation()
  if (!lord) return <span className="text-ink-muted">—</span>
  return (
    <span className="inline-block px-1.5 py-0.5 rounded text-white text-xs font-bold"
          style={{ backgroundColor: LORD_COLORS[lord] ?? '#64748b' }}>
      {planetShort(t, lord)}
    </span>
  )
}

export default function KPChart({ input }) {
  const { t } = useTranslation()
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
      setError('kp_error')
    }
    setLoading(false)
  }

  // Pure Swiss Ephemeris calculation, not an LLM call — auto-load like
  // every other non-LLM tab, instead of gating behind a click.
  useEffect(() => { loadKP() }, [])

  return (
    <div className="space-y-4">
      <div className="bg-primary-light border border-primary/30 rounded-xl p-4">
        <h2 className="text-primary-ink font-bold text-base">{t('kp_title')}</h2>
        <p className="text-primary-ink text-xs mt-1">
          {t('kp_subtitle')}
        </p>
        <button onClick={loadKP} disabled={loading}
                className="mt-3 text-xs bg-primary text-night px-3 py-1.5 rounded-lg hover:bg-primary-dark disabled:opacity-50">
          {loading ? t('kp_loading') : t('transit_refresh')}
        </button>
      </div>

      {error && (
        <div className="bg-vermillion-light border border-vermillion/30 rounded-lg p-4 text-vermillion text-sm">⚠️ {t(error)}</div>
      )}
      {loading && (
        <div className="flex justify-center py-12">
          <div role="status" className="text-center">
            <img src="/starjyotish.svg" alt="" aria-hidden="true" className="w-8 h-8 mx-auto motion-safe:animate-spin mb-2" />
            <p className="text-ink-muted text-sm">{t('kp_calculating')}</p>
          </div>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Ascendant KP data */}
          <div className="bg-primary-light border border-primary/30 rounded-xl p-4">
            <h3 className="text-primary-ink font-semibold text-sm mb-2">{t('kp_ascendant')}</h3>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="text-ink font-medium">
                {signName(t, data.ascendant.sign)} {data.ascendant.degree.toFixed(2)}°
              </span>
              <span className="text-ink-muted">{t('kp_nakshatra')} <strong>{nakshatraName(t, data.ascendant.nakshatra)}</strong></span>
              <span>{t('kp_star_lord')}: <LordChip lord={data.ascendant.star_lord} /></span>
              <span>{t('kp_sub')}: <LordChip lord={data.ascendant.sub} /></span>
              <span>{t('kp_sub_sub')}: <LordChip lord={data.ascendant.sub_sub} /></span>
            </div>
          </div>

          {/* KP Planet table */}
          <div className="bg-parchment-card rounded-xl border border-line overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-primary-light text-primary-ink">
                    <th className="p-2.5 text-left border-b border-primary/30">{t('col_planet')}</th>
                    <th className="p-2.5 text-left border-b border-primary/30">{t('kp_col_sign_deg')}</th>
                    <th className="p-2.5 text-center border-b border-primary/30">{t('col_house')}</th>
                    <th className="p-2.5 text-left border-b border-primary/30">{t('col_nakshatra')}</th>
                    <th className="p-2.5 text-center border-b border-primary/30">{t('kp_star_lord')}</th>
                    <th className="p-2.5 text-center border-b border-primary/30">{t('kp_col_sub_lord')}</th>
                    <th className="p-2.5 text-center border-b border-primary/30">{t('kp_sub_sub')}</th>
                    <th className="p-2.5 text-center border-b border-primary/30">{t('kp_col_retro')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.planets.map((p, i) => (
                    <tr key={p.name} className={i % 2 === 0 ? 'bg-parchment-card' : 'bg-night/[0.03]'}>
                      <td className="p-2.5 border-b font-bold"
                          style={{ color: PLANET_COLORS[p.name] ?? '#333' }}>
                        {planetName(t, p.name)}
                      </td>
                      <td className="p-2.5 border-b">
                        <span className="font-medium">{signName(t, p.sign)}</span>
                        <span className="text-ink-muted ml-1">{p.degree.toFixed(2)}°</span>
                      </td>
                      <td className="p-2.5 border-b text-center text-primary-ink font-bold">{p.house}</td>
                      <td className="p-2.5 border-b text-ink-muted">{nakshatraName(t, p.nakshatra)}</td>
                      <td className="p-2.5 border-b text-center"><LordChip lord={p.star_lord} /></td>
                      <td className="p-2.5 border-b text-center"><LordChip lord={p.sub} /></td>
                      <td className="p-2.5 border-b text-center"><LordChip lord={p.sub_sub} /></td>
                      <td className="p-2.5 border-b text-center text-vermillion">
                        {p.retrograde ? t('col_retrograde') : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KP Legend */}
          <div className="bg-night/[0.03] rounded-xl p-4 text-xs text-ink-muted space-y-1">
            <p className="font-semibold text-ink mb-2">{t('kp_guide_title')}</p>
            <p><strong>{t('kp_star_lord')}</strong>: {t('kp_guide_star')}</p>
            <p><strong>{t('kp_col_sub_lord')}</strong>: {t('kp_guide_sub')}</p>
            <p><strong>{t('kp_sub_sub')}</strong>: {t('kp_guide_sub_sub')}</p>
            <p className="mt-2 text-ink-muted">
              {t('kp_sequence')}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
