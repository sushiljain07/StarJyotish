import { useTranslation } from 'react-i18next'

export default function DoAvoidCards({ doItems, avoidItems }) {
  const { t } = useTranslation()
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="bg-parchment-card border border-line rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-3.5">
          <span className="w-2 h-2 rounded-full bg-sage" />
          <h3 className="font-serif font-semibold text-base text-ink">{t('do_today_heading')}</h3>
        </div>
        <ul className="space-y-0">
          {doItems.map((item, i) => (
            <li key={i} className={`text-[13.5px] text-ink-muted leading-relaxed py-2.5 ${i > 0 ? 'border-t border-line' : ''}`}>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-parchment-card border border-line rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-3.5">
          <span className="w-2 h-2 rounded-full bg-vermillion" />
          <h3 className="font-serif font-semibold text-base text-ink">{t('avoid_today_heading')}</h3>
        </div>
        <ul className="space-y-0">
          {avoidItems.map((item, i) => (
            <li key={i} className={`text-[13.5px] text-ink-muted leading-relaxed py-2.5 ${i > 0 ? 'border-t border-line' : ''}`}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
