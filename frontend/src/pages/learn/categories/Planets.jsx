// frontend/src/pages/learn/categories/Planets.jsx
//
// /learn/planets — hub page for the nine Vedic grahas.
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
  PLANETS_HUB_HERO,
  WHAT_IS_A_GRAHA,
  PLANETS,
  PLANETARY_RELATIONSHIPS,
  PLANETS_MYTHS,
  PLANETS_FAQ,
  PLANETS_HUB_CTA,
} from '../../../config/planetsHubContent'

function PlanetCard({ planet }) {
  return (
    <div className="bg-parchment-card border border-line rounded-2xl p-5 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl" style={{ color: planet.color }}>{planet.symbol}</span>
        <span className="text-xs text-ink-faint font-medium bg-parchment px-2 py-0.5 rounded-full">{planet.dasha}</span>
      </div>
      <h3 className="font-serif font-semibold text-base text-ink mb-0.5">{planet.english}</h3>
      <p className="text-xs font-medium text-primary-dark mb-2">{planet.sanskrit}</p>
      <p className="text-sm text-ink-muted leading-relaxed mb-3">{planet.tagline}</p>
      <dl className="space-y-1.5">
        <div className="flex gap-2">
          <dt className="text-[11px] font-semibold text-ink-faint uppercase tracking-wide w-20 shrink-0">Rules</dt>
          <dd className="text-[11px] text-ink-muted">{planet.ruler}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-[11px] font-semibold text-ink-faint uppercase tracking-wide w-20 shrink-0">Exalted</dt>
          <dd className="text-[11px] text-ink-muted">{planet.exaltation}</dd>
        </div>
      </dl>
    </div>
  )
}

export default function PlanetsGuideHub() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const { isAuthenticated } = useAuth()
  const scrollProgress = useScrollProgress(80)
  const isHindi = i18n.language?.startsWith('hi')

  const guide = getGuide('planets')
  const learningPathSteps = getLearningPathSteps('planets')
  const nextGuide = getNextGuide('planets')

  return (
    <div className="min-h-screen bg-parchment">
      <Seo
        title="The Nine Planets (Navagrahas) in Vedic Astrology"
        description="A complete guide to the nine grahas of Vedic astrology — Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu — what they govern and how they operate in your chart."
        path="/learn/planets"
      />
      <SiteHeader scrollProgress={scrollProgress} onCtaClick={() => navigate('/generate')} />

      <Hero
        eyebrow="Knowledge Center"
        breadcrumbItems={[
          { label: 'Home', to: isAuthenticated ? '/home' : '/' },
          { label: 'Learn', to: '/learn' },
          { label: 'Planets' },
        ]}
        title={PLANETS_HUB_HERO.title}
        subtitle={PLANETS_HUB_HERO.subtitle}
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
            href="#planets"
            className="inline-block bg-primary hover:bg-primary-dark text-night font-semibold text-sm px-7 py-3 rounded-full shadow-md hover:shadow-lg transition"
          >
            Meet the Nine Grahas
          </a>
        </div>
      </Hero>

      {isHindi && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-primary-light border border-primary/30 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-lg shrink-0">🌐</span>
            <p className="text-sm text-primary-dark leading-relaxed">
              यह लेख अभी केवल अंग्रेज़ी में उपलब्ध है। हिंदी अनुवाद जल्द आएगा।
            </p>
          </div>
        </div>
      )}

      <Section maxWidth="max-w-4xl">
        <LearningPath steps={learningPathSteps} />
      </Section>

      {/* What is a Graha */}
      <Section eyebrow={WHAT_IS_A_GRAHA.eyebrow} title={WHAT_IS_A_GRAHA.title} maxWidth="max-w-3xl">
        <Reveal className="space-y-4">
          {WHAT_IS_A_GRAHA.paragraphs.map((p, i) => (
            <p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>
          ))}
        </Reveal>
        <Callout variant="insight" title={WHAT_IS_A_GRAHA.didYouKnow.title}>
          {WHAT_IS_A_GRAHA.didYouKnow.body}
        </Callout>
      </Section>

      {/* The Nine Planets */}
      <Section
        id="planets"
        eyebrow="The Navagrahas"
        title="Meet the nine grahas"
        description="Each graha governs specific life areas and produces different results depending on its sign, house, and relationships with other planets in your chart."
        align="center"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLANETS.map((planet, i) => (
            <Reveal key={planet.id} delay={(i % 3) * 50}>
              <PlanetCard planet={planet} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Planetary Relationships */}
      <Section
        eyebrow={PLANETARY_RELATIONSHIPS.eyebrow}
        title={PLANETARY_RELATIONSHIPS.title}
        description={PLANETARY_RELATIONSHIPS.description}
        className="bg-night"
        tone="dark"
        maxWidth="max-w-3xl"
      >
        <Reveal className="space-y-4">
          {PLANETARY_RELATIONSHIPS.paragraphs.map((p, i) => (
            <p key={i} className="text-ink-onnight text-sm sm:text-base leading-relaxed">{p}</p>
          ))}
        </Reveal>
      </Section>

      {/* Myth vs Reality */}
      <Section eyebrow="Setting the Record Straight" title="Myth vs. reality" maxWidth="max-w-3xl">
        <div className="space-y-6">
          {PLANETS_MYTHS.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <Callout variant="warning" title="Myth">{item.myth}</Callout>
              <Callout variant="tip" title="Reality">{item.reality}</Callout>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section eyebrow="Common Questions" title="Frequently asked questions">
        <FAQ items={PLANETS_FAQ} />
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
        eyebrow={PLANETS_HUB_CTA.eyebrow}
        title={PLANETS_HUB_CTA.title}
        description={PLANETS_HUB_CTA.description}
        buttonLabel={PLANETS_HUB_CTA.buttonLabel}
        to="/generate"
        variant="full"
      />

      <Footer />
      <BottomNav />
    </div>
  )
}
