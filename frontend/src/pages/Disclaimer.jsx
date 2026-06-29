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
        <p>{t('disclaimer')}</p>
      </StaticPageLayout>
    </>
  )
}
