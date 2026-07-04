// frontend/src/pages/learn/zodiac/Aries.jsx
//
// /learn/zodiac/aries — the flagship Vedic Astrology guide for Mesha
// (Aries) and the template every remaining sign guide should follow.
//
// Architecture:
//   — Mounts into KnowledgeLayout (single-column reading shell with a
//     full-width `cta` slot — this is the first real use of KnowledgeLayout
//     since it was built in sprint 1).
//   — All copy is in config/ariesContent.js — this file only composes.
//   — The learning system (LearningPath, LearningMetadata, ConceptLink,
//     SignNav) wires itself from knowledgeGraph.js.
//
// To build the next sign (Taurus), duplicate this file, swap in
// 'zodiac-taurus' as the guide id, create config/taurusContent.js,
// and register the route in App.jsx + generate-sitemap.js.
// Nothing else changes — the framework wires itself from config.
import KnowledgeLayout from '../../../components/knowledge/KnowledgeLayout'
import { useAuth } from '../../../contexts/AuthContext'
import Callout from '../../../components/knowledge/Callout'
import QuickFacts from '../../../components/knowledge/QuickFacts'
import Reflection from '../../../components/knowledge/Reflection'
import FAQ from '../../../components/knowledge/FAQ'
import CTA from '../../../components/knowledge/CTA'
import LearningPath from '../../../components/knowledge/LearningPath'
import LearningMetadata from '../../../components/knowledge/LearningMetadata'
import ConceptLink from '../../../components/knowledge/ConceptLink'
import RelatedArticles from '../../../components/knowledge/RelatedArticles'
import SignNav from '../../../components/knowledge/SignNav'
import ZodiacSignIcon from '../../../components/knowledge/ZodiacSignIcon'
import Reveal from '../../../components/Reveal'
import { getGuide, getLearningPathSteps, getSignNavigation } from '../../../config/knowledgeGraph'
import { getCategoryLabel } from '../../../config/learningTaxonomy'
import {
  ARIES_HERO,
  ARIES_QUICK_FACTS,
  SPIRIT_OF_MESHA,
  SYMBOL_OF_RAM,
  STRENGTHS,
  GROWTH_AREAS,
  RELATIONSHIPS,
  CAREER,
  SPIRITUAL_LESSON,
  BEYOND_SUN_SIGN,
  MISCONCEPTIONS,
  ARIES_FAQ,
  ARIES_CTA,
} from '../../../config/ariesContent'

// ── Article prose helpers ────────────────────────────────────────────────────
// Local — if a second guide needs these, promote to components/knowledge/.

function ArticleParagraphs({ paragraphs }) {
  return (
    <div className="space-y-4">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>
      ))}
    </div>
  )
}

function QualityList({ items }) {
  return (
    <dl className="space-y-7 mt-2">
      {items.map((item, i) => (
        <Reveal key={i} delay={i * 50}>
          <div>
            <dt className="font-semibold text-sm text-ink mb-1.5">{item.quality}</dt>
            <dd className="text-ink-muted text-sm leading-relaxed">{item.body}</dd>
          </div>
        </Reveal>
      ))}
    </dl>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AriesGuide() {
  const guide = getGuide('zodiac-aries')
  const learningPathSteps = getLearningPathSteps('zodiac')  // main curriculum position
  const { prev, next } = getSignNavigation('zodiac-aries')  // sign-level nav
  const { isAuthenticated } = useAuth()

  return (
    <KnowledgeLayout
      seoTitle="Mesha (Aries) in Vedic Astrology — A Complete Guide"
      seoDescription="Understand Mesha (Aries) in Vedic astrology — the archetype, symbolism, strengths, growth areas, and how this sign fits into a complete birth chart."
      path="/learn/zodiac/aries"
      eyebrow="Zodiac Signs"
      breadcrumbItems={[
        { label: 'Home',          to: isAuthenticated ? '/home' : '/' },
        { label: 'Learn',         to: '/learn' },
        { label: 'Zodiac Signs',  to: '/learn/zodiac' },
        { label: 'Mesha (Aries)' },
      ]}
      title={ARIES_HERO.title}
      subtitle={ARIES_HERO.subtitle}
      meta={
        <LearningMetadata
          estimatedReadTime={guide.estimatedReadTime}
          difficulty={guide.difficulty}
          category={getCategoryLabel(guide.category)}
          lastUpdated={guide.lastUpdated}
          variant="dark"
        />
      }
      contentWidth="max-w-2xl"
      cta={
        <CTA
          eyebrow={ARIES_CTA.eyebrow}
          title={ARIES_CTA.title}
          description={ARIES_CTA.description}
          buttonLabel={ARIES_CTA.buttonLabel}
          to="/generate"
          variant="full"
        />
      }
    >

      {/* ── Learning path position ────────────────────────────────────── */}
      <div className="mb-10 pb-8 border-b border-line">
        <LearningPath title="Your learning path" steps={learningPathSteps} />
      </div>

      {/* ── Sign icon + quick facts ───────────────────────────────────── */}
      <Reveal className="flex flex-col sm:flex-row items-start gap-6 mb-2">
        <div className="shrink-0 w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center text-primary-dark">
          <ZodiacSignIcon id="aries" className="w-9 h-9" />
        </div>
        <div className="flex-1">
          <QuickFacts facts={ARIES_QUICK_FACTS} columns={2} />
        </div>
      </Reveal>

      {/* ── The Spirit of Mesha ───────────────────────────────────────── */}
      <section className="mt-12" aria-labelledby="spirit-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{SPIRIT_OF_MESHA.eyebrow}</p>
          <h2 id="spirit-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {SPIRIT_OF_MESHA.title}
          </h2>
          <ArticleParagraphs paragraphs={SPIRIT_OF_MESHA.paragraphs} />
        </Reveal>
      </section>

      {/* ── Understanding the Ram ─────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="ram-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{SYMBOL_OF_RAM.eyebrow}</p>
          <h2 id="ram-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {SYMBOL_OF_RAM.title}
          </h2>
          <ArticleParagraphs paragraphs={SYMBOL_OF_RAM.paragraphs} />
        </Reveal>
      </section>

      {/* ── Strengths ─────────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="strengths-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{STRENGTHS.eyebrow}</p>
          <h2 id="strengths-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-2">
            {STRENGTHS.title}
          </h2>
          {STRENGTHS.description && (
            <p className="text-ink-muted text-sm leading-relaxed mb-6">{STRENGTHS.description}</p>
          )}
          <QualityList items={STRENGTHS.items} />
        </Reveal>
      </section>

      {/* ── Growth areas ──────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="growth-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{GROWTH_AREAS.eyebrow}</p>
          <h2 id="growth-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-2">
            {GROWTH_AREAS.title}
          </h2>
          {GROWTH_AREAS.description && (
            <p className="text-ink-muted text-sm leading-relaxed mb-6">{GROWTH_AREAS.description}</p>
          )}
          <QualityList items={GROWTH_AREAS.items} />
        </Reveal>
      </section>

      {/* ── Relationships ─────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="relationships-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{RELATIONSHIPS.eyebrow}</p>
          <h2 id="relationships-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {RELATIONSHIPS.title}
          </h2>
          <ArticleParagraphs paragraphs={RELATIONSHIPS.paragraphs} />
        </Reveal>
      </section>

      {/* ── Career ────────────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="career-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{CAREER.eyebrow}</p>
          <h2 id="career-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {CAREER.title}
          </h2>
          <ArticleParagraphs paragraphs={CAREER.paragraphs} />
        </Reveal>
      </section>

      {/* ── Spiritual lesson ──────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="spiritual-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{SPIRITUAL_LESSON.eyebrow}</p>
          <h2 id="spiritual-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {SPIRITUAL_LESSON.title}
          </h2>
          <ArticleParagraphs paragraphs={SPIRITUAL_LESSON.paragraphs} />
        </Reveal>
        <Reflection>{SPIRITUAL_LESSON.reflection}</Reflection>
      </section>

      {/* ── Beyond the Sun sign ───────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="beyond-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{BEYOND_SUN_SIGN.eyebrow}</p>
          <h2 id="beyond-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {BEYOND_SUN_SIGN.title}
          </h2>
          <ArticleParagraphs paragraphs={BEYOND_SUN_SIGN.paragraphs} />
        </Reveal>
        <Reveal className="mt-6 bg-parchment-card border border-line rounded-2xl p-6">
          <dl className="space-y-4">
            {BEYOND_SUN_SIGN.items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <dt className="shrink-0 w-36 sm:w-44 text-sm font-semibold text-ink leading-snug">
                  <ConceptLink id={item.conceptId}>{item.label}</ConceptLink>
                </dt>
                <dd className="text-ink-muted text-sm leading-relaxed">{item.description}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal className="mt-8">
          <p className="font-serif italic text-lg sm:text-xl text-ink leading-snug border-l-4 border-primary pl-5">
            {BEYOND_SUN_SIGN.closing}
          </p>
        </Reveal>
      </section>

      {/* ── Common misconceptions ─────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="myths-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">Setting the Record Straight</p>
          <h2 id="myths-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            Common misconceptions
          </h2>
        </Reveal>
        <div className="space-y-5">
          {MISCONCEPTIONS.map((item, i) => (
            <Reveal key={i} delay={i * 50}>
              <Callout variant="warning" title="Common belief">{item.myth}</Callout>
              <Callout variant="tip" title="A clearer picture">{item.reality}</Callout>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="faq-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">Common Questions</p>
          <h2 id="faq-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            Frequently asked questions
          </h2>
        </Reveal>
        <FAQ items={ARIES_FAQ} title={null} />
      </section>

      {/* ── Sign prev / next ──────────────────────────────────────────── */}
      <div className="mt-10">
        <SignNav prev={prev} next={next} />
      </div>

      {/* ── Continue learning → back to Zodiac hub ─────────────────────
           After finishing a sign guide, the natural next step is to
           return to the Zodiac hub and then proceed toward Nakshatras.  */}
      <div className="mt-2">
        <RelatedArticles
          variant="next"
          title="Continue learning"
          items={[{
            title: 'Zodiac Signs — The Complete Hub',
            href: '/learn/zodiac',
            comingSoon: false,
            description: 'Explore all twelve Rashis and understand how the zodiac fits into a complete Vedic birth chart.',
          }]}
        />
      </div>

    </KnowledgeLayout>
  )
}
