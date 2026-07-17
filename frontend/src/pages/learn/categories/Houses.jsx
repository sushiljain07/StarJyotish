// frontend/src/pages/learn/categories/Houses.jsx
//
// /learn/houses — hub page for the 12 Bhavas.
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
  HOUSES_HERO,
  WHAT_ARE_HOUSES,
  HOUSES,
  HOUSE_GROUPS,
  HOUSES_MYTHS,
  HOUSES_FAQ,
  HOUSES_CTA,
} from '../../../config/housesContent'

function HouseCard({ house }) {
  return (
    <div className="bg-parchment-card border border-line rounded-2xl p-5 hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary-dark font-bold text-sm shrink-0">
          {house.number}
        </span>
        <div>
          <p className="font-semibold text-sm text-ink leading-tight">{house.name}</p>
          <p className="text-xs text-ink-faint">{house.sanskrit}</p>
        </div>
      </div>
      <p className="text-[11px] font-semibold text-primary-dark tracking-wide uppercase mb-2">{house.keywords}</p>
      <p className="text-sm text-ink-muted leading-relaxed">{house.description}</p>
    </div>
  )
}

export default function HousesGuide() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const { isAuthenticated } = useAuth()
  const scrollProgress = useScrollProgress(80)
  const isHindi = i18n.language?.startsWith('hi')

  const guide = getGuide('houses')
  const learningPathSteps = getLearningPathSteps('houses')
  const nextGuide = getNextGuide('houses')

  return (
    <div className="min-h-screen bg-parchment">
      <Seo
        title="The 12 Houses (Bhavas) in Vedic Astrology — A Complete Guide"
        description="Understand the 12 houses of the Vedic birth chart — what each house governs, how to identify house strength, and why the houses are where astrology gets personal."
        path="/learn/houses"
      />
      <SiteHeader scrollProgress={scrollProgress} onCtaClick={() => navigate('/generate')} />

      <Hero
        eyebrow="Knowledge Center"
        breadcrumbItems={[
          { label: 'Home', to: isAuthenticated ? '/home' : '/' },
          { label: 'Learn', to: '/learn' },
          { label: 'Houses' },
        ]}
        title={HOUSES_HERO.title}
        subtitle={HOUSES_HERO.subtitle}
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
          href="#houses"
          className="inline-block bg-primary hover:bg-primary-dark text-night font-semibold text-sm px-7 py-3 rounded-full shadow-md hover:shadow-lg transition"
        >
          Explore the 12 Houses
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

      {/* What are Houses */}
      <Section eyebrow={WHAT_ARE_HOUSES.eyebrow} title={WHAT_ARE_HOUSES.title} maxWidth="max-w-3xl">
        <Reveal className="space-y-4">
          {WHAT_ARE_HOUSES.paragraphs.map((p, i) => (
            <p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>
          ))}
        </Reveal>
        <Callout variant="insight" title={WHAT_ARE_HOUSES.didYouKnow.title}>
          {WHAT_ARE_HOUSES.didYouKnow.body}
        </Callout>
      </Section>

      {/* The 12 Houses */}
      <Section
        id="houses"
        eyebrow="The 12 Bhavas"
        title="The twelve houses, one by one"
        description="Each house governs a distinct domain of life. Your Ascendant sign occupies the 1st house, with each subsequent sign filling the next house in order."
        align="center"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HOUSES.map((house, i) => (
            <Reveal key={house.number} delay={(i % 3) * 50}>
              <HouseCard house={house} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* House Classification */}
      <Section
        eyebrow={HOUSE_GROUPS.eyebrow}
        title={HOUSE_GROUPS.title}
        description={HOUSE_GROUPS.description}
        className="bg-night"
        tone="dark"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {HOUSE_GROUPS.groups.map((group, i) => (
            <Reveal key={group.name} delay={i * 60}>
              <div className="bg-white/5 rounded-2xl p-6 h-full">
                <h3 className="font-serif font-semibold text-primary-light mb-1">{group.name}</h3>
                <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">Houses {group.houses}</p>
                <p className="text-ink-onnight text-sm leading-relaxed">{group.quality}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Myth vs Reality */}
      <Section eyebrow="Setting the Record Straight" title="Myth vs. reality" maxWidth="max-w-3xl">
        <div className="space-y-6">
          {HOUSES_MYTHS.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <Callout variant="warning" title="Myth">{item.myth}</Callout>
              <Callout variant="tip" title="Reality">{item.reality}</Callout>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section eyebrow="Common Questions" title="Frequently asked questions">
        <FAQ items={HOUSES_FAQ} />
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
        eyebrow={HOUSES_CTA.eyebrow}
        title={HOUSES_CTA.title}
        description={HOUSES_CTA.description}
        buttonLabel={HOUSES_CTA.buttonLabel}
        to="/generate"
        variant="full"
      />

      <Footer />
      <BottomNav />
    </div>
  )
}
