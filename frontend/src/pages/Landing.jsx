// frontend/src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TOPICS } from '../config/topics'
import { isLoginRequired, hasUsedFreeKundli } from '../config/auth'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import AskPersonaCard from '../components/AskPersonaCard'
import FAQAccordion from '../components/FAQAccordion'
import FaqSchema from '../components/FaqSchema'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import TopicIcon from '../components/TopicIcon'
import TabIcon from '../components/TabIcon'
import CelestialBackdrop from '../components/CelestialBackdrop'
import SectionDivider from '../components/SectionDivider'
import Testimonials from '../components/Testimonials'

// Capability badges shown in the hero. These are claims Star Jyotish can
// actually back up today (real Swiss Ephemeris calculations, real
// bilingual coverage) — deliberately not traction numbers like "500,000+
// users", which would need to be true before they could be shown honestly.
const BADGES = ['landing_badge_accuracy', 'landing_badge_free', 'landing_badge_bilingual', 'landing_badge_ai']

// Static accent map for the "what's inside" preview grid — mirrors the
// accent vocabulary Result.jsx uses for these same four areas (Advanced =
// sage, Insights = mauve, Ask = vermillion), so returning users recognize
// the colors instead of learning a new palette just for the landing page.
const INSIDE_ACCENTS = {
  kundli:   { border: 'border-primary',   chip: 'bg-primary-light text-primary-dark' },
  advanced: { border: 'border-sage',      chip: 'bg-sage-light text-sage' },
  insights: { border: 'border-mauve',     chip: 'bg-mauve-light text-mauve' },
  ask:      { border: 'border-vermillion', chip: 'bg-vermillion-light text-vermillion' },
}
const INSIDE_ITEMS = ['kundli', 'advanced', 'insights', 'ask']

const FAQ_IDS = [1, 2, 3, 4, 5]

export default function Landing() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  // 140px — short enough that the header reads as fully solid well before
  // you've scrolled even a third of the way through the hero, long enough
  // that the transition itself doesn't feel like a snap. See
  // SiteHeader.jsx for what this drives (background opacity + blur).
  const headerScrollProgress = useScrollProgress(140)
  const landingFaqItems = FAQ_IDS.map(n => ({
    question: t(`landing_faq_q${n}`),
    answer: t(`landing_faq_a${n}`),
  }))

  function goToForm(topicId, extraState = {}) {
    const state = { ...(topicId ? { topic: topicId } : {}), ...extraState }
    const hasState = Object.keys(state).length > 0
    // Two independent reasons to redirect to /login first:
    //   - isLoginRequired(): the global "always require an account" switch
    //   - the "first free Kundli" gate: only applies to the generic
    //     (topicId === null) flow specifically — that's the one the
    //     landing page's "No signup needed for your first free Kundli"
    //     copy is actually promising. Topic-specific reports aren't part
    //     of that promise and already have their own paywall handling
    //     downstream, so they're left alone here.
    const needsLoginForFreeLimit = !topicId && !isAuthenticated && hasUsedFreeKundli()
    if (isLoginRequired() || needsLoginForFreeLimit) {
      navigate('/login', { state: { next: '/generate', ...state } })
      return
    }
    navigate('/generate', hasState ? { state } : undefined)
  }

  return (
    <div className="min-h-screen bg-parchment overflow-x-hidden">
      <Seo
        title="Your Personal AI Vedic Astrologer"
        description="Your personal AI-powered Vedic astrologer. Free birth chart plus daily, personalized guidance on career, wealth, relationships & health. English and Hindi."
        path="/"
      />
      <SiteHeader
        scrollProgress={headerScrollProgress}
        onCtaClick={() => goToForm(null)}
      />

      {/* ───────────────────── Hero ───────────────────── */}
      {/* pt-20/24: clears SiteHeader, which is now `fixed` and present
          from the first paint (previously only appeared after scrolling
          past this section, so no clearance was needed — now it always
          overlays the top ~52px of every page, transparent or not). */}
      <div className="relative overflow-hidden bg-night px-6 pt-20 sm:pt-24 pb-12 text-center">
        <CelestialBackdrop className="text-primary opacity-40" />
        {/* Brand icon — same mark used as the small "Kundli" icon further
            down this page (see the "What's inside" section). Restores the
            standalone icon that sat above the title before the wordmark
            artwork below was introduced. */}
        <img
          src="/starjyotish.svg"
          alt=""
          className="relative w-16 h-16 mx-auto mb-2"
        />
        {/* Main naming — the actual logo artwork, background knocked out
            to transparent so it sits flush on bg-night with no edge or
            box around it. Sized to read as part of the hero, not as its
            own section. Same file is reused at a smaller size in the
            sticky header (see LandingStickyHeader.jsx) so the two never
            drift out of sync.
            -mb-* compensates for transparent padding baked into the bottom
            of the source webp (the visible glyphs end well above the
            image's true bottom edge), which is what was creating the
            oversized gap before the headline.
            translate-x corrects for the artwork itself sitting ~3.4%
            right of center within its own canvas — mx-auto alone centers
            the *box*, not the visibly-off-center content inside it, which
            is what made the hero look uncentered on narrow viewports. */}
        <img
          src="/starjyotish-logo.webp"
          alt="Star Jyotish"
          width={667}
          height={297}
          fetchPriority="high"
          className="relative w-64 sm:w-80 md:w-96 h-auto mx-auto -mb-4 sm:-mb-5 md:-mb-6 -translate-x-[3.4%]"
        />
        <h1 className="relative font-serif font-semibold text-3xl sm:text-4xl text-primary-light tracking-tight leading-tight">
          {t('landing_headline')}
        </h1>
        <p className="relative text-ink-onnight mt-3 text-sm sm:text-base max-w-md mx-auto">
          {t('landing_subhead')}
        </p>

        {/* Capability badges — max-w widens at sm+ specifically so all 4
            fit on a single row on tablet/desktop (mobile keeps the
            narrower max-w-md, which is what lets them wrap onto 2 lines
            there instead of overflowing or getting cramped). */}
        <div className="relative flex flex-wrap justify-center gap-2 mt-5 max-w-md sm:max-w-3xl mx-auto">
          {BADGES.map(key => (
            <span
              key={key}
              className="bg-primary/10 text-primary text-[11px] font-medium px-3 py-1 rounded-full border border-primary/30"
            >
              {t(key)}
            </span>
          ))}
        </div>

        {/* Primary CTA — the free Kundli itself, not any one topic.
            Language toggle and sign-in/account controls used to be
            duplicated here (this was the only place they were reachable
            before scrolling, back when the header only appeared after
            passing the hero) — now that SiteHeader is always present from
            the first paint, that duplication is gone; this section is
            just the hero's own content again. */}
        <button
          onClick={() => goToForm(null)}
          className="relative mt-7 bg-primary hover:bg-primary-dark text-night font-semibold text-sm sm:text-base px-7 py-3 rounded-full shadow-lg hover:shadow-xl transition"
        >
          {t('landing_cta_generic')} →
        </button>
        <p className="relative text-ink-onnight text-xs mt-2">{t('landing_footer_note')}</p>
      </div>

      {/* ───────────────── AI persona spotlight — asymmetric on desktop ───────────────── */}
      <section className="px-4 py-12 overflow-hidden">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <Reveal className="text-center lg:text-left">
            <p className="text-primary-dark text-xs font-bold tracking-wide uppercase mb-2">
              {t('landing_ai_eyebrow')}
            </p>
            <h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink">{t('landing_ai_heading')}</h2>
            <p className="text-ink-muted text-sm mt-2 max-w-md mx-auto lg:mx-0">{t('landing_ai_subhead')}</p>
          </Reveal>
          <Reveal delay={100}>
            <AskPersonaCard
              onAskQuestion={question => goToForm(null, { presetQuestion: question })}
              onAskOwn={() => goToForm(null, { landToAsk: true })}
            />
          </Reveal>
        </div>
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

      <SectionDivider />

      {/* ───────────────────── How it works ───────────────────── */}
      <section id="how-it-works" className="px-4 py-10 scroll-mt-16">
        <div className="max-w-3xl mx-auto">
          <Reveal as="h2" className="text-center font-serif font-semibold text-2xl text-ink mb-8">
            {t('landing_steps_heading')}
          </Reveal>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-y-8 gap-x-6">
            {/* Connecting line — only meaningful once the 3 steps sit in a
                row; hidden on mobile where they stack vertically instead. */}
            <div
              className="hidden sm:block absolute top-5 left-[16.6%] right-[16.6%] border-t border-dashed border-primary/30"
              aria-hidden="true"
            />
            {[1, 2, 3].map((n, i) => (
              <Reveal key={n} delay={i * 100} className="relative text-center">
                <div className="w-10 h-10 rounded-full bg-primary-light text-primary-dark font-bold flex items-center justify-center mx-auto mb-3 ring-4 ring-parchment">
                  {n}
                </div>
                <h3 className="font-semibold text-ink text-sm mb-1">{t(`landing_step${n}_title`)}</h3>
                <p className="text-ink-muted text-xs leading-relaxed">{t(`landing_step${n}_body`)}</p>
              </Reveal>
            ))}
          </div>
          {/* Doesn't promise unbuilt memory/personalization features — just
              names the fact already true today: a birth chart is a fixed
              calculation, so there's no "expiry" forcing a one-time visit.
              This is where the sprint's continuity idea lives without a
              4th grid item (which would break the existing 3-column
              layout for no real gain). */}
          <Reveal delay={300} className="text-center text-ink-muted text-xs mt-8 max-w-md mx-auto">
            {t('landing_steps_continuity')}
          </Reveal>
        </div>
      </section>

      <SectionDivider />

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
                <div className={`bg-parchment-card rounded-lg border-l-4 ${INSIDE_ACCENTS[id].border} p-5 shadow-sm flex gap-3 items-start`}>
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${INSIDE_ACCENTS[id].chip}`}>
                    {id === 'kundli'
                      ? <img src="/starjyotish.svg" alt="" className="w-5 h-5" />
                      : <TabIcon id={id} className="w-5 h-5" />}
                  </span>
                  <span>
                    <h3 className="font-bold text-sm text-ink mb-1">{t(`landing_inside_${id}_label`)}</h3>
                    <p className="text-xs leading-relaxed text-ink-muted">{t(`landing_inside_${id}_body`)}</p>
                  </span>
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

      <SectionDivider />

      {/* ───────────────────── Testimonials ───────────────────── */}
      <Testimonials onCtaClick={() => goToForm(null)} />

      <SectionDivider />

      {/* ───────────────────── FAQ ───────────────────── */}
      <section id="faq" className="px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <Reveal as="h2" className="text-center font-serif font-semibold text-2xl text-ink mb-6">
            {t('landing_faq_heading')}
          </Reveal>
          <Reveal delay={100}>
            <FAQAccordion items={landingFaqItems} />
          </Reveal>
        </div>
      </section>
      <FaqSchema items={landingFaqItems} />

      {/* ───────────────────── Final CTA ───────────────────── */}
      <Reveal as="div" className="relative overflow-hidden bg-night px-6 py-12 text-center">
        <CelestialBackdrop className="text-primary opacity-30" />
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

      <Footer />
    </div>
  )
}
