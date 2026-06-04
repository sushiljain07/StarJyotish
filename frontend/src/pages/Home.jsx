// frontend/src/pages/Home.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BirthForm from '../components/BirthForm'
import { fetchKundli } from '../api/astro'

export default function Home() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(input) {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchKundli(input)
      navigate('/kundli', { state: { data, input } })
    } catch (err) {
      setError(
        err.message.toLowerCase().includes('place') || err.message.toLowerCase().includes('not found')
          ? t('error_place_not_found')
          : t('error_generic')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero header */}
      <div className="bg-primary px-6 pt-12 pb-8 text-center">
        <img src="/astroguru.svg" alt="AstroGuru" className="w-16 h-16 mx-auto mb-3" />
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('app_title')}</h1>
        <p className="text-indigo-200 mt-1 text-sm">{t('tagline')}</p>
        {/* Language toggle */}
        <div className="mt-4 flex justify-center gap-2">
          {['en', 'hi'].map(lang => (
            <button
              key={lang}
              onClick={() => i18n.changeLanguage(lang)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                i18n.language.startsWith(lang)
                  ? 'bg-white text-primary'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {lang === 'en' ? 'EN' : 'हि'}
            </button>
          ))}
        </div>

        {/* Career Report shortcut */}
        <div className="mt-5">
          <Link
            to="/career-report"
            className="inline-flex items-center gap-2 px-5 py-2 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold rounded-full border border-white/30 transition no-underline"
          >
            <span>💼</span>
            <span>Career Report</span>
            <span className="text-indigo-200 text-xs">→</span>
          </Link>
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 px-4 -mt-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-md p-6 sm:p-8">
          <BirthForm onSubmit={handleSubmit} loading={loading} />
          {error && (
            <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
