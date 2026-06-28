// frontend/src/pages/Disclaimer.jsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Footer from '../components/Footer'

export default function Disclaimer() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <div className="flex-1 px-6 py-12 max-w-2xl mx-auto w-full">
        <Link to="/" className="text-primary-dark text-sm font-medium hover:underline">
          {t('disclaimer_page_back')}
        </Link>
        <h1 className="font-serif font-semibold text-3xl text-ink mt-4 mb-4">{t('disclaimer_page_heading')}</h1>
        <p className="text-ink-muted text-sm leading-relaxed">{t('disclaimer')}</p>
      </div>
      <Footer />
    </div>
  )
}
