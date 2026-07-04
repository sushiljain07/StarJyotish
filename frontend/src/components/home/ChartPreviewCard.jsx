// frontend/src/components/home/ChartPreviewCard.jsx
//
// "Your Birth Chart" — reuses the real <KundliChart> renderer (see
// components/KundliChart.jsx) rather than a mocked-up illustration, per
// this sprint's brief. The chart data feeding it is placeholder (see
// config/homeData.js), so the small caption under the chart says so —
// same honesty pattern as Profile.jsx's membership card, which doesn't
// pretend a paid tier exists before billing is built. Once account charts
// are connected, that caption is the one line that goes away.
import KundliChart from '../KundliChart'
import HomeIcon from './HomeIcons'

export default function ChartPreviewCard({ t, chart, onViewChart, onAskAI, onGenerateNew }) {
  return (
    <section className="bg-parchment-card rounded-2xl shadow-sm border border-line p-5 sm:p-7">
      <div className="flex items-center gap-2 mb-4">
        <HomeIcon id="chart" className="w-4 h-4 text-primary-dark" />
        <h2 className="font-serif font-semibold text-lg text-ink">{t('home_chart_title')}</h2>
      </div>

      <div className="max-w-xs mx-auto">
        <KundliChart planets={chart.planets} ascendant={chart.ascendant} title={t('home_chart_lagna_label')} />
      </div>
      <p className="text-center text-[11px] text-ink-faint mt-3">{t('home_chart_preview_note')}</p>

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
