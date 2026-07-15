// frontend/src/pages/learn/paths/CareerPath.jsx
//
// /learn/paths/career-direction — "Understand Your Career Direction" path hub.
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
  CAREER_PATH_HERO,
  CAREER_PATH_INTRO,
  CAREER_PATH_STEPS,
  CAREER_PATH_AFTER,
  CAREER_PATH_FAQ,
  CAREER_PATH_CTA,
} from '../../../config/careerPathContent'

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

export default function CareerPath() {
  const { isAuthenticated } = useAuth()

  return (
    <KnowledgeLayout
      seoTitle="Understand Your Career Direction — Vedic Astrology Learning Path"
      seoDescription="A six-part path through the Vedic astrology of work — 10th house, D10 Dashamsha, Saturn, Sun, Dashas, and Rajyogas."
      path="/learn/paths/career-direction"
      eyebrow="Learning Path · 6 parts"
      title={CAREER_PATH_HERO.title}
      subtitle={CAREER_PATH_HERO.subtitle}
      meta={
        <LearningMetadata
          estimatedReadTime={47}
          difficulty="intermediate"
          category="Learning Path"
          lastUpdated="2026-07-15"
          variant="dark"
        />
      }
      breadcrumbItems={[
        { label: 'Home',             to: isAuthenticated ? '/home' : '/' },
        { label: 'Knowledge Center', to: '/learn' },
        { label: 'Career Direction' },
      ]}
      cta={
        <CTA
          eyebrow={CAREER_PATH_CTA.eyebrow}
          title={CAREER_PATH_CTA.title}
          description={CAREER_PATH_CTA.description}
          buttonLabel={CAREER_PATH_CTA.buttonLabel}
          to="/career-report"
          variant="full"
        />
      }
    >

      {/* ── What Vedic astrology says about career ────────────────────── */}
      <section className="mt-2" aria-labelledby="intro-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{CAREER_PATH_INTRO.eyebrow}</p>
          <h2 id="intro-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {CAREER_PATH_INTRO.title}
          </h2>
          <ArticleParagraphs paragraphs={CAREER_PATH_INTRO.paragraphs} />
        </Reveal>
        <Callout variant="note" title="Star Jyotish Career Report">
          Star Jyotish provides a dedicated Career Report that analyses your 10th house, D10 Dashamsha, current Dasha, and active Rajyogas automatically. This path teaches you to read those same indicators yourself — so the report becomes a reference point rather than a black box.
        </Callout>
      </section>

      {/* ── The 6 steps ───────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="steps-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">The path</p>
          <h2 id="steps-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            Six guides, in order
          </h2>
        </Reveal>
        <div className="space-y-4">
          {CAREER_PATH_STEPS.map((step, i) => (
            <Reveal key={step.num} delay={i * 60}>
              <PathStep step={step} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── After this path ───────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="after-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{CAREER_PATH_AFTER.eyebrow}</p>
          <h2 id="after-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {CAREER_PATH_AFTER.title}
          </h2>
          <ArticleParagraphs paragraphs={CAREER_PATH_AFTER.paragraphs} />
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
        <FAQ items={CAREER_PATH_FAQ} title={null} />
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
              title: 'Marriage & Compatibility',
              href: '/learn/paths/marriage-compatibility',
              badge: 'Relationships',
              meta: '7-part path',
            },
          ]}
        />
      </div>

    </KnowledgeLayout>
  )
}
