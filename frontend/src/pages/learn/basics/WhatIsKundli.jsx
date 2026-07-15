// frontend/src/pages/learn/basics/WhatIsKundli.jsx
//
// /learn/basics/what-is-kundli — Part 1 of the Basics Series.
//
// Architecture mirrors Aries.jsx exactly:
//   — Mounts into KnowledgeLayout (handles SiteHeader, ReadingProgress,
//     breadcrumbs, Footer, SEO).
//   — All copy lives in config/kundliContent.js — this file only composes.
//   — Uses the same component vocabulary: Callout, QuickFacts, FAQ,
//     RelatedArticles, Reflection, Reveal.
import KnowledgeLayout from '../../../components/knowledge/KnowledgeLayout'
import LearningMetadata from '../../../components/knowledge/LearningMetadata'
import Callout from '../../../components/knowledge/Callout'
import QuickFacts from '../../../components/knowledge/QuickFacts'
import FAQ from '../../../components/knowledge/FAQ'
import RelatedArticles from '../../../components/knowledge/RelatedArticles'
import Reflection from '../../../components/knowledge/Reflection'
import Reveal from '../../../components/Reveal'
import { useAuth } from '../../../contexts/AuthContext'
import {
  KUNDLI_HERO,
  KUNDLI_QUICK_FACTS,
  SKY_AS_CLOCK,
  CHART_FORMATS,
  TWELVE_HOUSES,
  WHY_DIFFERENT,
  WHAT_KUNDLI_CANNOT_TELL,
  KUNDLI_FAQ,
} from '../../../config/kundliContent'

function ArticleParagraphs({ paragraphs }) {
  return (
    <div className="space-y-4">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>
      ))}
    </div>
  )
}

export default function WhatIsKundli() {
  const { isAuthenticated } = useAuth()

  return (
    <KnowledgeLayout
      seoTitle="What Is a Kundli, Really? — Knowledge Center"
      seoDescription="A birth chart is a snapshot of the sky at the moment you were born — here is what that snapshot actually encodes, and how to start reading it."
      path="/learn/basics/what-is-kundli"
      eyebrow="Basics Series · Part 1 of 4"
      title={KUNDLI_HERO.title}
      subtitle={KUNDLI_HERO.subtitle}
      meta={<LearningMetadata estimatedReadTime={6} difficulty="beginner" category="Basics" lastUpdated="2026-07-15" />}
      breadcrumbItems={[
        { label: 'Home', to: isAuthenticated ? '/home' : '/' },
        { label: 'Knowledge Center', to: '/learn' },
        { label: 'What Is a Kundli, Really?' },
      ]}
    >
      <QuickFacts facts={KUNDLI_QUICK_FACTS} columns={2} />

      {/* ── The sky as a clock ─────────────────────────────────────────── */}
      <section className="mt-10" aria-labelledby="sky-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{SKY_AS_CLOCK.eyebrow}</p>
          <h2 id="sky-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {SKY_AS_CLOCK.title}
          </h2>
          <ArticleParagraphs paragraphs={SKY_AS_CLOCK.paragraphs} />
        </Reveal>
        <Callout variant={SKY_AS_CLOCK.callout.variant} title={SKY_AS_CLOCK.callout.title}>
          {SKY_AS_CLOCK.callout.body}
        </Callout>
      </section>

      {/* ── Chart formats ──────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="formats-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{CHART_FORMATS.eyebrow}</p>
          <h2 id="formats-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {CHART_FORMATS.title}
          </h2>
          <ArticleParagraphs paragraphs={CHART_FORMATS.paragraphs} />
        </Reveal>
      </section>

      {/* ── The twelve houses ──────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="houses-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{TWELVE_HOUSES.eyebrow}</p>
          <h2 id="houses-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {TWELVE_HOUSES.title}
          </h2>
          <p className="text-ink text-sm sm:text-base leading-relaxed mb-6">{TWELVE_HOUSES.intro}</p>
        </Reveal>
        <Reveal className="bg-parchment-card border border-line rounded-2xl overflow-hidden">
          <dl>
            {TWELVE_HOUSES.houses.map((h, i) => (
              <div key={h.num} className={`flex items-start gap-4 px-5 py-3.5 ${i < TWELVE_HOUSES.houses.length - 1 ? 'border-b border-line' : ''}`}>
                <dt className="shrink-0 w-6 h-6 rounded-md bg-primary-light flex items-center justify-center text-xs font-bold text-primary-dark mt-0.5">
                  {h.num}
                </dt>
                <div className="flex flex-col sm:flex-row sm:gap-4 flex-1">
                  <span className="text-sm font-semibold text-ink w-32 shrink-0">{h.name}</span>
                  <span className="text-sm text-ink-muted leading-relaxed">{h.governs}</span>
                </div>
              </div>
            ))}
          </dl>
        </Reveal>
        <Callout variant={TWELVE_HOUSES.callout.variant} title={TWELVE_HOUSES.callout.title}>
          {TWELVE_HOUSES.callout.body}
        </Callout>
      </section>

      {/* ── Why different ──────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="different-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{WHY_DIFFERENT.eyebrow}</p>
          <h2 id="different-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {WHY_DIFFERENT.title}
          </h2>
          <ArticleParagraphs paragraphs={WHY_DIFFERENT.paragraphs} />
        </Reveal>
        <Callout variant={WHY_DIFFERENT.callout.variant} title={WHY_DIFFERENT.callout.title}>
          {WHY_DIFFERENT.callout.body}
        </Callout>
      </section>

      {/* ── What it cannot tell you ────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="limits-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{WHAT_KUNDLI_CANNOT_TELL.eyebrow}</p>
          <h2 id="limits-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {WHAT_KUNDLI_CANNOT_TELL.title}
          </h2>
          <ArticleParagraphs paragraphs={WHAT_KUNDLI_CANNOT_TELL.paragraphs} />
        </Reveal>
        <Reflection>{WHAT_KUNDLI_CANNOT_TELL.reflection}</Reflection>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="faq-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">Common Questions</p>
          <h2 id="faq-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            Frequently asked questions
          </h2>
        </Reveal>
        <FAQ items={KUNDLI_FAQ} title={null} />
      </section>

      {/* ── Continue → Lagna ───────────────────────────────────────────── */}
      <div className="mt-10">
        <RelatedArticles
          variant="next"
          title="Next in the Basics Series"
          items={[{
            title: 'Reading Your Ascendant (Lagna)',
            href: '/learn/basics/lagna-guide',
            comingSoon: false,
            description: 'Your Lagna sets the frame for your entire chart — what it represents and why it matters more than your Sun sign.',
          }]}
        />
      </div>
    </KnowledgeLayout>
  )
}
