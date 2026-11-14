import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function DisclaimerBlock() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center gap-2 text-2xs text-ink-onnightMuted text-center py-2">
      <span aria-hidden="true">🪔</span>
      <p>
        {t('disclaimer_short')}{' '}
        <Link to="/disclaimer" className="underline hover:text-ink-onnight">{t('disclaimer_full_link')}</Link>
      </p>
    </div>
  )
}
