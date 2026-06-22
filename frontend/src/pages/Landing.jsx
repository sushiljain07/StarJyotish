// frontend/src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TOPICS } from '../config/topics'
import { isLoginRequired } from '../config/auth'
import { useScrolledPast } from '../hooks/useScrolledPast'
import Reveal from '../components/Reveal'
import AskPersonaCard from '../components/AskPersonaCard'
import FAQAccordion from '../components/FAQAccordion'
import LandingStickyHeader from '../components/LandingStickyHeader'

// Capability badges shown in the hero. These are claims AstroGuru can
// actually back up today (real Swiss Ephemeris calculations, real
// bilingual coverage) — deliberately not traction numbers like "500,000+
// users", which would need to be true before they could be shown honestly.
const BADGES = ['landing_badge_accuracy', 'landing_badge_free', 'landing_badge_bilingual', 'landing_badge_ai']

// Static accent map for the "what's inside" preview grid — mirrors the
// accent vocabulary Result.jsx already uses for these same four areas
// (Advanced = teal, Insights = rose), so returning users recognize the
// colors instead of learning a new palette just for the landing page.
const INSIDE_ACCENTS = {
  kundli:   'bg-indigo-50 border-indigo-100 text-indigo-700',
  advanced: 'bg-teal-50 border-teal-100 text-teal-700',
  insights: 'bg-rose-50 border-rose-100 text-rose-700',
  ask:      'bg-amber-50 border-amber-100 text-amber-700',
}
const INSIDE_ITEMS = ['kundli', 'advanced', 'insights', 'ask']

const FAQ_IDS = [1, 2, 3, 4, 5]

export default function Landing() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [heroSentinelRef, heroPassed] = useScrolledPast()

  function goToForm(topicId, extraState = {}) {
    const state = { ...(topicId ? { topic: topicId } : {}), ...extraState }
    const hasState = Object.keys(state).length > 0
    if (isLoginRequired()) {
      navigate('/login', { state: { next: '/generate', ...state } })
      return
    }
    navigate('/generate', hasState ? { state } : undefined)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <LandingStickyHeader
        visible={heroPassed}
        currentLanguage={i18n.language}
        onLanguageChange={lang => i18n.changeLanguage(lang)}
        onCtaClick={() => goToForm(null)}
      />

      {/* ───────────────────── Hero ───────────────────── */}
      <div className="bg-primary px-6 pt-14 pb-12 text-center">
        <img src="/astroguru.svg" alt="AstroGuru" className="w-16 h-16 mx-auto mb-2" />
        <div className="text-white font-bold text-lg tracking-wide mb-3">{t('app_title')}</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t('landing_headline')}
        </h1>
        <p className="text-indigo-200 mt-2 text-sm sm:text-base max-w-md mx-auto">
          {t('landing_subhead')}
        </p>

        {/* Capability badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-5 max-w-md mx-auto">
          {BADGES.map(key => (
            <span
              key={key}
              className="bg-white/10 text-indigo-100 text-[11px] font-medium px-3 py-1 rounded-full border border-white/20"
            >
              {t(key)}
            </span>
          ))}
        </div>

        {/* Language toggle */}
        <div className="mt-5 flex justify-center gap-2">
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
      {/* Sentinel — once this scrolls out of view, the sticky header appears */}
      <div ref={heroSentinelRef} />

      {/* ───────────────── AI persona spotlight ───────────────── */}
      <section className="px-4 pt-12 pb-10 bg-white">
        <Reveal className="max-w-3xl mx-auto text-center mb-8">
          <p className="text-primary text-xs font-bold tracking-wide uppercase mb-2">
            {t('landing_ai_eyebrow')}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{t('landing_ai_heading')}</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">{t('landing_ai_subhead')}</p>
        </Reveal>
        <Reveal delay={100}>
          <AskPersonaCard
            onAskQuestion={question => goToForm(null, { presetQuestion: question })}
            onAskOwn={() => goToForm(null, { landToAsk: true })}
          />
        </Reveal>
      </section>

      {/* ───────────────────── Topic cards ───────────────────── */}
      <section className="px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-slate-500 text-sm font-medium mb-5">
            {t('landing_topics_heading')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TOPICS.map((topic, i) => (
              <Reveal key={topic.id} delay={i * 80}>
                <button
                  onClick={() => goToForm(topic.id)}
                  className="w-full text-left bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-slate-100 hover:border-indigo-200 transition p-5 flex gap-4 items-start"
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── How it works ───────────────────── */}
      <section className="px-4 py-10 bg-white">
        <div className="max-w-3xl mx-auto">
          <Reveal as="h2" className="text-center text-2xl font-extrabold text-slate-800 mb-8">
            {t('landing_steps_heading')}
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((n, i) => (
              <Reveal key={n} delay={i * 100} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary-light text-primary font-bold flex items-center justify-center mx-auto mb-3">
                  {n}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">{t(`landing_step${n}_title`)}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{t(`landing_step${n}_body`)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── What's inside ───────────────────── */}
      <section className="px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <Reveal as="h2" className="text-center text-2xl font-extrabold text-slate-800 mb-2">
            {t('landing_inside_heading')}
          </Reveal>
          <Reveal delay={50} className="text-center text-slate-500 text-sm mb-8">
            {t('landing_inside_subhead')}
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INSIDE_ITEMS.map((id, i) => (
              <Reveal key={id} delay={i * 80}>
                <div className={`rounded-2xl border p-5 ${INSIDE_ACCENTS[id]}`}>
                  <h3 className="font-bold text-sm mb-1">{t(`landing_inside_${id}_label`)}</h3>
                  <p className="text-xs leading-relaxed opacity-80">{t(`landing_inside_${id}_body`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── Privacy note ───────────────────── */}
      <Reveal as="section" className="px-4 py-6 bg-white">
        <div className="max-w-2xl mx-auto flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4">
          <span className="text-xl shrink-0">🔒</span>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">{t('landing_privacy_heading')}</h3>
            <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{t('landing_privacy_body')}</p>
          </div>
        </div>
      </Reveal>

      {/* ───────────────────── FAQ ───────────────────── */}
      <section className="px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <Reveal as="h2" className="text-center text-2xl font-extrabold text-slate-800 mb-6">
            {t('landing_faq_heading')}
          </Reveal>
          <Reveal delay={100}>
            <FAQAccordion
              items={FAQ_IDS.map(n => ({
                question: t(`landing_faq_q${n}`),
                answer: t(`landing_faq_a${n}`),
              }))}
            />
          </Reveal>
        </div>
      </section>

      {/* ───────────────────── Final CTA ───────────────────── */}
      <Reveal as="div" className="bg-primary px-6 py-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t('landing_final_cta_heading')}</h2>
        <p className="text-indigo-200 text-sm mt-2">{t('landing_final_cta_body')}</p>
        <button
          onClick={() => goToForm(null)}
          className="mt-6 bg-white text-primary font-bold text-sm sm:text-base px-7 py-3 rounded-full shadow-lg hover:shadow-xl transition"
        >
          {t('landing_cta_generic')} →
        </button>
      </Reveal>

      <footer className="px-4 py-6 text-center">
        <p className="text-slate-400 text-[11px] max-w-md mx-auto leading-relaxed">{t('disclaimer')}</p>
      </footer>
    </div>
  )
}
