// frontend/src/pages/learn/paths/MarriagePath.jsx
//
// /learn/paths/marriage-compatibility — "Marriage & Compatibility" path hub.
import KnowledgeLayout from '../../../components/knowledge/KnowledgeLayout'
import Callout from '../../../components/knowledge/Callout'
import FAQ from '../../../components/knowledge/FAQ'
import CTA from '../../../components/knowledge/CTA'
import LearningMetadata from '../../../components/knowledge/LearningMetadata'
import RelatedArticles from '../../../components/knowledge/RelatedArticles'
import Reveal from '../../../components/Reveal'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import {
  MARRIAGE_PATH_HERO,
  MARRIAGE_PATH_INTRO,
  MARRIAGE_PATH_STEPS,
  MARRIAGE_PATH_AFTER,
  MARRIAGE_PATH_FAQ,
  MARRIAGE_PATH_CTA,
} from '../../../config/marriagePathContent'

function ArticleParagraphs({ paragraphs }) {
  return (
    <div className="space-y-4">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>
      ))}
    </div>
  )
}

function PathStep({ step }) {
  const isAvailable = Boolean(step.href) && !step.comingSoon
  const inner = (
    <div className="flex gap-5 items-start">
      <div className="shrink-0 w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center text-primary-dark font-bold text-sm font-serif mt-0.5">
        {step.num}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <h3 className={`font-semibold text-sm text-ink leading-snug ${isAvailable ? 'group-hover:text-primary-dark transition' : ''}`}>
            {step.title}
          </h3>
          {step.comingSoon && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-parchment text-ink-faint border border-line">
              Coming soon
            </span>
          )}
          {!step.comingSoon && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sage-light text-sage">
              Available
            </span>
          )}
        </div>
        <p className="text-ink-muted text-sm leading-relaxed mb-2">{step.teaser}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-faint">
          <span>{step.readTime} min read</span>
          {step.outcome && <span className="text-primary-dark font-medium">→ {step.outcome}</span>}
        </div>
      </div>
    </div>
  )

  if (isAvailable) {
    return (
      <Link to={step.href} className="group block bg-parchment-card border border-line hover:border-primary/30 hover:shadow-md rounded-2xl p-6 transition">
        {inner}
      </Link>
    )
  }
  return (
    <div className="bg-parchment-card border border-line rounded-2xl p-6 opacity-70">
      {inner}
    </div>
  )
}

export default function MarriagePath() {
  const { isAuthenticated } = useAuth()

  return (
    <KnowledgeLayout
      seoTitle="Marriage & Compatibility in Vedic Astrology — Learning Path"
      seoDescription="A seven-part path through Vedic astrology's approach to marriage — 7th house, Guna Milan, Mangal Dosha, D9 Navamsa, and compatibility between charts."
      path="/learn/paths/marriage-compatibility"
      eyebrow="Learning Path · 7 parts"
      title={MARRIAGE_PATH_HERO.title}
      subtitle={MARRIAGE_PATH_HERO.subtitle}
      meta={
        <LearningMetadata
          estimatedReadTime={56}
          difficulty="intermediate"
          category="Learning Path"
          lastUpdated="2026-07-15"
          variant="dark"
        />
      }
      breadcrumbItems={[
        { label: 'Home',             to: isAuthenticated ? '/home' : '/' },
        { label: 'Knowledge Center', to: '/learn' },
        { label: 'Marriage & Compatibility' },
      ]}
      cta={
        <CTA
          eyebrow={MARRIAGE_PATH_CTA.eyebrow}
          title={MARRIAGE_PATH_CTA.title}
          description={MARRIAGE_PATH_CTA.description}
          buttonLabel={MARRIAGE_PATH_CTA.buttonLabel}
          to="/generate"
          variant="full"
        />
      }
    >

      {/* ── What Vedic astrology says about marriage ──────────────────── */}
      <section className="mt-2" aria-labelledby="intro-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{MARRIAGE_PATH_INTRO.eyebrow}</p>
          <h2 id="intro-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {MARRIAGE_PATH_INTRO.title}
          </h2>
          <ArticleParagraphs paragraphs={MARRIAGE_PATH_INTRO.paragraphs} />
        </Reveal>
        <Callout variant="warning" title="A note on fear-based readings">
          Much of what circulates about Mangal Dosha and low Guna Milan scores is exaggerated or misapplied. This path treats those topics with the rigor they deserve — explaining both what the indicators actually mean and what they do not justify concluding.
        </Callout>
      </section>

      {/* ── The 7 steps ───────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="steps-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">The path</p>
          <h2 id="steps-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            Seven guides, in order
          </h2>
        </Reveal>
        <div className="space-y-4">
          {MARRIAGE_PATH_STEPS.map((step, i) => (
            <Reveal key={step.num} delay={i * 60}>
              <PathStep step={step} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── After this path ───────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="after-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{MARRIAGE_PATH_AFTER.eyebrow}</p>
          <h2 id="after-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {MARRIAGE_PATH_AFTER.title}
          </h2>
          <ArticleParagraphs paragraphs={MARRIAGE_PATH_AFTER.paragraphs} />
        </Reveal>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="faq-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">Common Questions</p>
          <h2 id="faq-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            Frequently asked questions
          </h2>
        </Reveal>
        <FAQ items={MARRIAGE_PATH_FAQ} title={null} />
      </section>

      {/* ── Other paths ───────────────────────────────────────────────── */}
      <div className="mt-10">
        <RelatedArticles
          variant="grid"
          title="Other learning paths"
          items={[
            {
              title: 'New to Vedic Astrology',
              href: '/learn/paths/new-to-vedic',
              badge: 'Beginner',
              meta: '5-part path',
            },
            {
              title: 'Understand Your Career Direction',
              href: '/learn/paths/career-direction',
              badge: 'Career',
              meta: '6-part path',
            },
          ]}
        />
      </div>

    </KnowledgeLayout>
  )
}
