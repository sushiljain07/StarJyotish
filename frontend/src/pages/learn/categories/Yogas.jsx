// frontend/src/pages/learn/categories/Yogas.jsx
//
// /learn/yogas — hub page for planetary combinations.
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
  YOGAS_HERO,
  WHAT_ARE_YOGAS,
  MAJOR_YOGAS,
  HOW_TO_SPOT_YOGAS,
  YOGAS_MYTHS,
  YOGAS_FAQ,
  YOGAS_CTA,
} from '../../../config/yogasContent'

function YogaCard({ yoga }) {
  const typeColor = yoga.type === 'Auspicious' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : yoga.type === 'Challenging' ? 'bg-red-50 text-red-700 border-red-200'
    : 'bg-amber-50 text-amber-700 border-amber-200'

  return (
    <div className="bg-parchment-card border border-line rounded-2xl p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="font-serif font-semibold text-xl text-ink">{yoga.name}</h3>
        <span className={`shrink-0 text-[10px] font-bold tracking-wide uppercase px-2 py-1 rounded-full border ${typeColor}`}>
          {yoga.type}
        </span>
      </div>
      <dl className="space-y-4">
        <div>
          <dt className="text-[11px] font-bold text-ink-faint tracking-widest uppercase mb-1">Formation</dt>
          <dd className="text-sm text-ink-muted leading-relaxed">{yoga.formation}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold text-ink-faint tracking-widest uppercase mb-1">Effect</dt>
          <dd className="text-sm text-ink leading-relaxed">{yoga.effect}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold text-ink-faint tracking-widest uppercase mb-1">Example</dt>
          <dd className="text-sm text-ink-muted leading-relaxed italic">{yoga.example}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold text-ink-faint tracking-widest uppercase mb-1">Important note</dt>
          <dd className="text-sm text-ink-muted leading-relaxed">{yoga.notes}</dd>
        </div>
      </dl>
    </div>
  )
}

export default function YogasGuide() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const { isAuthenticated } = useAuth()
  const scrollProgress = useScrollProgress(80)
  const isHindi = i18n.language?.startsWith('hi')

  const guide = getGuide('yogas')
  const learningPathSteps = getLearningPathSteps('yogas')

  return (
    <div className="min-h-screen bg-parchment">
      <Seo
        title="Yogas in Vedic Astrology — Planetary Combinations Explained"
        description="What Vedic astrology Yogas are, how to identify Raj Yoga, Gaja Kesari, Dhana Yoga, and other key combinations in your birth chart — and what they actually mean."
        path="/learn/yogas"
      />
      <SiteHeader scrollProgress={scrollProgress} onCtaClick={() => navigate('/generate')} />

      <Hero
        eyebrow="Knowledge Center"
        breadcrumbItems={[
          { label: 'Home', to: isAuthenticated ? '/home' : '/' },
          { label: 'Learn', to: '/learn' },
          { label: 'Yogas' },
        ]}
        title={YOGAS_HERO.title}
        subtitle={YOGAS_HERO.subtitle}
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
          href="#yogas"
          className="inline-block bg-primary hover:bg-primary-dark text-night font-semibold text-sm px-7 py-3 rounded-full shadow-md hover:shadow-lg transition"
        >
          Explore Key Yogas
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

      {/* What are Yogas */}
      <Section eyebrow={WHAT_ARE_YOGAS.eyebrow} title={WHAT_ARE_YOGAS.title} maxWidth="max-w-3xl">
        <Reveal className="space-y-4">
          {WHAT_ARE_YOGAS.paragraphs.map((p, i) => (
            <p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>
          ))}
        </Reveal>
        <Callout variant="insight" title={WHAT_ARE_YOGAS.didYouKnow.title}>
          {WHAT_ARE_YOGAS.didYouKnow.body}
        </Callout>
      </Section>

      {/* Major Yogas */}
      <Section
        id="yogas"
        eyebrow="Key Combinations"
        title="Major Yogas in Vedic astrology"
        description="These are the most widely recognized and classically well-defined Yogas — the ones with the most consistent interpretation across schools."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {MAJOR_YOGAS.map((yoga, i) => (
            <Reveal key={yoga.name} delay={(i % 2) * 60}>
              <YogaCard yoga={yoga} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* How to spot Yogas */}
      <Section
        eyebrow={HOW_TO_SPOT_YOGAS.eyebrow}
        title={HOW_TO_SPOT_YOGAS.title}
        className="bg-night"
        tone="dark"
        maxWidth="max-w-3xl"
      >
        <Reveal className="space-y-4">
          {HOW_TO_SPOT_YOGAS.paragraphs.map((p, i) => (
            <p key={i} className="text-ink-onnight text-sm sm:text-base leading-relaxed">{p}</p>
          ))}
        </Reveal>
      </Section>

      {/* Myth vs Reality */}
      <Section eyebrow="Setting the Record Straight" title="Myth vs. reality" maxWidth="max-w-3xl">
        <div className="space-y-6">
          {YOGAS_MYTHS.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <Callout variant="warning" title="Myth">{item.myth}</Callout>
              <Callout variant="tip" title="Reality">{item.reality}</Callout>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section eyebrow="Common Questions" title="Frequently asked questions">
        <FAQ items={YOGAS_FAQ} />
      </Section>

      <CTA
        eyebrow={YOGAS_CTA.eyebrow}
        title={YOGAS_CTA.title}
        description={YOGAS_CTA.description}
        buttonLabel={YOGAS_CTA.buttonLabel}
        to="/generate"
        variant="full"
      />

      <Footer />
      <BottomNav />
    </div>
  )
}
