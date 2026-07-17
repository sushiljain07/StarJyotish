// frontend/src/pages/learn/categories/Dashas.jsx
//
// /learn/dashas — hub page for the Vimshottari Dasha timing system.
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
  DASHAS_HERO,
  WHAT_ARE_DASHAS,
  VIMSHOTTARI_SEQUENCE,
  DASHA_LEVELS,
  FAMOUS_DASHA_EXAMPLES,
  SADE_SATI,
  DASHAS_MYTHS,
  DASHAS_FAQ,
  DASHAS_CTA,
} from '../../../config/dashasHubContent'

function DashaRow({ dasha, index }) {
  return (
    <Reveal delay={index * 40}>
      <div className="flex items-start gap-4 p-4 rounded-xl bg-parchment-card border border-line hover:border-primary/40 transition-colors">
        <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex flex-col items-center justify-center">
          <span className="text-primary-dark font-bold text-sm leading-none">{dasha.years}</span>
          <span className="text-primary-dark text-[9px] font-medium leading-none mt-0.5">yrs</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-ink mb-0.5">{dasha.planet}</h3>
          <p className="text-xs text-ink-faint mb-1.5">{dasha.nakshatra}</p>
          <p className="text-sm text-ink-muted leading-snug">{dasha.quality}</p>
        </div>
      </div>
    </Reveal>
  )
}

export default function DashasGuide() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const { isAuthenticated } = useAuth()
  const scrollProgress = useScrollProgress(80)
  const isHindi = i18n.language?.startsWith('hi')

  const guide = getGuide('dashas')
  const learningPathSteps = getLearningPathSteps('dashas')
  const nextGuide = getNextGuide('dashas')

  return (
    <div className="min-h-screen bg-parchment">
      <Seo
        title="Dashas — Vedic Astrology's Planetary Timing System Explained"
        description="Understand the Vimshottari Dasha system — how planetary time periods work, what each Mahadasha governs, and how Dashas answer the 'when' question in Vedic astrology."
        path="/learn/dashas"
      />
      <SiteHeader scrollProgress={scrollProgress} onCtaClick={() => navigate('/generate')} />

      <Hero
        eyebrow="Knowledge Center"
        breadcrumbItems={[
          { label: 'Home', to: isAuthenticated ? '/home' : '/' },
          { label: 'Learn', to: '/learn' },
          { label: 'Dashas' },
        ]}
        title={DASHAS_HERO.title}
        subtitle={DASHAS_HERO.subtitle}
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
        <a
          href="#vimshottari"
          className="inline-block bg-primary hover:bg-primary-dark text-night font-semibold text-sm px-7 py-3 rounded-full shadow-md hover:shadow-lg transition"
        >
          Explore the Dasha Sequence
        </a>
      </Hero>

      {isHindi && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-primary-light border border-primary/30 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-lg shrink-0">🌐</span>
            <p className="text-sm text-primary-dark leading-relaxed">यह लेख अभी केवल अंग्रेज़ी में उपलब्ध है।</p>
          </div>
        </div>
      )}

      <Section maxWidth="max-w-4xl">
        <LearningPath steps={learningPathSteps} />
      </Section>

      {/* What are Dashas */}
      <Section eyebrow={WHAT_ARE_DASHAS.eyebrow} title={WHAT_ARE_DASHAS.title} maxWidth="max-w-3xl">
        <Reveal className="space-y-4">
          {WHAT_ARE_DASHAS.paragraphs.map((p, i) => (
            <p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>
          ))}
        </Reveal>
        <Callout variant="insight" title={WHAT_ARE_DASHAS.didYouKnow.title}>
          {WHAT_ARE_DASHAS.didYouKnow.body}
        </Callout>
      </Section>

      {/* Vimshottari Sequence */}
      <Section
        id="vimshottari"
        eyebrow={VIMSHOTTARI_SEQUENCE.eyebrow}
        title={VIMSHOTTARI_SEQUENCE.title}
        description={VIMSHOTTARI_SEQUENCE.description}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
          {VIMSHOTTARI_SEQUENCE.dashas.map((dasha, i) => (
            <DashaRow key={dasha.planet} dasha={dasha} index={i} />
          ))}
        </div>
      </Section>

      {/* Three Levels */}
      <Section
        eyebrow={DASHA_LEVELS.eyebrow}
        title={DASHA_LEVELS.title}
        description={DASHA_LEVELS.description}
        className="bg-parchment-card/60"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {DASHA_LEVELS.levels.map((level, i) => (
            <Reveal key={level.name} delay={i * 60}>
              <div className="rounded-2xl border border-line bg-parchment p-6 h-full">
                <h3 className="font-serif font-semibold text-lg text-ink mb-1">{level.name}</h3>
                <p className="text-primary-dark text-xs font-bold tracking-wide uppercase mb-3">{level.duration}</p>
                <p className="text-ink-muted text-sm leading-relaxed">{level.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Dashas in Practice */}
      <Section eyebrow={FAMOUS_DASHA_EXAMPLES.eyebrow} title={FAMOUS_DASHA_EXAMPLES.title} maxWidth="max-w-3xl">
        <Reveal className="space-y-4">
          {FAMOUS_DASHA_EXAMPLES.paragraphs.map((p, i) => (
            <p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>
          ))}
        </Reveal>
      </Section>

      {/* Sade Sati */}
      <Section
        eyebrow={SADE_SATI.eyebrow}
        title={SADE_SATI.title}
        className="bg-night"
        tone="dark"
        maxWidth="max-w-3xl"
      >
        <Reveal className="space-y-4">
          {SADE_SATI.paragraphs.map((p, i) => (
            <p key={i} className="text-ink-onnight text-sm sm:text-base leading-relaxed">{p}</p>
          ))}
        </Reveal>
      </Section>

      {/* Myth vs Reality */}
      <Section eyebrow="Setting the Record Straight" title="Myth vs. reality" maxWidth="max-w-3xl">
        <div className="space-y-6">
          {DASHAS_MYTHS.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <Callout variant="warning" title="Myth">{item.myth}</Callout>
              <Callout variant="tip" title="Reality">{item.reality}</Callout>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section eyebrow="Common Questions" title="Frequently asked questions">
        <FAQ items={DASHAS_FAQ} />
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
        eyebrow={DASHAS_CTA.eyebrow}
        title={DASHAS_CTA.title}
        description={DASHAS_CTA.description}
        buttonLabel={DASHAS_CTA.buttonLabel}
        to="/generate"
        variant="full"
      />

      <Footer />
      <BottomNav />
    </div>
  )
}
