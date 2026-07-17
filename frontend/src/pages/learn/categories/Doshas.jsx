// frontend/src/pages/learn/categories/Doshas.jsx
//
// /learn/doshas — hub page for chart afflictions.
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
import { getGuide, getLearningPathSteps } from '../../../config/knowledgeGraph'
import { getCategoryLabel } from '../../../config/learningTaxonomy'
import {
  DOSHAS_HERO,
  WHAT_ARE_DOSHAS,
  MAJOR_DOSHAS,
  REMEDIES_SECTION,
  DOSHAS_MYTHS,
  DOSHAS_FAQ,
  DOSHAS_CTA,
} from '../../../config/doshasContent'

function DoshaCard({ dosha }) {
  return (
    <div className="bg-parchment-card border border-line rounded-2xl p-6">
      <h3 className="font-serif font-semibold text-xl text-ink mb-1">{dosha.name}</h3>
      <p className="text-xs text-ink-faint font-medium mb-4">{dosha.altName}</p>
      <dl className="space-y-4">
        <div>
          <dt className="text-[11px] font-bold text-ink-faint tracking-widest uppercase mb-1">Formation</dt>
          <dd className="text-sm text-ink-muted leading-relaxed">{dosha.formation}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold text-ink-faint tracking-widest uppercase mb-1">Traditional effects</dt>
          <dd className="text-sm text-ink leading-relaxed">{dosha.effects}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold text-ink-faint tracking-widest uppercase mb-2">Cancellations (Bhanga)</dt>
          <dd>
            <ul className="space-y-1.5">
              {dosha.cancellations.map((c, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink-muted leading-snug">
                  <span className="text-primary shrink-0 mt-0.5">✓</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div className="pt-3 border-t border-line">
          <dt className="text-[11px] font-bold text-primary-dark tracking-widest uppercase mb-1">What popular accounts miss</dt>
          <dd className="text-sm text-ink-muted leading-relaxed italic">{dosha.overstatement}</dd>
        </div>
      </dl>
    </div>
  )
}

export default function DoshasGuide() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const { isAuthenticated } = useAuth()
  const scrollProgress = useScrollProgress(80)
  const isHindi = i18n.language?.startsWith('hi')

  const guide = getGuide('doshas')
  const learningPathSteps = getLearningPathSteps('doshas')

  return (
    <div className="min-h-screen bg-parchment">
      <Seo
        title="Doshas in Vedic Astrology — Chart Afflictions Explained Clearly"
        description="What Mangal Dosha, Kaal Sarp Dosha, Sade Sati, and other chart afflictions actually mean — including what classical texts say, what cancellations exist, and what popular accounts get wrong."
        path="/learn/doshas"
      />
      <SiteHeader scrollProgress={scrollProgress} onCtaClick={() => navigate('/generate')} />

      <Hero
        eyebrow="Knowledge Center"
        breadcrumbItems={[
          { label: 'Home', to: isAuthenticated ? '/home' : '/' },
          { label: 'Learn', to: '/learn' },
          { label: 'Doshas' },
        ]}
        title={DOSHAS_HERO.title}
        subtitle={DOSHAS_HERO.subtitle}
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
          href="#doshas"
          className="inline-block bg-primary hover:bg-primary-dark text-night font-semibold text-sm px-7 py-3 rounded-full shadow-md hover:shadow-lg transition"
        >
          Understand the Major Doshas
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

      {learningPathSteps && learningPathSteps.length > 0 && (
        <Section maxWidth="max-w-4xl">
          <LearningPath steps={learningPathSteps} />
        </Section>
      )}

      {/* What are Doshas */}
      <Section eyebrow={WHAT_ARE_DOSHAS.eyebrow} title={WHAT_ARE_DOSHAS.title} maxWidth="max-w-3xl">
        <Reveal className="space-y-4">
          {WHAT_ARE_DOSHAS.paragraphs.map((p, i) => (
            <p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>
          ))}
        </Reveal>
        <Callout variant="insight" title={WHAT_ARE_DOSHAS.didYouKnow.title}>
          {WHAT_ARE_DOSHAS.didYouKnow.body}
        </Callout>
      </Section>

      {/* Major Doshas */}
      <Section
        id="doshas"
        eyebrow="The Major Afflictions"
        title="Understanding the key Doshas"
        description="Each Dosha has a specific definition, a range of possible effects, and — critically — specific conditions under which its influence is cancelled or significantly reduced."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {MAJOR_DOSHAS.map((dosha, i) => (
            <Reveal key={dosha.name} delay={(i % 2) * 60}>
              <DoshaCard dosha={dosha} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Remedies */}
      <Section
        eyebrow={REMEDIES_SECTION.eyebrow}
        title={REMEDIES_SECTION.title}
        className="bg-night"
        tone="dark"
        maxWidth="max-w-3xl"
      >
        <Reveal className="space-y-4">
          {REMEDIES_SECTION.paragraphs.map((p, i) => (
            <p key={i} className="text-ink-onnight text-sm sm:text-base leading-relaxed">{p}</p>
          ))}
        </Reveal>
      </Section>

      {/* Myth vs Reality */}
      <Section eyebrow="Setting the Record Straight" title="Myth vs. reality" maxWidth="max-w-3xl">
        <div className="space-y-6">
          {DOSHAS_MYTHS.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <Callout variant="warning" title="Myth">{item.myth}</Callout>
              <Callout variant="tip" title="Reality">{item.reality}</Callout>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section eyebrow="Common Questions" title="Frequently asked questions">
        <FAQ items={DOSHAS_FAQ} />
      </Section>

      <CTA
        eyebrow={DOSHAS_CTA.eyebrow}
        title={DOSHAS_CTA.title}
        description={DOSHAS_CTA.description}
        buttonLabel={DOSHAS_CTA.buttonLabel}
        to="/generate"
        variant="full"
      />

      <Footer />
      <BottomNav />
    </div>
  )
}
