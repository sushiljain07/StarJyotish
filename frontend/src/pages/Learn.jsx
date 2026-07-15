// frontend/src/pages/Learn.jsx
//
// Entry point for the Knowledge Center. This is a hub/landing page, not a
// guide — it introduces the section and routes readers into individual
// guides once those exist (see config/learnContent.js for why every card
// below is currently `comingSoon`). Every section is built from the
// reusable components/knowledge/* pieces; nothing here is guide-specific
// markup, so this file should stay short even as the Knowledge Center
// grows.
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import Reveal from '../components/Reveal'
import { useScrollProgress } from '../hooks/useScrollProgress'
import Hero from '../components/knowledge/Hero'
import Section from '../components/knowledge/Section'
import ArticleCard from '../components/knowledge/ArticleCard'
import CategoryIcon from '../components/knowledge/CategoryIcon'
import CTA from '../components/knowledge/CTA'
import {
  LEARNING_PATHS,
  BEGINNER_GUIDES,
  CATEGORIES,
  FEATURED_GUIDES,
  WHY_LEARN_POINTS,
} from '../config/learnContent'

export default function Learn() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const { isAuthenticated } = useAuth()
  const scrollProgress = useScrollProgress(80)
  const isHindi = i18n.language?.startsWith('hi')

  return (
    <div className="min-h-screen bg-parchment">
      <Seo
        title="Knowledge Center"
        description="A calm, practical guide to Vedic astrology — Zodiac signs, Nakshatras, planets, houses, dashas, yogas, and doshas, explained clearly."
        path="/learn"
      />
      <SiteHeader scrollProgress={scrollProgress} onCtaClick={() => navigate('/generate')} />

      <Hero
        eyebrow="Knowledge Center"
        title="Understand your chart, one idea at a time"
        subtitle="A calm, practical library for learning Vedic astrology — grounded in classical teaching, written for people who don't already know the terminology."
        // The hub itself had no Home affordance beyond SiteHeader's small
        // logo click — every page one level deeper (Zodiac, Aries) already
        // has this exact breadcrumb, so the hub was the one gap in an
        // otherwise-consistent pattern rather than needing a different one.
        // Two items, not one: Breadcrumb.jsx always renders the LAST item
        // as plain (non-link) "current page" text, so a single-item
        // ["Home"] array would render Home as unclickable text, not a link.
        breadcrumbItems={[
          { label: 'Home', to: isAuthenticated ? '/home' : '/' },
          { label: 'Knowledge Center' },
        ]}
      />

      {/* Hindi language notice — Knowledge Center content is currently
          English-only; show a banner so Hindi users know this upfront
          rather than discovering it mid-article. */}
      {isHindi && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-primary-light border border-primary/30 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-lg shrink-0">🌐</span>
            <p className="text-sm text-primary-dark leading-relaxed">
              ज्ञान केंद्र की सामग्री अभी केवल अंग्रेज़ी में उपलब्ध है।
              हिंदी अनुवाद जल्द आएगा।{' '}
              <span className="font-medium">(Knowledge Center is currently available in English only. Hindi translation coming soon.)</span>
            </p>
          </div>
        </div>
      )}

      {/* Featured Learning Paths */}
      <Section
        eyebrow="Start here"
        title="Featured learning paths"
        description="Curated sequences that take you from a single concept to a full working understanding — in order, at your own pace."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LEARNING_PATHS.map((path, i) => (
            <Reveal key={path.title} delay={i * 60}>
              <ArticleCard
                title={path.title}
                description={path.description}
                meta={path.meta}
                comingSoon={path.comingSoon}
              />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Beginner Guides */}
      <Section
        id="beginner-guides"
        eyebrow="First steps"
        title="Beginner guides"
        description="Never read a birth chart before? These four guides cover everything you need before the rest of the Knowledge Center will make sense."
        className="bg-parchment-card/60"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BEGINNER_GUIDES.map((guide, i) => (
            <Reveal key={guide.title} delay={i * 60}>
              <ArticleCard
                title={guide.title}
                description={guide.description}
                meta={guide.meta}
                badge={guide.badge}
                href={guide.href}
                comingSoon={guide.comingSoon}
              />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Explore by Category */}
      <Section
        eyebrow="Browse"
        title="Explore by category"
        description="Every guide in the Knowledge Center falls into one of these areas. Start wherever is most relevant to your chart right now."
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 40}>
              <ArticleCard
                title={cat.title}
                description={cat.description}
                meta={cat.meta}
                href={cat.href}
                comingSoon={cat.comingSoon}
                icon={<CategoryIcon id={cat.id} className="w-6 h-6" />}
              />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Featured Guides */}
      <Section
        eyebrow="Handpicked"
        title="Featured guides"
        description="A few guides worth reading regardless of where you are in your chart — commonly misunderstood ideas, explained clearly."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURED_GUIDES.map((guide, i) => (
            <Reveal key={guide.title} delay={i * 60}>
              <ArticleCard
                title={guide.title}
                description={guide.description}
                meta={guide.meta}
                badge={guide.badge}
                comingSoon={guide.comingSoon}
              />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Why Learn Vedic Astrology */}
      <Section
        eyebrow="Why it's worth learning"
        title="Why learn Vedic astrology"
        align="center"
        tone="dark"
        className="bg-night"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {WHY_LEARN_POINTS.map((point, i) => (
            <Reveal key={point.title} delay={i * 60} className="text-left">
              <h3 className="font-semibold text-sm text-primary-light mb-2">{point.title}</h3>
              <p className="text-ink-onnight text-sm leading-relaxed">{point.description}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Call To Action */}
      <CTA
        eyebrow="Star Jyotish"
        title="Ready to see this in your own chart?"
        description="Everything in the Knowledge Center becomes personal once you generate your free Kundli."
        buttonLabel="Generate My Free Kundli →"
        to="/generate"
        variant="full"
      />

      <Footer />
    </div>
  )
}
