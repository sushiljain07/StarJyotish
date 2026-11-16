import { useTranslation } from 'react-i18next'
import { Card } from '../ui'

export default function GoDeeperCta({ onOpenFullReading, guideHref, guideLabel }) {
  const { t } = useTranslation()
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <button
        onClick={onOpenFullReading}
        className="text-left rounded-card p-6 bg-gradient-to-br from-primary to-primary-dark flex flex-col justify-between min-h-[130px] hover:shadow-lift transition"
      >
        <div>
          <h4 className="font-serif font-semibold text-lg text-night mb-1.5">{t('go_deeper_reading_title')}</h4>
          <p className="text-sm text-night/70">{t('go_deeper_reading_body')}</p>
        </div>
        <span className="self-start mt-3.5 text-xs font-bold px-4 py-2 rounded-full bg-night text-primary-light">
          {t('go_deeper_reading_btn')}
        </span>
      </button>
      <Card
        as="a"
        href={guideHref}
        surface="night"
        padding="none"
        className="p-6 flex flex-col justify-between min-h-[130px] hover:border-primary/50 transition"
      >
        <div>
          <h4 className="font-serif font-semibold text-lg text-primary-light mb-1.5">{guideLabel}</h4>
          <p className="text-sm text-ink-onnightMuted">{t('go_deeper_guide_body')}</p>
        </div>
        <span className="self-start mt-3.5 text-xs font-bold px-4 py-2 rounded-full bg-night text-primary-light">
          {t('go_deeper_guide_btn')}
        </span>
      </Card>
    </div>
  )
}
