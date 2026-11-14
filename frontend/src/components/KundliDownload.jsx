// frontend/src/components/KundliDownload.jsx
import { useTranslation } from 'react-i18next'
import KundliChart from './KundliChart'
import { formatDate as fmtDate, formatTime as fmtTime } from '../utils/format'
import { planetName, signName, nakshatraName } from '../utils/astroNames'

// Classical dignity tables (sign_index 0=Aries … 11=Pisces)
const EXALTED     = { Sun:0, Moon:1, Mars:9, Mercury:5, Jupiter:3, Venus:11, Saturn:6 }
const DEBILITATED = { Sun:6, Moon:7, Mars:3, Mercury:11, Jupiter:9, Venus:5,  Saturn:0 }
const OWN_SIGNS   = {
  Sun:[4], Moon:[3], Mars:[0,7], Mercury:[2,5],
  Jupiter:[8,11], Venus:[1,6], Saturn:[9,10],
}

function getDignity(name, signIndex) {
  if (EXALTED[name]     === signIndex)        return 'exalted'
  if (DEBILITATED[name] === signIndex)        return 'debilitated'
  if (OWN_SIGNS[name]?.includes(signIndex))   return 'own'
  return ''
}

const DIGNITY_COLOR = { exalted: '#16a34a', debilitated: '#dc2626', own: '#2563eb' }

export default function KundliDownload({ data, input }) {
  const { t } = useTranslation()
  const { planets, ascendant, navamsa_planets, navamsa_ascendant, dasha } = data
  const moon = planets.find(p => p.name === 'Moon')
  const md   = dasha.current_mahadasha
  const ad   = dasha.current_antardasha

  function handleDownload() {
    const style = document.createElement('style')
    style.id = '_kp_print_style'
    style.textContent = `
      @media print {
        @page { margin: 10mm; size: A4 portrait; }
        html, body {
          height: auto !important;
          overflow: visible !important;
        }
        body > * { visibility: hidden !important; }
        #kundli-print-area,
        #kundli-print-area * { visibility: visible !important; }
        #kundli-print-area {
          position: absolute; top: 0; left: 0;
          width: 100%; background: white;
          height: auto !important;
          overflow: visible !important;
        }
        .no-print { display: none !important; }
      }
    `
    document.head.appendChild(style)
    window.print()
    setTimeout(() => {
      document.getElementById('_kp_print_style')?.remove()
    }, 500)
  }

  return (
    <div>
      {/* Download button — hidden during print */}
      <div className="flex justify-between items-center mb-4 no-print">
        <p className="text-sm text-ink-muted">
          {t('download_preview')}
        </p>
        <button
          onClick={handleDownload}
          className="bg-primary hover:bg-primary-dark text-night text-sm font-semibold px-5 py-2 rounded-lg shadow transition flex items-center gap-2 whitespace-nowrap"
        >
          <span>⬇</span> {t('download_button')}
        </button>
      </div>

      {/* ── Printable area ── */}
      <div id="kundli-print-area" className="bg-parchment-card rounded-xl border border-line p-6 space-y-5">

        {/* Header */}
        <div className="text-center border-b border-line pb-4 print:break-inside-avoid-page">
          <div className="text-lg font-bold text-primary-ink tracking-wide">{t('download_heading')}</div>
          {input.name && (
            <div className="text-2xl font-semibold text-ink mt-1">{input.name}</div>
          )}
          <div className="text-sm text-ink-muted mt-1">
            {fmtDate(input.date)} &nbsp;·&nbsp; {fmtTime(input.time)} &nbsp;·&nbsp; {input.place}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            <span className="bg-primary-light text-primary-ink text-xs font-semibold px-3 py-1 rounded-full">
              {t('kundli_chip_lagna', { sign: signName(t, ascendant.sign) })}
            </span>
            {moon && (
              <span className="bg-mauve-light text-mauve text-xs font-semibold px-3 py-1 rounded-full">
                {t('kundli_chip_rashi', { sign: signName(t, moon.sign) })}
              </span>
            )}
            <span className="bg-sage-light text-sage text-xs font-semibold px-3 py-1 rounded-full">
              {t('download_chip_nakshatra', { name: nakshatraName(t, ascendant.nakshatra) })}
            </span>
            <span className="bg-vermillion-light text-vermillion text-xs font-semibold px-3 py-1 rounded-full">
              {t('download_chip_mahadasha', { planet: planetName(t, md.planet), date: fmtDate(md.end) })}
            </span>
          </div>
        </div>

        {/* Charts — Lagna + Navamsa */}
        <div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex-1 max-w-[320px] mx-auto sm:mx-0 print:break-inside-avoid-page">
              <p className="text-center text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">
                {t('download_lagna_chart_d1')}
              </p>
              <KundliChart
                planets={planets}
                ascendant={ascendant}
                navamsaPlanets={navamsa_planets}
                title={t('chart_lagna_title')}
              />
            </div>
            <div className="flex-1 max-w-[320px] mx-auto sm:mx-0 print:break-inside-avoid-page">
              <p className="text-center text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">
                {t('download_navamsa_chart_d9')}
              </p>
              <KundliChart
                planets={navamsa_planets}
                ascendant={navamsa_ascendant}
                title={t('tab_navamsa')}
              />
            </div>
          </div>
        </div>

        {/* Planet table */}
        <div>
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2 print:break-after-avoid-page">
            {t('download_planetary_positions')}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="print:table-header-group">
                <tr className="bg-primary-light text-primary-ink">
                  {[['planet', t('col_planet')], ['sign', t('col_sign')], ['deg', t('download_col_deg')], ['house', t('col_house')], ['nakshatra', t('col_nakshatra')], ['pada', t('col_pada')], ['dignity', t('kundli_planets_col_dignity')], ['r', t('col_retrograde')]].map(([id, h]) => (
                    <th key={id} className={`p-1.5 border border-primary/30 ${id==='r'||id==='pada'||id==='house'?'text-center':'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planets.map((p, i) => {
                  const dignity = getDignity(p.name, p.sign_index)
                  return (
                    <tr key={p.name} className={`print:break-inside-avoid-page ${i % 2 === 0 ? 'bg-parchment-card' : 'bg-night/[0.03]'}`}>
                      <td className="p-1.5 border border-line font-semibold text-ink">{planetName(t, p.name)}</td>
                      <td className="p-1.5 border border-line text-ink-muted">{signName(t, p.sign)}</td>
                      <td className="p-1.5 border border-line text-ink-muted">{p.degree.toFixed(1)}</td>
                      <td className="p-1.5 border border-line text-center text-ink-muted">{p.house}</td>
                      <td className="p-1.5 border border-line text-ink-muted">{nakshatraName(t, p.nakshatra)}</td>
                      <td className="p-1.5 border border-line text-center text-ink-muted">{p.nakshatra_pada}</td>
                      <td className="p-1.5 border border-line font-medium"
                          style={{ color: DIGNITY_COLOR[dignity] ?? '#64748b' }}>
                        {dignity && t(`kundli_dignity_${dignity}`)}
                      </td>
                      <td className="p-1.5 border border-line text-center font-bold text-vermillion">
                        {p.retrograde ? t('col_retrograde') : ''}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dasha system */}
        <div>
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2 print:break-after-avoid-page">
            {t('download_dasha_heading')}
          </h3>

          {/* Current dasha chain */}
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="bg-primary-light border border-primary/30 rounded-lg px-3 py-2 print:break-inside-avoid-page">
              <div className="text-xs text-primary-ink uppercase font-medium">{t('dasha_mahadasha')}</div>
              <div className="text-sm font-bold text-primary-ink">{planetName(t, md.planet)}</div>
              <div className="text-xs text-ink-muted">{fmtDate(md.start)} – {fmtDate(md.end)} ({t('dasha_years_short', { n: md.years })})</div>
            </div>
            {ad && (
              <div className="bg-mauve-light border border-mauve/30 rounded-lg px-3 py-2 print:break-inside-avoid-page">
                <div className="text-xs text-mauve/70 uppercase font-medium">{t('dasha_antardasha')}</div>
                <div className="text-sm font-bold text-mauve">{planetName(t, ad.planet)}</div>
                <div className="text-xs text-ink-muted">{fmtDate(ad.start)} – {fmtDate(ad.end)}</div>
              </div>
            )}
            {dasha.current_pratyantar && (
              <div className="bg-vermillion-light border border-vermillion/30 rounded-lg px-3 py-2 print:break-inside-avoid-page">
                <div className="text-xs text-vermillion/70 uppercase font-medium">{t('dasha_pratyantar')}</div>
                <div className="text-sm font-bold text-vermillion">{planetName(t, dasha.current_pratyantar.planet)}</div>
                <div className="text-xs text-ink-muted">{fmtDate(dasha.current_pratyantar.start)} – {fmtDate(dasha.current_pratyantar.end)}</div>
              </div>
            )}
            {dasha.current_sookshma && (
              <div className="bg-sage-light border border-sage/30 rounded-lg px-3 py-2 print:break-inside-avoid-page">
                <div className="text-xs text-sage/70 uppercase font-medium">{t('dasha_sookshma')}</div>
                <div className="text-sm font-bold text-sage">{planetName(t, dasha.current_sookshma.planet)}</div>
                <div className="text-xs text-ink-muted">{fmtDate(dasha.current_sookshma.start)} – {fmtDate(dasha.current_sookshma.end)}</div>
              </div>
            )}
          </div>

          {/* Full sequence pills */}
          <div className="flex flex-wrap gap-1 print:break-inside-avoid-page">
            {dasha.full_sequence.map((entry, i) => (
              <span key={i}
                    className={`text-xs px-2 py-0.5 rounded border ${
                      entry.planet === md.planet
                        ? 'bg-primary text-night border-primary font-semibold'
                        : 'bg-parchment-card text-ink-muted border-line'
                    }`}>
                {planetName(t, entry.planet)} {entry.start.slice(0,4)}–{entry.end.slice(0,4)}
              </span>
            ))}
          </div>
        </div>

        {/* Basic predictions & personality */}
        <div>
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3 print:break-after-avoid-page">
            {t('download_predictions')}
          </h3>
          <div className="space-y-3">

            <div className="bg-primary-light border-l-4 border-primary rounded-r-lg p-3 print:break-inside-avoid-page">
              <div className="text-xs font-bold text-primary-ink uppercase mb-1">
                {t('download_lagna_heading', { sign: signName(t, ascendant.sign) })}
              </div>
              <p className="text-sm text-ink leading-relaxed">
                {t(`download_lagna_${ascendant.sign}`, { defaultValue: t('download_lagna_fallback') })}
              </p>
            </div>

            {moon && (
              <div className="bg-mauve-light border-l-4 border-mauve rounded-r-lg p-3 print:break-inside-avoid-page">
                <div className="text-xs font-bold text-mauve uppercase mb-1">
                  {t('download_moon_heading', { sign: signName(t, moon.sign) })}
                </div>
                <p className="text-sm text-ink leading-relaxed">
                  {t(`download_moon_${moon.sign}`, { defaultValue: t('download_moon_fallback') })}
                </p>
              </div>
            )}

            <div className="bg-primary-light border-l-4 border-primary rounded-r-lg p-3 print:break-inside-avoid-page">
              <div className="text-xs font-bold text-primary-ink uppercase mb-1">
                {t('download_dasha_current_heading', { planet: planetName(t, md.planet) })}
              </div>
              <p className="text-sm text-ink leading-relaxed">
                {t(`download_dasha_${md.planet}`, { defaultValue: t('download_dasha_fallback') })}
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-line pt-3 text-center text-xs text-ink-muted">
          {t('download_footer')} &nbsp;·&nbsp; {fmtDate(new Date(), {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </div>

      </div>
    </div>
  )
}
