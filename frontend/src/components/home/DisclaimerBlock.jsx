import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function DisclaimerBlock() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center gap-2 text-[11px] text-ink-onnight/40 text-center py-2">
      <span>🪔</span>
      <p>
        {t('disclaimer_short')}{' '}
        <Link to="/disclaimer" className="underline hover:text-ink-onnight/70">{t('disclaimer_full_link')}</Link>
      </p>
    </div>
  )
}
