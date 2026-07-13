// LifeAreaGrid — Fix 4: richer cards with house lord insight + action CTA.
// Shows: area name, trend, score bar, the key planet driving it today,
// and a one-line "why" that teaches astrology naturally inline.
import { useTranslation } from 'react-i18next'

const AREA_EMOJI = { career: '💼', wealth: '💰', relationship: '💞', health: '🌿' }

const BAR_COLOR = {
  up:   'linear-gradient(90deg, #5B7A5E, #9FC7A2)',
  down: 'linear-gradient(90deg, #A23B3B, #E09090)',
  flat: 'linear-gradient(90deg, #BD8A2E, #F0CB80)',
}
const TREND_STYLE = {
  up:   { color: '#5B7A5E', label: '▲ Up' },
  down: { color: '#A23B3B', label: '▼ Down' },
  flat: { color: '#BD8A2E', label: '— Steady' },
}

export default function LifeAreaGrid({ areas, onOpenReport }) {
  const { t } = useTranslation()
  if (!areas?.length) return null

  return (
    <div className="grid grid-cols-2 gap-3">
      {areas.map(area => {
        const ts = TREND_STYLE[area.trend] || TREND_STYLE.flat
        const emoji = AREA_EMOJI[area.id] || '✦'
        return (
          <button
            key={area.id}
            onClick={() => onOpenReport(area.topicId)}
            className="text-left bg-white/[0.045] border border-white/[0.09] rounded-2xl p-4 transition hover:border-primary/40 group flex flex-col gap-2"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-base">{emoji}</span>
              <span className="text-[10px] font-bold" style={{ color: ts.color }}>
                {t(`life_trend_${area.trend}`, ts.label)}
              </span>
            </div>

            {/* Area name */}
            <p className="font-serif font-semibold text-[14px] text-primary-light leading-tight">
              {t(`life_area_${area.id}`, area.label)}
            </p>

            {/* Score bar */}
            <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden w-full">
              <div className="h-full rounded-full" style={{ width: `${area.pct}%`, background: BAR_COLOR[area.trend] }} />
            </div>

            {/* Insight line — lord + house */}
            {area.nugget && (
              <p className="text-[11px] text-ink-onnight/45 leading-snug line-clamp-2">
                {area.nugget}
              </p>
            )}

            {/* CTA */}
            <p className="text-[11px] font-bold text-primary mt-auto group-hover:underline">
              {t('report_open')} →
            </p>
          </button>
        )
      })}
    </div>
  )
}
