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
import CompactFooter from '../components/CompactFooter'
import BottomNav from '../components/home/BottomNav'
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
  const { isAuthenticated } = useAuth()
  const scrollProgress = useScrollProgress(80)
  const { t } = useTranslation()

  return (
    <div className="min-h-dvh bg-parchment">
      <Seo
        title="Knowledge Center"
        description="A calm, practical guide to Vedic astrology — Zodiac signs, Nakshatras, planets, houses, dashas, yogas, and doshas, explained clearly."
        path="/learn"
      />
      <SiteHeader scrollProgress={scrollProgress} onCtaClick={() => navigate('/generate')} />

      <main id="main">
      <Hero
        eyebrow={t('footer_link_knowledge_center')}
        title={t('learn_title')}
        subtitle={t('learn_subtitle')}
        // The hub itself had no Home affordance beyond SiteHeader's small
        // logo click — every page one level deeper (Zodiac, Aries) already
        // has this exact breadcrumb, so the hub was the one gap in an
        // otherwise-consistent pattern rather than needing a different one.
        // Two items, not one: Breadcrumb.jsx always renders the LAST item
        // as plain (non-link) "current page" text, so a single-item
        // ["Home"] array would render Home as unclickable text, not a link.
        breadcrumbItems={[
          { label: t('learn_breadcrumb_home'), to: isAuthenticated ? '/home' : '/' },
          { label: t('footer_link_knowledge_center') },
        ]}
      />

      {/* Language notice — Knowledge Center articles exist in English only.
          The locale value is empty where no notice is needed. */}
      {t('learn_english_only_notice') && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-primary-light border border-primary/30 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-lg shrink-0">🌐</span>
            <p className="text-sm text-primary-dark leading-relaxed">{t('learn_english_only_notice')}</p>
          </div>
        </div>
      )}

      {/* Featured Learning Paths */}
      <Section
        eyebrow={t('learn_paths_eyebrow')}
        title={t('learn_paths_title')}
        description={t('learn_paths_desc')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LEARNING_PATHS.map((path, i) => (
            <Reveal key={path.title} delay={i * 60}>
              <ArticleCard
                title={path.title}
                description={path.description}
                meta={path.meta}
                href={path.href}
                comingSoon={path.comingSoon}
              />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Beginner Guides */}
      <Section
        id="beginner-guides"
        eyebrow={t('learn_beginner_eyebrow')}
        title={t('learn_beginner_title')}
        description={t('learn_beginner_desc')}
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
        eyebrow={t('learn_browse_eyebrow')}
        title={t('learn_browse_title')}
        description={t('learn_browse_desc')}
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
        eyebrow={t('learn_featured_eyebrow')}
        title={t('learn_featured_title')}
        description={t('learn_featured_desc')}
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
        eyebrow={t('learn_why_eyebrow')}
        title={t('learn_why_title')}
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
        eyebrow={t('learn_cta_eyebrow')}
        title={t('learn_cta_title')}
        description={t('learn_cta_desc')}
        buttonLabel={t('learn_cta_button')}
        to="/generate"
        variant="full"
      />

      </main>

      <CompactFooter />
      <BottomNav />
    </div>
  )
}
