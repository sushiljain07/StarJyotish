// frontend/src/components/home/ChartPreviewCard.jsx
//
// "Your Birth Chart" — reuses the real <KundliChart> renderer (see
// components/KundliChart.jsx) with the account's actual saved Astrology
// Profile (services/astrologyProfiles.js), generated for real via
// /api/kundli during onboarding. The only caveat this card ever shows is
// an honest one: when the birth time was approximate or unknown
// (BirthTimeSelector.jsx, step 5 of onboarding), the Ascendant and house
// placements are less certain, and this card says so rather than
// presenting them with false confidence.
import KundliChart from '../KundliChart'
import HomeIcon from './HomeIcons'

export default function ChartPreviewCard({ t, chart, chartTitle, timeAccuracy, onViewChart, onAskAI, onGenerateNew }) {
  return (
    <section className="bg-parchment-card rounded-2xl shadow-sm border border-line p-5 sm:p-7">
      <div className="flex items-center gap-2 mb-4">
        <HomeIcon id="chart" className="w-4 h-4 text-primary-dark" />
        <h2 className="font-serif font-semibold text-lg text-ink">{chartTitle}</h2>
      </div>

      <div className="max-w-xs mx-auto">
        <KundliChart planets={chart.planets} ascendant={chart.ascendant} title={t('home_chart_lagna_label')} />
      </div>
      {timeAccuracy && timeAccuracy !== 'exact' && (
        <p className="text-center text-[11px] text-ink-faint mt-3">
          {t(timeAccuracy === 'unknown' ? 'home_chart_time_unknown_note' : 'home_chart_time_approx_note')}
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-2.5 mt-5">
        <button
          onClick={onViewChart}
          className="bg-primary hover:bg-primary-dark text-night text-sm font-semibold px-4 py-2 rounded-full transition"
        >
          {t('home_chart_cta_view')}
        </button>
        <button
          onClick={onAskAI}
          className="bg-parchment hover:bg-line/60 text-ink text-sm font-semibold px-4 py-2 rounded-full border border-line transition"
        >
          {t('home_chart_cta_ask')}
        </button>
        <button
          onClick={onGenerateNew}
          className="text-ink-muted hover:text-primary-dark text-sm font-medium px-2 py-2 transition"
        >
          {t('home_chart_cta_new')}
        </button>
      </div>
    </section>
  )
}
