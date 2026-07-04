// frontend/src/components/home/ChartPreviewCard.jsx
// Birth chart preview card. Redesigned in SJ-009 with a stronger header
// strip and cleaner CTA layout.
import KundliChart from '../KundliChart'
import HomeIcon from './HomeIcons'

export default function ChartPreviewCard({ t, chart, chartTitle, timeAccuracy, onViewChart, onAskAI, onGenerateNew }) {
  return (
    <section className="rounded-2xl overflow-hidden shadow-lg border border-line">
      {/* Header */}
      <div className="bg-night px-5 py-4 flex items-center gap-2">
        <HomeIcon id="chart" className="w-4 h-4 text-primary" />
        <h2 className="font-serif font-semibold text-base text-primary-light">{chartTitle}</h2>
      </div>

      {/* Chart */}
      <div className="bg-parchment-card px-5 pt-5 pb-2">
        <div className="max-w-xs mx-auto">
          <KundliChart planets={chart.planets} ascendant={chart.ascendant} title={t('home_chart_lagna_label')} />
        </div>
        {timeAccuracy && timeAccuracy !== 'exact' && (
          <p className="text-center text-[11px] text-ink-faint mt-3">
            {t(timeAccuracy === 'unknown' ? 'home_chart_time_unknown_note' : 'home_chart_time_approx_note')}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="bg-parchment-card border-t border-line px-5 py-4 flex flex-wrap items-center gap-2.5">
        <button
          onClick={onViewChart}
          className="bg-primary hover:bg-primary-dark text-night text-sm font-semibold px-5 py-2 rounded-full transition"
        >
          {t('home_chart_cta_view')}
        </button>
        <button
          onClick={onAskAI}
          className="bg-night hover:bg-night-light text-primary-light text-sm font-semibold px-5 py-2 rounded-full transition"
        >
          {t('home_chart_cta_ask')}
        </button>
        <button
          onClick={onGenerateNew}
          className="text-ink-muted hover:text-primary-dark text-sm font-medium px-2 py-2 transition ml-auto"
        >
          {t('home_chart_cta_new')}
        </button>
      </div>
    </section>
  )
}
