// frontend/src/pages/learn/basics/LagnaGuide.jsx
//
// /learn/basics/lagna-guide — Part 2 of the Basics Series.
import KnowledgeLayout from '../../../components/knowledge/KnowledgeLayout'
import Callout from '../../../components/knowledge/Callout'
import QuickFacts from '../../../components/knowledge/QuickFacts'
import FAQ from '../../../components/knowledge/FAQ'
import RelatedArticles from '../../../components/knowledge/RelatedArticles'
import Reflection from '../../../components/knowledge/Reflection'
import Reveal from '../../../components/Reveal'
import { useAuth } from '../../../contexts/AuthContext'
import {
  LAGNA_HERO,
  LAGNA_QUICK_FACTS,
  LAGNA_SPINE,
  LAGNA_LORD,
  TWELVE_LAGNAS,
  WHY_DIFFERENT,
  LAGNA_IN_PRACTICE,
  LAGNA_FAQ,
} from '../../../config/lagnaContent'

function ArticleParagraphs({ paragraphs }) {
  return (
    <div className="space-y-4">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>
      ))}
    </div>
  )
}

export default function LagnaGuide() {
  const { isAuthenticated } = useAuth()

  return (
    <KnowledgeLayout
      seoTitle="Reading Your Ascendant (Lagna) — Knowledge Center"
      seoDescription="Your Lagna sets the frame for your entire chart. Learn what it represents and why two people with the same Sun sign can feel completely different."
      path="/learn/basics/lagna-guide"
      eyebrow="Basics Series · Part 2 of 4"
      title={LAGNA_HERO.title}
      subtitle={LAGNA_HERO.subtitle}
      meta={{ readTime: '7 min', badge: 'Basics' }}
      breadcrumbItems={[
        { label: 'Home', to: isAuthenticated ? '/home' : '/' },
        { label: 'Knowledge Center', to: '/learn' },
        { label: 'Reading Your Ascendant (Lagna)' },
      ]}
    >
      <QuickFacts facts={LAGNA_QUICK_FACTS} columns={2} />

      {/* ── The Lagna is your chart's spine ────────────────────────────── */}
      <section className="mt-10" aria-labelledby="spine-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{LAGNA_SPINE.eyebrow}</p>
          <h2 id="spine-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {LAGNA_SPINE.title}
          </h2>
          <ArticleParagraphs paragraphs={LAGNA_SPINE.paragraphs} />
        </Reveal>
        <Callout variant={LAGNA_SPINE.callout.variant} title={LAGNA_SPINE.callout.title}>
          {LAGNA_SPINE.callout.body}
        </Callout>
      </section>

      {/* ── Lagna Lord ─────────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="lord-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{LAGNA_LORD.eyebrow}</p>
          <h2 id="lord-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {LAGNA_LORD.title}
          </h2>
          <ArticleParagraphs paragraphs={LAGNA_LORD.paragraphs} />
        </Reveal>
      </section>

      {/* ── 12 Lagnas table ────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="lagnas-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{TWELVE_LAGNAS.eyebrow}</p>
          <h2 id="lagnas-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-4">
            {TWELVE_LAGNAS.title}
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed mb-6">{TWELVE_LAGNAS.intro}</p>
        </Reveal>
        <Reveal className="bg-parchment-card border border-line rounded-2xl overflow-hidden">
          <dl>
            {TWELVE_LAGNAS.items.map((l, i) => (
              <div key={l.sign} className={`grid grid-cols-[1fr_auto] sm:grid-cols-[7rem_5rem_7rem_1fr] gap-x-4 gap-y-0.5 items-center px-5 py-3 ${i < TWELVE_LAGNAS.items.length - 1 ? 'border-b border-line' : ''}`}>
                <dt className="font-semibold text-sm text-ink">{l.sign}</dt>
                <dd className="text-xs text-ink-faint sm:col-auto col-start-2">Lord: {l.lord}</dd>
                <dd className="text-xs text-ink-faint hidden sm:block">{l.quality}</dd>
                <dd className="text-sm text-ink-muted col-span-2 sm:col-span-1 mt-0.5 sm:mt-0">{l.vibe}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* ── Why two Libras differ ──────────────────────────────────────── */}
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

      {/* ── Using your Lagna in practice ──────────────────────────────── */}
      <section className="mt-14" aria-labelledby="practice-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{LAGNA_IN_PRACTICE.eyebrow}</p>
          <h2 id="practice-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {LAGNA_IN_PRACTICE.title}
          </h2>
          <ArticleParagraphs paragraphs={LAGNA_IN_PRACTICE.paragraphs} />
        </Reveal>
        <Reflection>{LAGNA_IN_PRACTICE.reflection}</Reflection>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="faq-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">Common Questions</p>
          <h2 id="faq-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            Frequently asked questions
          </h2>
        </Reveal>
        <FAQ items={LAGNA_FAQ} title={null} />
      </section>

      {/* ── Continue → Planets ─────────────────────────────────────────── */}
      <div className="mt-10">
        <RelatedArticles
          variant="next"
          title="Next in the Basics Series"
          items={[{
            title: 'The 9 Planets, Simply Explained',
            href: '/learn/basics/planets-guide',
            comingSoon: false,
            description: 'Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu — what each one governs, without the jargon.',
          }]}
        />
      </div>
    </KnowledgeLayout>
  )
}
