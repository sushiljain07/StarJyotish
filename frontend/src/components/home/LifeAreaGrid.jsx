import { useTranslation } from 'react-i18next'

const BAR_COLOR = { up: '#7F9B72', down: '#B8503D', flat: '#D9A441' }
const TREND_ARROW = { up: '▲', down: '▼', flat: '—' }
const TREND_COLOR = { up: 'text-sage', down: 'text-vermillion', flat: 'text-primary-dark' }

export default function LifeAreaGrid({ areas, onOpenReport }) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {areas.map(area => (
        <div key={area.id} className="bg-parchment-card border border-line rounded-2xl p-4">
          <div className="flex items-baseline justify-between mb-2.5">
            <span className="text-[13px] font-semibold text-ink">{t(`life_area_${area.id}`, area.label)}</span>
            <span className={`text-[11px] font-bold ${TREND_COLOR[area.trend]}`}>
              {TREND_ARROW[area.trend]} {t(`life_trend_${area.trend}`, area.trend)}
            </span>
          </div>
          <div className="h-1.5 bg-line rounded-full overflow-hidden mb-2.5">
            <div className="h-full rounded-full" style={{ width: `${area.pct}%`, background: BAR_COLOR[area.trend] }} />
          </div>
          {area.nugget && (
            <button
              onClick={() => onOpenReport(area.topicId)}
              className="w-full text-left mt-2.5 pt-2.5 border-t border-dashed border-line group"
            >
              <p className="text-[11px] text-ink-faint leading-relaxed">
                <span className="text-primary-dark font-bold">{t('life_did_you_know')}</span> {area.nugget}{' '}
                <span className="text-primary-dark font-semibold group-hover:underline whitespace-nowrap">
                  {t(`report_${area.topicId === 'finance' ? 'finance' : area.id}_label`, area.label)} →
                </span>
              </p>
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
