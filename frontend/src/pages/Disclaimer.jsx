// frontend/src/pages/Disclaimer.jsx
import { useTranslation } from 'react-i18next'
import Seo from '../components/Seo'
import StaticPageLayout from '../components/StaticPageLayout'

export default function Disclaimer() {
  const { t } = useTranslation()

  return (
    <>
      <Seo
        title={t('disclaimer_page_heading')}
        description="Star Jyotish's astrology disclaimer: AI-generated Vedic readings are for guidance and self-reflection only, not a substitute for professional medical, legal, financial, or psychological advice."
        path="/disclaimer"
      />
      <StaticPageLayout title={t('disclaimer_page_heading')}>
        {/* Plain-language summary — so users understand intent before reading the full text */}
        <div className="bg-primary-light border border-primary/30 rounded-xl px-4 py-4 mb-2 not-prose">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-dark mb-2">In plain language</p>
          <ul className="space-y-1.5 text-sm text-ink">
            <li>✦ Readings are for guidance and self-reflection — not medical, legal, or financial advice.</li>
            <li>✦ Astrology is a cultural and philosophical tradition, not a verified science.</li>
            <li>✦ You're in charge of your decisions. We help you reflect; we don't decide for you.</li>
          </ul>
        </div>
        <p>{t('disclaimer')}</p>
      </StaticPageLayout>
    </>
  )
}
