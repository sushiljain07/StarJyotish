// frontend/src/pages/learn/basics/MoonSignGuide.jsx
//
// /learn/basics/moon-sign-guide — Part 4 of the Basics Series.
import KnowledgeLayout from '../../../components/knowledge/KnowledgeLayout'
import LearningMetadata from '../../../components/knowledge/LearningMetadata'
import Callout from '../../../components/knowledge/Callout'
import QuickFacts from '../../../components/knowledge/QuickFacts'
import FAQ from '../../../components/knowledge/FAQ'
import RelatedArticles from '../../../components/knowledge/RelatedArticles'
import Reflection from '../../../components/knowledge/Reflection'
import Reveal from '../../../components/Reveal'
import CTA from '../../../components/knowledge/CTA'
import { useAuth } from '../../../contexts/AuthContext'
import {
  MOON_HERO,
  MOON_QUICK_FACTS,
  EAST_WEST_SPLIT,
  RASHI_EMOTIONAL_OS,
  MOON_SIGNS_TABLE,
  MOON_TIMING,
  CHANDRASHTAMA,
  MOON_FAQ,
} from '../../../config/moonSignContent'

function ArticleParagraphs({ paragraphs }) {
  return (
    <div className="space-y-4">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>
      ))}
    </div>
  )
}

export default function MoonSignGuide() {
  const { isAuthenticated } = useAuth()

  return (
    <KnowledgeLayout
      seoTitle="Why Your Moon Sign Matters More Than You Think — Knowledge Center"
      seoDescription="Western astrology leans on the Sun sign. Vedic astrology leans on the Moon. Here is the difference, and why it changes how you should read your own chart."
      path="/learn/basics/moon-sign-guide"
      eyebrow="Basics Series · Part 4 of 4"
      title={MOON_HERO.title}
      subtitle={MOON_HERO.subtitle}
      meta={<LearningMetadata estimatedReadTime={6} difficulty="beginner" category="Basics" lastUpdated="2026-07-15" />}
      breadcrumbItems={[
        { label: 'Home', to: isAuthenticated ? '/home' : '/' },
        { label: 'Knowledge Center', to: '/learn' },
        { label: 'Why Your Moon Sign Matters' },
      ]}
      cta={
        <CTA
          eyebrow="Basics Series complete"
          title="See all of this in your own chart"
          description="You now have the foundation: what a Kundli is, how the Lagna works, what each planet governs, and why the Moon sign anchors it all. Generate your free Kundli to see these ideas applied to your own birth data."
          buttonLabel="Generate My Free Kundli →"
          to="/generate"
          variant="full"
        />
      }
    >
      <QuickFacts facts={MOON_QUICK_FACTS} columns={2} />

      {/* ── East vs West ───────────────────────────────────────────────── */}
      <section className="mt-10" aria-labelledby="split-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{EAST_WEST_SPLIT.eyebrow}</p>
          <h2 id="split-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {EAST_WEST_SPLIT.title}
          </h2>
          <ArticleParagraphs paragraphs={EAST_WEST_SPLIT.paragraphs} />
        </Reveal>
        <Callout variant={EAST_WEST_SPLIT.callout.variant} title={EAST_WEST_SPLIT.callout.title}>
          {EAST_WEST_SPLIT.callout.body}
        </Callout>
      </section>

      {/* ── Rashi as emotional OS ──────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="rashi-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{RASHI_EMOTIONAL_OS.eyebrow}</p>
          <h2 id="rashi-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {RASHI_EMOTIONAL_OS.title}
          </h2>
          <ArticleParagraphs paragraphs={RASHI_EMOTIONAL_OS.paragraphs} />
        </Reveal>
      </section>

      {/* ── Moon signs table ───────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="signs-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{MOON_SIGNS_TABLE.eyebrow}</p>
          <h2 id="signs-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-4">
            {MOON_SIGNS_TABLE.title}
          </h2>
          <p className="text-ink-muted text-sm mb-6">{MOON_SIGNS_TABLE.intro}</p>
        </Reveal>
        <div className="space-y-2">
          {MOON_SIGNS_TABLE.items.map((m, i) => (
            <Reveal key={m.sign} delay={i * 30} className="bg-parchment-card border border-line rounded-xl px-5 py-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-semibold text-sm text-ink">{m.sign}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary-dark">
                  Needs: {m.need}
                </span>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">
                <span className="text-ink-faint">Restored by: </span>{m.comfort}
              </p>
              <p className="text-sm text-ink-muted leading-relaxed mt-1">
                <span className="text-ink-faint">Drained by: </span>{m.drains}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Timing: Dasha, Sade Sati ────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="timing-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{MOON_TIMING.eyebrow}</p>
          <h2 id="timing-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {MOON_TIMING.title}
          </h2>
          <ArticleParagraphs paragraphs={MOON_TIMING.paragraphs} />
        </Reveal>
        <Callout variant={MOON_TIMING.callout.variant} title={MOON_TIMING.callout.title}>
          {MOON_TIMING.callout.body}
        </Callout>
      </section>

      {/* ── Chandrashtama ──────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="chandrashtama-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{CHANDRASHTAMA.eyebrow}</p>
          <h2 id="chandrashtama-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {CHANDRASHTAMA.title}
          </h2>
          <ArticleParagraphs paragraphs={CHANDRASHTAMA.paragraphs} />
        </Reveal>
        <Reflection>
          Your Moon sign shows the conditions that restore you. What would it look like to design your week around those conditions — not as self-indulgence, but as maintenance?
        </Reflection>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="faq-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">Common Questions</p>
          <h2 id="faq-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            Frequently asked questions
          </h2>
        </Reveal>
        <FAQ items={MOON_FAQ} title={null} />
      </section>

      {/* ── Basics complete → Zodiac hub ────────────────────────────────── */}
      <div className="mt-10">
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
