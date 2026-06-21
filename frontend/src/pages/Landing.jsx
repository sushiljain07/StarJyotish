// frontend/src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TOPICS } from '../config/topics'
import { isLoginRequired } from '../config/auth'

export default function Landing() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  function goToForm(topicId) {
    if (isLoginRequired()) {
      // Placeholder for when Phase 7 (Phone + OTP login) exists — for now
      // isLoginRequired() always returns false, so this branch never runs.
      navigate('/login', { state: { next: '/generate', topic: topicId } })
      return
    }
    navigate('/generate', topicId ? { state: { topic: topicId } } : undefined)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero */}
      <div className="bg-primary px-6 pt-14 pb-12 text-center">
        <img src="/astroguru.svg" alt="AstroGuru" className="w-16 h-16 mx-auto mb-2" />
        <div className="text-white font-bold text-lg tracking-wide mb-3">{t('app_title')}</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t('landing_headline')}
        </h1>
        <p className="text-indigo-200 mt-2 text-sm sm:text-base max-w-md mx-auto">
          {t('landing_subhead')}
        </p>

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

        {/* Primary CTA — the free Kundli itself, not any one topic */}
        <button
          onClick={() => goToForm(null)}
          className="mt-7 bg-white text-primary font-bold text-sm sm:text-base px-7 py-3 rounded-full shadow-lg hover:shadow-xl transition"
        >
          {t('landing_cta_generic')} →
        </button>
        <p className="text-indigo-200 text-xs mt-2">{t('landing_footer_note')}</p>
      </div>

      {/* Topic cards */}
      <div className="flex-1 px-4 -mt-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-slate-500 text-sm font-medium mt-8 mb-4">
            {t('landing_topics_heading')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10">
            {TOPICS.map(topic => (
              <button
                key={topic.id}
                onClick={() => goToForm(topic.id)}
                className="text-left bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 hover:border-indigo-200 transition p-5 flex gap-4 items-start"
              >
                <span className="text-3xl shrink-0">{topic.icon}</span>
                <span>
                  <span className="block font-bold text-slate-800 text-sm mb-1">
                    {t(`landing_topic_${topic.id}_label`)}
                  </span>
                  <span className="block text-slate-500 text-xs leading-relaxed">
                    {t(`landing_topic_${topic.id}_question`)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
