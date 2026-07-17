// frontend/src/pages/learn/categories/Nakshatras.jsx
//
// /learn/nakshatras — hub page for the 27 lunar mansions.
// Follows the same architecture as Zodiac.jsx: full-width Sections,
// not KnowledgeLayout (which is reserved for single-column article pages).
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../contexts/AuthContext'
import Seo from '../../../components/Seo'
import SiteHeader from '../../../components/SiteHeader'
import Footer from '../../../components/Footer'
import BottomNav from '../../../components/home/BottomNav'
import Reveal from '../../../components/Reveal'
import { useScrollProgress } from '../../../hooks/useScrollProgress'
import Hero from '../../../components/knowledge/Hero'
import Section from '../../../components/knowledge/Section'
import Callout from '../../../components/knowledge/Callout'
import FAQ from '../../../components/knowledge/FAQ'
import CTA from '../../../components/knowledge/CTA'
import LearningPath from '../../../components/knowledge/LearningPath'
import LearningMetadata from '../../../components/knowledge/LearningMetadata'
import RelatedArticles from '../../../components/knowledge/RelatedArticles'
import { getGuide, getLearningPathSteps, getNextGuide } from '../../../config/knowledgeGraph'
import { getCategoryLabel } from '../../../config/learningTaxonomy'
import {
  NAKSHATRA_HERO,
  WHAT_IS_NAKSHATRA,
  NAKSHATRA_VS_RASHI,
  NAKSHATRAS_INTRO,
  NAKSHATRAS,
  THREE_GANAS,
  HOW_TO_USE,
  NAKSHATRA_MYTHS,
  NAKSHATRA_FAQ,
  NAKSHATRA_CTA,
} from '../../../config/nakshatraContent'

function SystemCard({ system, accent = false }) {
  return (
    <div className={`rounded-2xl p-7 h-full ${accent ? 'bg-night' : 'bg-parchment-card border border-line'}`}>
      <p className={`text-xs font-bold tracking-widest uppercase mb-2 ${accent ? 'text-primary' : 'text-primary-dark'}`}>
        {system.label}
      </p>
      <h3 className={`font-serif font-semibold text-xl mb-5 ${accent ? 'text-primary-light' : 'text-ink'}`}>
        {system.system}
      </h3>
      <dl className="space-y-4">
        {[['Anchored to', system.anchor], ['Origin', system.origin], ['Emphasis', system.focus]].map(([label, val]) => (
          <div key={label}>
            <dt className={`text-[11px] font-semibold tracking-wide uppercase mb-1 ${accent ? 'text-ink-onnight/60' : 'text-ink-faint'}`}>{label}</dt>
            <dd className={`text-sm leading-relaxed ${accent ? 'text-ink-onnight' : 'text-ink-muted'}`}>{val}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function NakshatraCard({ nakshatra }) {
  return (
    <div className="bg-parchment-card border border-line rounded-2xl p-5 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary-dark text-xs font-bold shrink-0">
          {nakshatra.id}
        </span>
        <span className="text-xs text-ink-faint font-medium">{nakshatra.ruler}</span>
      </div>
      <h3 className="font-serif font-semibold text-base text-ink mb-0.5">{nakshatra.name}</h3>
      <p className="text-xs text-ink-faint mb-2">{nakshatra.devanagari} · {nakshatra.degrees}</p>
      <p className="text-sm text-ink-muted leading-relaxed">{nakshatra.nature}</p>
      <p className="text-xs text-primary-dark mt-2 font-medium">{nakshatra.gana}</p>
    </div>
  )
}

export default function NakshatrasGuide() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const { isAuthenticated } = useAuth()
  const scrollProgress = useScrollProgress(80)
  const isHindi = i18n.language?.startsWith('hi')

  const guide = getGuide('nakshatra')
  const learningPathSteps = getLearningPathSteps('nakshatra')
  const nextGuide = getNextGuide('nakshatra')

  return (
    <div className="min-h-screen bg-parchment">
      <Seo
        title="Nakshatras — The 27 Lunar Mansions in Vedic Astrology"
        description="Understand the 27 Nakshatras of Vedic astrology — their ruling planets, symbols, Ganas, and how your birth Nakshatra shapes your emotional nature and Dasha sequence."
        path="/learn/nakshatras"
      />
      <SiteHeader scrollProgress={scrollProgress} onCtaClick={() => navigate('/generate')} />

      <Hero
        eyebrow="Knowledge Center"
        breadcrumbItems={[
          { label: 'Home', to: isAuthenticated ? '/home' : '/' },
          { label: 'Learn', to: '/learn' },
          { label: 'Nakshatras' },
        ]}
        title={NAKSHATRA_HERO.title}
        subtitle={NAKSHATRA_HERO.subtitle}
        meta={
          guide ? (
            <LearningMetadata
              estimatedReadTime={guide.estimatedReadTime}
              difficulty={guide.difficulty}
              category={getCategoryLabel(guide.category)}
              lastUpdated={guide.lastUpdated}
              variant="dark"
            />
          ) : null
        }
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#nakshatras"
            className="inline-block bg-primary hover:bg-primary-dark text-night font-semibold text-sm px-7 py-3 rounded-full shadow-md hover:shadow-lg transition"
          >
            Explore All 27 Nakshatras
          </a>
        </div>
      </Hero>

      {isHindi && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-primary-light border border-primary/30 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-lg shrink-0">🌐</span>
            <p className="text-sm text-primary-dark leading-relaxed">
              यह लेख अभी केवल अंग्रेज़ी में उपलब्ध है। हिंदी अनुवाद जल्द आएगा।
              <span className="font-medium"> (This guide is currently available in English only.)</span>
            </p>
          </div>
        </div>
      )}

      <Section maxWidth="max-w-4xl">
        <LearningPath steps={learningPathSteps} />
      </Section>

      {/* What is a Nakshatra */}
      <Section eyebrow={WHAT_IS_NAKSHATRA.eyebrow} title={WHAT_IS_NAKSHATRA.title} maxWidth="max-w-3xl">
        <Reveal className="space-y-4">
          {WHAT_IS_NAKSHATRA.paragraphs.map((p, i) => (
            <p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>
          ))}
        </Reveal>
        <Callout variant="insight" title={WHAT_IS_NAKSHATRA.didYouKnow.title}>
          {WHAT_IS_NAKSHATRA.didYouKnow.body}
        </Callout>
      </Section>

      {/* Nakshatras vs Rashis */}
      <Section
        eyebrow={NAKSHATRA_VS_RASHI.eyebrow}
        title={NAKSHATRA_VS_RASHI.title}
        description={NAKSHATRA_VS_RASHI.description}
        className="bg-parchment-card/60"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          <Reveal><SystemCard system={NAKSHATRA_VS_RASHI.nakshatra} accent /></Reveal>
          <Reveal delay={60}><SystemCard system={NAKSHATRA_VS_RASHI.rashi} /></Reveal>
        </div>
        <Reveal className="max-w-2xl mx-auto text-center mt-8">
          <p className="text-ink-muted text-sm leading-relaxed">{NAKSHATRA_VS_RASHI.closing}</p>
        </Reveal>
      </Section>

      {/* The 27 Nakshatras */}
      <Section
        id="nakshatras"
        eyebrow={NAKSHATRAS_INTRO.eyebrow}
        title={NAKSHATRAS_INTRO.title}
        description={NAKSHATRAS_INTRO.description}
        align="center"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAKSHATRAS.map((n, i) => (
            <Reveal key={n.id} delay={(i % 3) * 50}>
              <NakshatraCard nakshatra={n} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Three Ganas */}
      <Section
        eyebrow={THREE_GANAS.eyebrow}
        title={THREE_GANAS.title}
        description={THREE_GANAS.description}
        className="bg-night"
        tone="dark"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {THREE_GANAS.items.map((item, i) => (
            <Reveal key={item.gana} delay={i * 60}>
              <div className="bg-white/5 rounded-2xl p-6 h-full">
                <p className="text-primary font-bold text-lg mb-1">{item.emoji}</p>
                <h3 className="font-serif font-semibold text-lg text-primary-light mb-3">{item.gana}</h3>
                <p className="text-xs text-ink-onnight/60 font-medium mb-3">{item.nakshatras}</p>
                <p className="text-ink-onnight text-sm leading-relaxed">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* How to work with your Nakshatra */}
      <Section eyebrow={HOW_TO_USE.eyebrow} title={HOW_TO_USE.title} maxWidth="max-w-3xl">
        <Reveal className="space-y-4">
          {HOW_TO_USE.paragraphs.map((p, i) => (
            <p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>
          ))}
        </Reveal>
      </Section>

      {/* Myth vs Reality */}
      <Section eyebrow="Setting the Record Straight" title="Myth vs. reality" maxWidth="max-w-3xl">
        <div className="space-y-6">
          {NAKSHATRA_MYTHS.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <Callout variant="warning" title="Myth">{item.myth}</Callout>
              <Callout variant="tip" title="Reality">{item.reality}</Callout>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section eyebrow="Common Questions" title="Frequently asked questions">
        <FAQ items={NAKSHATRA_FAQ} />
      </Section>

      {nextGuide && (
        <RelatedArticles
          variant="next"
          title="Continue learning"
          items={[{
            title: nextGuide.title,
            href: nextGuide.href,
            comingSoon: nextGuide.comingSoon,
            description: nextGuide.teaser,
          }]}
        />
      )}

      <CTA
        eyebrow={NAKSHATRA_CTA.eyebrow}
        title={NAKSHATRA_CTA.title}
        description={NAKSHATRA_CTA.description}
        buttonLabel={NAKSHATRA_CTA.buttonLabel}
        to="/generate"
        variant="full"
      />

      <Footer />
      <BottomNav />
    </div>
  )
}
