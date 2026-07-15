// frontend/src/pages/learn/paths/NewToVedic.jsx
//
// /learn/paths/new-to-vedic — "New to Vedic Astrology" learning path hub.
//
// A path hub is different from a guide page: instead of teaching one concept
// in depth, it introduces a curated sequence, explains what each step covers,
// and links to the individual guide pages. The reader sees the whole journey
// before committing to step 1.
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
  VEDICS_HERO,
  VEDICS_INTRO,
  VEDICS_STEPS,
  VEDICS_AFTER,
  VEDICS_FAQ,
  VEDICS_CTA,
} from '../../../config/vedicsContent'

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

export default function NewToVedic() {
  const { isAuthenticated } = useAuth()

  return (
    <KnowledgeLayout
      seoTitle="New to Vedic Astrology — Learning Path"
      seoDescription="A five-part path from zero to a working understanding of Vedic astrology — Kundli, Lagna, planets, Moon sign, and the twelve Rashis."
      path="/learn/paths/new-to-vedic"
      eyebrow="Learning Path · 5 parts"
      title={VEDICS_HERO.title}
      subtitle={VEDICS_HERO.subtitle}
      meta={
        <LearningMetadata
          estimatedReadTime={38}
          difficulty="beginner"
          category="Learning Path"
          lastUpdated="2026-07-15"
          variant="dark"
        />
      }
      breadcrumbItems={[
        { label: 'Home',             to: isAuthenticated ? '/home' : '/' },
        { label: 'Knowledge Center', to: '/learn' },
        { label: 'New to Vedic Astrology' },
      ]}
      cta={
        <CTA
          eyebrow={VEDICS_CTA.eyebrow}
          title={VEDICS_CTA.title}
          description={VEDICS_CTA.description}
          buttonLabel={VEDICS_CTA.buttonLabel}
          to="/generate"
          variant="full"
        />
      }
    >

      {/* ── What you will be able to do ───────────────────────────────── */}
      <section className="mt-2" aria-labelledby="intro-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{VEDICS_INTRO.eyebrow}</p>
          <h2 id="intro-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {VEDICS_INTRO.title}
          </h2>
          <ArticleParagraphs paragraphs={VEDICS_INTRO.paragraphs} />
        </Reveal>
        <Callout variant="tip" title="How this path is structured">
          Each guide is self-contained and takes 6–10 minutes to read. They are designed to be read in order — each one builds on the last. By the end of guide 5 you will be able to read the key indicators in your own chart without help.
        </Callout>
      </section>

      {/* ── The 5 steps ───────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="steps-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">The path</p>
          <h2 id="steps-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            Five guides, in order
          </h2>
        </Reveal>
        <div className="space-y-4">
          {VEDICS_STEPS.map((step, i) => (
            <Reveal key={step.num} delay={i * 60}>
              <PathStep step={step} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── After this path ───────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="after-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{VEDICS_AFTER.eyebrow}</p>
          <h2 id="after-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {VEDICS_AFTER.title}
          </h2>
          <ArticleParagraphs paragraphs={VEDICS_AFTER.paragraphs} />
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
        <FAQ items={VEDICS_FAQ} title={null} />
      </section>

      {/* ── Other paths ───────────────────────────────────────────────── */}
      <div className="mt-10">
        <RelatedArticles
          variant="grid"
          title="Other learning paths"
          items={[
            {
              title: 'Understand Your Career Direction',
              href: '/learn/paths/career-direction',
              badge: 'Career',
              meta: '6-part path',
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
