// frontend/src/pages/learn/zodiac/Taurus.jsx
//
// /learn/zodiac/taurus — the Vedic Astrology guide for Vrishabha (Taurus).
// Mirrors Aries.jsx exactly in structure and component usage. All copy
// lives in config/taurusContent.js; this file only composes layout.
import KnowledgeLayout from '../../../components/knowledge/KnowledgeLayout'
import { useTranslation } from 'react-i18next'
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
  TAURUS_HERO,
  TAURUS_QUICK_FACTS,
  SPIRIT_OF_VRISHABHA,
  SYMBOL_OF_BULL,
  STRENGTHS,
  GROWTH_AREAS,
  RELATIONSHIPS,
  CAREER,
  SPIRITUAL_LESSON,
  BEYOND_SUN_SIGN,
  MISCONCEPTIONS,
  TAURUS_FAQ,
  TAURUS_CTA,
} from '../../../config/taurusContent'

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

export default function TaurusGuide() {
  const { i18n } = useTranslation()
  const isHindi = i18n.language?.startsWith('hi')
  const guide = getGuide('zodiac-taurus')
  const learningPathSteps = getLearningPathSteps('zodiac')
  const { prev, next } = getSignNavigation('zodiac-taurus')
  const { isAuthenticated } = useAuth()

  return (
    <KnowledgeLayout
      seoTitle="Vrishabha (Taurus) in Vedic Astrology — A Complete Guide"
      seoDescription="Understand Vrishabha (Taurus) in Vedic astrology — the archetype, symbolism, strengths, growth areas, and how this sign fits into a complete birth chart."
      path="/learn/zodiac/taurus"
      eyebrow="Zodiac Signs"
      breadcrumbItems={[
        { label: 'Home',             to: isAuthenticated ? '/home' : '/' },
        { label: 'Learn',            to: '/learn' },
        { label: 'Zodiac Signs',     to: '/learn/zodiac' },
        { label: 'Vrishabha (Taurus)' },
      ]}
      title={TAURUS_HERO.title}
      subtitle={TAURUS_HERO.subtitle}
      meta={
        <LearningMetadata
          estimatedReadTime={guide?.estimatedReadTime ?? 12}
          difficulty={guide?.difficulty}
          category={getCategoryLabel(guide?.category ?? 'zodiac')}
          lastUpdated={guide?.lastUpdated}
          variant="dark"
        />
      }
      contentWidth="max-w-2xl"
      cta={
        <CTA
          eyebrow={TAURUS_CTA.eyebrow}
          title={TAURUS_CTA.title}
          description={TAURUS_CTA.description}
          buttonLabel={TAURUS_CTA.buttonLabel}
          to="/generate"
          variant="full"
        />
      }
    >

      {/* ── Hindi language notice ─────────────────────────────────────── */}
      {isHindi && (
        <div className="mb-8 bg-primary-light border border-primary/30 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-lg shrink-0">🌐</span>
          <p className="text-sm text-primary-dark leading-relaxed">
            यह लेख अभी केवल अंग्रेज़ी में उपलब्ध है। हिंदी अनुवाद जल्द आएगा।
            <span className="font-medium"> (This guide is currently available in English only.)</span>
          </p>
        </div>
      )}

      {/* ── Learning path position ─────────────────────────────────────── */}
      <div className="mb-10 pb-8 border-b border-line">
        <LearningPath title="Your learning path" steps={learningPathSteps} />
      </div>

      {/* ── Sign icon + quick facts ───────────────────────────────────── */}
      <Reveal className="flex flex-col sm:flex-row items-start gap-6 mb-2">
        <div className="shrink-0 w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center text-primary-dark">
          <ZodiacSignIcon id="taurus" className="w-9 h-9" />
        </div>
        <div className="flex-1">
          <QuickFacts facts={TAURUS_QUICK_FACTS} columns={2} />
        </div>
      </Reveal>

      {/* ── The Spirit of Vrishabha ───────────────────────────────────── */}
      <section className="mt-12" aria-labelledby="spirit-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{SPIRIT_OF_VRISHABHA.eyebrow}</p>
          <h2 id="spirit-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {SPIRIT_OF_VRISHABHA.title}
          </h2>
          <ArticleParagraphs paragraphs={SPIRIT_OF_VRISHABHA.paragraphs} />
        </Reveal>
      </section>

      {/* ── Understanding the Bull ────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="bull-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{SYMBOL_OF_BULL.eyebrow}</p>
          <h2 id="bull-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {SYMBOL_OF_BULL.title}
          </h2>
          <ArticleParagraphs paragraphs={SYMBOL_OF_BULL.paragraphs} />
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
        <FAQ items={TAURUS_FAQ} title={null} />
      </section>

      {/* ── Sign prev / next ──────────────────────────────────────────── */}
      <div className="mt-10">
        <SignNav prev={prev} next={next} />
      </div>

      {/* ── Continue learning ─────────────────────────────────────────── */}
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
