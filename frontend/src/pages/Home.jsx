// frontend/src/pages/Home.jsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BirthForm from '../components/BirthForm'
import { fetchKundli } from '../api/astro'
import { getTopic } from '../config/topics'

export default function Home() {
  const { t, i18n } = useTranslation()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const topicId = state?.topic ?? null
  const topic = getTopic(topicId)
  // Carried over from the landing page's AI persona spotlight (see
  // Landing.jsx → AskPersonaCard.jsx) — lets Result.jsx land the visitor
  // straight on the Ask tab, optionally with a question already asked.
  const presetQuestion = state?.presetQuestion ?? null
  const landToAsk = Boolean(state?.landToAsk || presetQuestion)

  async function handleSubmit(formInput) {
    setLoading(true)
    setError(null)
    // Merge the incoming topic onto the input object — this is what makes
    // it flow through to the backend's free-Reading prompt later (see
    // ChartReading.jsx, which spreads `input` straight into its request
    // body) without needing a second, separate piece of state.
    const input = topicId ? { ...formInput, topic: topicId } : formInput
    try {
      const data = await fetchKundli(input)
      navigate('/kundli', { state: { data, input, presetQuestion, landToAsk } })
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
      </div>

      {/* Form card */}
      <div className="flex-1 px-4 -mt-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-md p-6 sm:p-8">
          {topic && (
            <div className="mb-4 flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-xs">
              <span className="text-indigo-700 font-medium">
                {topic.icon} {t('focused_on')}: {t(`landing_topic_${topic.id}_label`)}
              </span>
              <button onClick={() => navigate('/')} className="text-indigo-500 underline shrink-0 ml-2">
                {t('change_focus')}
              </button>
            </div>
          )}
          {presetQuestion && (
            <div className="mb-4 flex items-center justify-between bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs">
              <span className="text-amber-700 font-medium truncate">
                💬 {t('home_asking_label')}: “{presetQuestion}”
              </span>
              <button onClick={() => navigate('/')} className="text-amber-600 underline shrink-0 ml-2">
                {t('change_focus')}
              </button>
            </div>
          )}
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
