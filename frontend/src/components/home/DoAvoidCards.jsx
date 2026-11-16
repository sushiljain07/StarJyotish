// frontend/src/components/home/DoAvoidCards.jsx
//
// Today's personalised Do / Avoid guidance, derived from transit planets
// over the natal chart. Two equal cards side by side.
import { useTranslation } from 'react-i18next'
import { Card } from '../ui'

export default function DoAvoidCards({ doItems, avoidItems }) {
  const { t } = useTranslation()
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Card surface="night" padding="none" className="p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-3.5">
          <span className="w-7 h-7 rounded-full bg-good-onnight/20 flex items-center justify-center text-good-onnight text-sm shrink-0">✓</span>
          <h3 className="font-serif font-semibold text-base text-primary-light">{t('do_today_heading')}</h3>
        </div>
        <ul className="space-y-0">
          {doItems.map((item, i) => (
            <li key={i} className={`text-sm text-ink-onnight leading-relaxed py-2.5 ${i > 0 ? 'border-t border-white/[0.08]' : ''}`}>
              {item}
            </li>
          ))}
        </ul>
      </Card>
      <Card surface="night" padding="none" className="p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-3.5">
          <span className="w-7 h-7 rounded-full bg-bad-onnight/20 flex items-center justify-center text-bad-onnight text-sm shrink-0">✗</span>
          <h3 className="font-serif font-semibold text-base text-primary-light">{t('avoid_today_heading')}</h3>
        </div>
        <ul className="space-y-0">
          {avoidItems.map((item, i) => (
            <li key={i} className={`text-sm text-ink-onnight leading-relaxed py-2.5 ${i > 0 ? 'border-t border-white/[0.08]' : ''}`}>
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
