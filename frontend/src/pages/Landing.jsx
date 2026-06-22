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
import TopicIcon from '../components/TopicIcon'

// Capability badges shown in the hero. These are claims AstroGuru can
// actually back up today (real Swiss Ephemeris calculations, real
// bilingual coverage) — deliberately not traction numbers like "500,000+
// users", which would need to be true before they could be shown honestly.
const BADGES = ['landing_badge_accuracy', 'landing_badge_free', 'landing_badge_bilingual', 'landing_badge_ai']

// Static accent map for the "what's inside" preview grid — mirrors the
// accent vocabulary Result.jsx uses for these same four areas (Advanced =
// sage, Insights = mauve, Ask = vermillion), so returning users recognize
// the colors instead of learning a new palette just for the landing page.
const INSIDE_ACCENTS = {
  kundli:   'border-primary',
  advanced: 'border-sage',
  insights: 'border-mauve',
  ask:      'border-vermillion',
}
const INSIDE_ITEMS = ['kundli', 'advanced', 'insights', 'ask']

// A sparse, hand-placed scatter of stars behind the hero headline — the
// page's one deliberate signature flourish (see the design critique this
// followed). Kept tiny and low-opacity so it reads as atmosphere, not
// decoration competing with the text.
const STARS = [
  { top: '10%', left: '12%', size: 3 }, { top: '22%', left: '85%', size: 2 },
  { top: '8%',  left: '60%', size: 2 }, { top: '32%', left: '8%',  size: 2 },
  { top: '15%', left: '38%', size: 2 }, { top: '38%', left: '92%', size: 3 },
  { top: '28%', left: '70%', size: 2 },
]

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
    <div className="min-h-screen bg-parchment">
      <LandingStickyHeader
        visible={heroPassed}
        currentLanguage={i18n.language}
        onLanguageChange={lang => i18n.changeLanguage(lang)}
        onCtaClick={() => goToForm(null)}
      />

      {/* ───────────────────── Hero ───────────────────── */}
      <div className="relative overflow-hidden bg-night px-6 pt-14 pb-12 text-center">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-primary-light/70"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
            aria-hidden="true"
          />
        ))}
        <img src="/astroguru.svg" alt="AstroGuru" className="relative w-16 h-16 mx-auto mb-2" />
        <div className="relative text-primary font-semibold text-xs tracking-[0.15em] uppercase mb-3">
          {t('app_title')}
        </div>
        <h1 className="relative font-serif font-semibold text-3xl sm:text-4xl text-primary-light tracking-tight leading-tight">
          {t('landing_headline')}
        </h1>
        <p className="relative text-ink-onnight mt-3 text-sm sm:text-base max-w-md mx-auto">
          {t('landing_subhead')}
        </p>

        {/* Capability badges */}
        <div className="relative flex flex-wrap justify-center gap-2 mt-5 max-w-md mx-auto">
          {BADGES.map(key => (
            <span
              key={key}
              className="bg-primary/10 text-primary text-[11px] font-medium px-3 py-1 rounded-full border border-primary/30"
            >
              {t(key)}
            </span>
          ))}
        </div>

        {/* Language toggle */}
        <div className="relative mt-5 flex justify-center gap-2">
          {['en', 'hi'].map(lang => (
            <button
              key={lang}
              onClick={() => i18n.changeLanguage(lang)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                i18n.language.startsWith(lang)
                  ? 'bg-primary text-night'
                  : 'bg-white/10 text-ink-onnight hover:bg-white/20'
              }`}
            >
              {lang === 'en' ? 'EN' : 'हि'}
            </button>
          ))}
        </div>

        {/* Primary CTA — the free Kundli itself, not any one topic */}
        <button
          onClick={() => goToForm(null)}
          className="relative mt-7 bg-primary hover:bg-primary-dark text-night font-semibold text-sm sm:text-base px-7 py-3 rounded-full shadow-lg hover:shadow-xl transition"
        >
          {t('landing_cta_generic')} →
        </button>
        <p className="relative text-ink-onnight text-xs mt-2">{t('landing_footer_note')}</p>
      </div>
      {/* Sentinel — once this scrolls out of view, the sticky header appears */}
      <div ref={heroSentinelRef} />

      {/* ───────────────── AI persona spotlight ───────────────── */}
      <section className="px-4 pt-12 pb-10">
        <Reveal className="max-w-3xl mx-auto text-center mb-8">
          <p className="text-primary-dark text-xs font-bold tracking-wide uppercase mb-2">
            {t('landing_ai_eyebrow')}
          </p>
          <h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink">{t('landing_ai_heading')}</h2>
          <p className="text-ink-muted text-sm mt-2 max-w-md mx-auto">{t('landing_ai_subhead')}</p>
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
          <h2 className="text-center text-ink-muted text-sm font-medium mb-5">
            {t('landing_topics_heading')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TOPICS.map((topic, i) => (
              <Reveal key={topic.id} delay={i * 80}>
                <button
                  onClick={() => goToForm(topic.id)}
                  className="w-full text-left bg-parchment-card rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-line hover:border-primary/40 transition p-5 flex gap-4 items-start"
                >
                  <span className="w-11 h-11 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                    <TopicIcon id={topic.id} className="w-5 h-5 text-primary-dark" />
                  </span>
                  <span>
                    <span className="block font-bold text-ink text-sm mb-1">
                      {t(`landing_topic_${topic.id}_label`)}
                    </span>
                    <span className="block text-ink-muted text-xs leading-relaxed">
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
      <section className="px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <Reveal as="h2" className="text-center font-serif font-semibold text-2xl text-ink mb-8">
            {t('landing_steps_heading')}
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((n, i) => (
              <Reveal key={n} delay={i * 100} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary-light text-primary-dark font-bold flex items-center justify-center mx-auto mb-3">
                  {n}
                </div>
                <h3 className="font-semibold text-ink text-sm mb-1">{t(`landing_step${n}_title`)}</h3>
                <p className="text-ink-muted text-xs leading-relaxed">{t(`landing_step${n}_body`)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── What's inside ───────────────────── */}
      <section className="px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <Reveal as="h2" className="text-center font-serif font-semibold text-2xl text-ink mb-2">
            {t('landing_inside_heading')}
          </Reveal>
          <Reveal delay={50} className="text-center text-ink-muted text-sm mb-8">
            {t('landing_inside_subhead')}
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INSIDE_ITEMS.map((id, i) => (
              <Reveal key={id} delay={i * 80}>
                <div className={`bg-parchment-card rounded-lg border-l-4 ${INSIDE_ACCENTS[id]} p-5 shadow-sm`}>
                  <h3 className="font-bold text-sm text-ink mb-1">{t(`landing_inside_${id}_label`)}</h3>
                  <p className="text-xs leading-relaxed text-ink-muted">{t(`landing_inside_${id}_body`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── Privacy note ───────────────────── */}
      <Reveal as="section" className="px-4 py-6">
        <div className="max-w-2xl mx-auto flex items-start gap-3 bg-parchment-card border border-line rounded-2xl px-5 py-4">
          <span className="text-xl shrink-0">🔒</span>
          <div>
            <h3 className="font-semibold text-ink text-sm">{t('landing_privacy_heading')}</h3>
            <p className="text-ink-muted text-xs mt-0.5 leading-relaxed">{t('landing_privacy_body')}</p>
          </div>
        </div>
      </Reveal>

      {/* ───────────────────── FAQ ───────────────────── */}
      <section className="px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <Reveal as="h2" className="text-center font-serif font-semibold text-2xl text-ink mb-6">
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
      <Reveal as="div" className="relative overflow-hidden bg-night px-6 py-12 text-center">
        {STARS.slice(0, 4).map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-primary-light/60"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
            aria-hidden="true"
          />
        ))}
        <h2 className="relative font-serif font-semibold text-2xl sm:text-3xl text-primary-light">
          {t('landing_final_cta_heading')}
        </h2>
        <p className="relative text-ink-onnight text-sm mt-2">{t('landing_final_cta_body')}</p>
        <button
          onClick={() => goToForm(null)}
          className="relative mt-6 bg-primary hover:bg-primary-dark text-night font-semibold text-sm sm:text-base px-7 py-3 rounded-full shadow-lg hover:shadow-xl transition"
        >
          {t('landing_cta_generic')} →
        </button>
      </Reveal>

      <footer className="px-4 py-6 text-center">
        <p className="text-ink-faint text-[11px] max-w-md mx-auto leading-relaxed">{t('disclaimer')}</p>
      </footer>
    </div>
  )
}
