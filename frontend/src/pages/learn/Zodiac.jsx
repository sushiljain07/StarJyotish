// frontend/src/pages/learn/Zodiac.jsx
//
// The flagship Knowledge Center page: "Understanding the 12 Zodiac Signs
// in Vedic Astrology". Composed the same way Learn.jsx is — Seo +
// SiteHeader + knowledge/Hero + a stack of knowledge/Section blocks +
// Footer — rather than KnowledgeLayout, which is built for a single
// narrow reading column. This page needs several full-width blocks (the
// Vedic/Western comparison, the 12-card Rashi grid), so the Section-per-
// block pattern fits better; KnowledgeLayout stays reserved for guides
// that really are one continuous article (an individual sign page, for
// instance).
//
// All copy lives in config/zodiacContent.js — this file only composes
// layout, exactly per the "future proofing" requirement for this page.
import { Link, useNavigate } from 'react-router-dom'
import Seo from '../../components/Seo'
import SiteHeader from '../../components/SiteHeader'
import Footer from '../../components/Footer'
import Reveal from '../../components/Reveal'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import Hero from '../../components/knowledge/Hero'
import Section from '../../components/knowledge/Section'
import Callout from '../../components/knowledge/Callout'
import ZodiacCard from '../../components/knowledge/ZodiacCard'
import ZodiacSignIcon from '../../components/knowledge/ZodiacSignIcon'
import FAQ from '../../components/knowledge/FAQ'
import CTA from '../../components/knowledge/CTA'
import LearningPath from '../../components/knowledge/LearningPath'
import LearningMetadata from '../../components/knowledge/LearningMetadata'
import ConceptLink from '../../components/knowledge/ConceptLink'
import RelatedArticles from '../../components/knowledge/RelatedArticles'
import { getGuide, getLearningPathSteps, getNextGuide } from '../../config/knowledgeGraph'
import { getCategoryLabel } from '../../config/learningTaxonomy'
import {
  ZODIAC_HERO,
  COSMIC_LANGUAGE,
  VEDIC_VS_WESTERN,
  RASHIS_INTRO,
  RASHIS,
  BEYOND_ZODIAC,
  MYTHS,
  ZODIAC_FAQ,
  ZODIAC_FINAL_CTA,
} from '../../config/zodiacContent'

// Vedic/Western comparison card — kept local rather than promoted to
// components/knowledge/ since a two-system side-by-side comparison like
// this is specific to this one page; nothing else in the Knowledge
// Center needs this exact shape yet. If a future page needs the same
// "two systems compared" layout, this is the first thing to extract.
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
        <div>
          <dt className={`text-[11px] font-semibold tracking-wide uppercase mb-1 ${accent ? 'text-ink-onnight/60' : 'text-ink-faint'}`}>Anchored to</dt>
          <dd className={`text-sm leading-relaxed ${accent ? 'text-ink-onnight' : 'text-ink-muted'}`}>{system.anchor}</dd>
        </div>
        <div>
          <dt className={`text-[11px] font-semibold tracking-wide uppercase mb-1 ${accent ? 'text-ink-onnight/60' : 'text-ink-faint'}`}>Origin</dt>
          <dd className={`text-sm leading-relaxed ${accent ? 'text-ink-onnight' : 'text-ink-muted'}`}>{system.origin}</dd>
        </div>
        <div>
          <dt className={`text-[11px] font-semibold tracking-wide uppercase mb-1 ${accent ? 'text-ink-onnight/60' : 'text-ink-faint'}`}>Emphasis</dt>
          <dd className={`text-sm leading-relaxed ${accent ? 'text-ink-onnight' : 'text-ink-muted'}`}>{system.focus}</dd>
        </div>
      </dl>
    </div>
  )
}

export default function ZodiacGuide() {
  const navigate = useNavigate()
  const scrollProgress = useScrollProgress(80)

  const guide = getGuide('zodiac')
  const learningPathSteps = getLearningPathSteps('zodiac')
  const nextGuide = getNextGuide('zodiac')

  return (
    <div className="min-h-screen bg-parchment">
      <Seo
        title="Understanding the 12 Zodiac Signs in Vedic Astrology"
        description="Discover the twelve Rashis of Vedic astrology, what they represent, and why your zodiac sign is only one chapter in your complete birth chart."
        path="/learn/zodiac"
      />
      <SiteHeader scrollProgress={scrollProgress} onCtaClick={() => navigate('/generate')} />

      <Hero
        eyebrow="Knowledge Center"
        breadcrumbItems={[{ label: 'Home', to: '/' }, { label: 'Learn', to: '/learn' }, { label: 'Zodiac Signs' }]}
        title={ZODIAC_HERO.title}
        subtitle={ZODIAC_HERO.subtitle}
        meta={
          <LearningMetadata
            estimatedReadTime={guide.estimatedReadTime}
            difficulty={guide.difficulty}
            category={getCategoryLabel(guide.category)}
            lastUpdated={guide.lastUpdated}
            variant="dark"
          />
        }
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#rashis"
            className="inline-block bg-primary hover:bg-primary-dark text-night font-semibold text-sm px-7 py-3 rounded-full shadow-md hover:shadow-lg transition"
          >
            Explore the Zodiac Signs
          </a>
          <Link
            to="/generate"
            className="inline-block bg-white/10 hover:bg-white/20 text-primary-light font-semibold text-sm px-7 py-3 rounded-full transition"
          >
            Generate Free Kundli
          </Link>
        </div>
      </Hero>

      {/* Your Learning Path — new this sprint, doesn't touch any existing
          section below */}
      <Section maxWidth="max-w-4xl">
        <LearningPath steps={learningPathSteps} />
      </Section>

      {/* The Zodiac: A Cosmic Language */}
      <Section eyebrow={COSMIC_LANGUAGE.eyebrow} title={COSMIC_LANGUAGE.title} maxWidth="max-w-3xl">
        <Reveal className="space-y-4">
          {COSMIC_LANGUAGE.paragraphs.map((p, i) => (
            <p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>
          ))}
        </Reveal>
        <Callout variant="insight" title={COSMIC_LANGUAGE.didYouKnow.title}>
          {COSMIC_LANGUAGE.didYouKnow.body}
        </Callout>
      </Section>

      {/* Vedic vs Western Astrology */}
      <Section
        eyebrow={VEDIC_VS_WESTERN.eyebrow}
        title={VEDIC_VS_WESTERN.title}
        description={VEDIC_VS_WESTERN.description}
        className="bg-parchment-card/60"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          <Reveal><SystemCard system={VEDIC_VS_WESTERN.vedic} accent /></Reveal>
          <Reveal delay={60}><SystemCard system={VEDIC_VS_WESTERN.western} /></Reveal>
        </div>
        <Reveal className="max-w-2xl mx-auto text-center mt-8">
          <p className="text-ink-muted text-sm leading-relaxed">{VEDIC_VS_WESTERN.closing}</p>
        </Reveal>
      </Section>

      {/* Meet the Twelve Rashis */}
      <Section
        id="rashis"
        eyebrow={RASHIS_INTRO.eyebrow}
        title={RASHIS_INTRO.title}
        description={RASHIS_INTRO.description}
        align="center"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RASHIS.map((rashi, i) => (
            <Reveal key={rashi.id} delay={(i % 3) * 60}>
              <ZodiacCard
                sanskrit={rashi.sanskrit}
                english={rashi.english}
                archetype={rashi.archetype}
                tagline={rashi.tagline}
                icon={<ZodiacSignIcon id={rashi.id} className="w-7 h-7" />}
                comingSoon
              />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Beyond Your Zodiac Sign */}
      <Section
        eyebrow={BEYOND_ZODIAC.eyebrow}
        title={BEYOND_ZODIAC.title}
        description={BEYOND_ZODIAC.description}
        className="bg-night"
        tone="dark"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto mb-10">
          {BEYOND_ZODIAC.items.map((item, i) => (
            <Reveal key={item.label} delay={i * 50}>
              <p className="font-semibold text-sm text-primary-light mb-1.5">
                <ConceptLink id={item.conceptId}>{item.label}</ConceptLink>
              </p>
              <p className="text-ink-onnight text-sm leading-relaxed">{item.description}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="max-w-xl mx-auto text-center">
          <p className="font-serif italic text-xl sm:text-2xl text-primary-light leading-snug">
            {BEYOND_ZODIAC.analogy}
          </p>
        </Reveal>
      </Section>

      {/* Myth vs Reality */}
      <Section eyebrow="Setting the Record Straight" title="Myth vs. reality" maxWidth="max-w-3xl">
        <div className="space-y-6">
          {MYTHS.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <Callout variant="warning" title="Myth">{item.myth}</Callout>
              <Callout variant="tip" title="Reality">{item.reality}</Callout>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section eyebrow="Common Questions" title="Frequently asked questions">
        <FAQ items={ZODIAC_FAQ} />
      </Section>

      {/* Continue Learning — recommends the next guide in the main
          learning path (see config/knowledgeGraph.js). Renders a
          "Coming soon" state rather than a link, since Nakshatras
          doesn't have a page yet. */}
      {nextGuide && (
        <RelatedArticles
          variant="next"
          title="Continue learning"
          items={[{
            title: nextGuide.title,
            href: nextGuide.href,
            comingSoon: nextGuide.comingSoon,
            description: nextGuide.description,
          }]}
        />
      )}

      {/* Final CTA */}
      <CTA
        eyebrow={ZODIAC_FINAL_CTA.eyebrow}
        title={ZODIAC_FINAL_CTA.title}
        description={ZODIAC_FINAL_CTA.description}
        buttonLabel={ZODIAC_FINAL_CTA.buttonLabel}
        to="/generate"
        variant="full"
      />

      <Footer />
    </div>
  )
}
