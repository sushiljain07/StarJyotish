// frontend/src/components/home/LifeAreaGrid.jsx
//
// Premium life-area cards that surface the strongest current themes while
// keeping report navigation intact.
import { useTranslation } from 'react-i18next'

const AREA_EMOJI = { career: 'Career', wealth: 'Wealth', relationship: 'Bond', health: 'Wellbeing' }

const BAR_COLOR = {
  up: 'linear-gradient(90deg, #5B7A5E, #9FC7A2)',
  down: 'linear-gradient(90deg, #A23B3B, #E09090)',
  flat: 'linear-gradient(90deg, #BD8A2E, #F0CB80)',
}

const TREND_STYLE = {
  up: { color: '#5B7A5E', label: 'Up' },
  down: { color: '#A23B3B', label: 'Down' },
  flat: { color: '#BD8A2E', label: 'Steady' },
}

export default function LifeAreaGrid({ areas, onOpenReport }) {
  const { t } = useTranslation()
  if (!areas?.length) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {areas.map(area => {
        const trend = TREND_STYLE[area.trend] || TREND_STYLE.flat
        const emoji = AREA_EMOJI[area.id] || 'Insight'
        return (
          <button
            key={area.id}
            type="button"
            onClick={() => onOpenReport(area.topicId)}
            className="group flex h-full flex-col rounded-[26px] border border-primary/12 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,243,234,0.92)_100%)] p-4 text-left shadow-[0_16px_36px_rgba(53,37,16,0.07)] transition hover:-translate-y-0.5 hover:border-primary/35"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-2xl bg-primary-light/45 px-3 py-1 text-[11px] font-semibold text-primary-dark">
                {emoji}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: trend.color }}>
                {t(`life_trend_${area.trend}`, trend.label)}
              </span>
            </div>

            <p className="mt-4 font-serif text-[1.05rem] font-semibold leading-snug text-ink">
              {t(`life_area_${area.id}`, area.label)}
            </p>

            <div className="mt-4 h-1.5 rounded-full bg-line">
              <div className="h-full rounded-full" style={{ width: `${area.pct}%`, background: BAR_COLOR[area.trend] }} />
            </div>

            {area.nugget && (
              <p className="mt-4 line-clamp-3 text-[12.5px] leading-relaxed text-ink-muted">
                {area.nugget}
              </p>
            )}

            <span className="mt-auto pt-5 text-xs font-semibold text-primary-dark group-hover:underline">
              {t('report_open')} →
            </span>
          </button>
        )
      })}
    </div>
  )
}
