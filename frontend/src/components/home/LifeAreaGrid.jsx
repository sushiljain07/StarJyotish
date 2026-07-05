// frontend/src/components/home/LifeAreaGrid.jsx
const TREND_STYLE = {
  up:   { arrow: '\u25B2', label: 'Rising', color: 'text-sage' },
  down: { arrow: '\u25BC', label: 'Watch',  color: 'text-vermillion' },
  flat: { arrow: '\u2014', label: 'Stable', color: 'text-primary' },
}

const BAR_COLOR = { up: '#7F9B72', down: '#B8503D', flat: '#D9A441' }

export default function LifeAreaGrid({ areas, onOpenReport }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {areas.map(area => {
        const trend = TREND_STYLE[area.trend]
        return (
          <div key={area.id} className="bg-night-light border border-white/10 rounded-2xl p-4">
            <div className="flex items-baseline justify-between mb-2.5">
              <span className="text-[13px] font-semibold text-ink-onnight/85">{area.label}</span>
              <span className={`text-[11px] font-bold ${trend.color}`}>{trend.arrow} {trend.label}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2.5">
              <div className="h-full rounded-full" style={{ width: `${area.pct}%`, background: BAR_COLOR[area.trend] }} />
            </div>
            {area.nugget && (
              <div className="mt-2.5 pt-2.5 border-t border-dashed border-white/10">
                <p className="text-[11px] text-ink-onnight/55 leading-relaxed">
                  <span className="text-primary font-bold">Did you know?</span> {area.nugget}{' '}
                  <button
                    onClick={() => onOpenReport(area.topicId)}
                    className="text-primary font-semibold hover:underline whitespace-nowrap"
                  >
                    Full {area.label.toLowerCase()} report →
                  </button>
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
