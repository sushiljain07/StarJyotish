// frontend/src/pages/AboutUs.jsx
import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import Seo from '../components/Seo'
import StaticPageLayout from '../components/StaticPageLayout'

const h2 = 'font-serif font-semibold text-lg text-ink mt-7 mb-2'
const linkCls = 'text-primary-dark hover:underline'

export default function AboutUs() {
  const { t } = useTranslation()
  return (
    <>
      <Seo
        title="About Us"
        description="Star Jyotish combines real Swiss Ephemeris calculations with AI grounded in a structured Vedic astrology reference library — built to be transparent about how each reading is generated."
        path="/about"
      />
      <StaticPageLayout title={t('about_title')} maxWidth="max-w-3xl" eyebrow={t('about_eyebrow')}>
        <p>{t('about_intro')}</p>

        <h2 className={h2}>{t('about_h_approach')}</h2>
        <p>
          <Trans i18nKey="about_p_approach1" components={{ strong: <strong className="text-ink" /> }} />
        </p>
        <p>{t('about_p_approach2')}</p>

        <h2 className={h2}>{t('about_h_who')}</h2>
        <p>{t('about_p_who')}</p>

        <h2 className={h2}>{t('about_h_headed')}</h2>
        <p>
          <Trans i18nKey="about_p_headed" components={{ contact: <Link to="/contact" className={linkCls} /> }} />
        </p>

        <h2 className={h2}>{t('about_h_more')}</h2>
        <p>
          <Trans
            i18nKey="about_p_more"
            components={{
              privacy: <Link to="/privacy" className={linkCls} />,
              disclaimer: <Link to="/disclaimer" className={linkCls} />,
            }}
          />
        </p>
      </StaticPageLayout>
    </>
  )
}
