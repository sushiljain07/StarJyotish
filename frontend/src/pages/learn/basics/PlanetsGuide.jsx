// frontend/src/pages/learn/basics/PlanetsGuide.jsx
//
// /learn/basics/planets-guide — Part 3 of the Basics Series.
import { useState } from 'react'
import KnowledgeLayout from '../../../components/knowledge/KnowledgeLayout'
import Callout from '../../../components/knowledge/Callout'
import QuickFacts from '../../../components/knowledge/QuickFacts'
import FAQ from '../../../components/knowledge/FAQ'
import RelatedArticles from '../../../components/knowledge/RelatedArticles'
import Reveal from '../../../components/Reveal'
import { useAuth } from '../../../contexts/AuthContext'
import {
  PLANETS_HERO,
  PLANETS_QUICK_FACTS,
  GRAHAS_INTRO,
  NINE_GRAHAS,
  PLANETARY_STRENGTH,
  PLANETS_FAQ,
} from '../../../config/planetsContent'

function ArticleParagraphs({ paragraphs }) {
  return (
    <div className="space-y-4">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>
      ))}
    </div>
  )
}

function GrahaAccordion({ grahas }) {
  const [open, setOpen] = useState(null)
  return (
    <div className="space-y-2">
      {grahas.map((g, i) => {
        const isOpen = open === i
        return (
          <div key={g.name} className={`bg-parchment-card rounded-xl border transition-colors ${isOpen ? 'border-primary/40' : 'border-line'}`}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-xl shrink-0">{g.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-ink text-sm">{g.name}</span>
                  <span className="text-ink-faint text-xs">{g.skt}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary-dark">{g.keyword}</span>
                </div>
                <p className="text-ink-muted text-xs mt-0.5 truncate">{g.governs}</p>
              </div>
              <svg
                className={`w-4 h-4 text-ink-faint shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 16 16"
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 border-t border-line pt-4">
                <p className="text-ink text-sm leading-relaxed mb-4">{g.body}</p>
                <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <div><dt className="inline text-ink-faint">Owns: </dt><dd className="inline text-ink">{g.owns}</dd></div>
                  <div><dt className="inline text-ink-faint">Exalted: </dt><dd className="inline text-ink">{g.exalted}</dd></div>
                  <div><dt className="inline text-ink-faint">Debilitated: </dt><dd className="inline text-ink">{g.debilitated}</dd></div>
                </dl>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function PlanetsGuide() {
  const { isAuthenticated } = useAuth()

  return (
    <KnowledgeLayout
      seoTitle="The 9 Planets, Simply Explained — Knowledge Center"
      seoDescription="Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu — what each one governs, without the jargon."
      path="/learn/basics/planets-guide"
      eyebrow="Basics Series · Part 3 of 4"
      title={PLANETS_HERO.title}
      subtitle={PLANETS_HERO.subtitle}
      meta={{ readTime: '9 min', badge: 'Basics' }}
      breadcrumbItems={[
        { label: 'Home', to: isAuthenticated ? '/home' : '/' },
        { label: 'Knowledge Center', to: '/learn' },
        { label: 'The 9 Planets, Simply Explained' },
      ]}
    >
      <QuickFacts facts={PLANETS_QUICK_FACTS} columns={2} />

      {/* ── Grahas: forces, not rocks ───────────────────────────────────── */}
      <section className="mt-10" aria-labelledby="intro-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{GRAHAS_INTRO.eyebrow}</p>
          <h2 id="intro-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            {GRAHAS_INTRO.title}
          </h2>
          <ArticleParagraphs paragraphs={GRAHAS_INTRO.paragraphs} />
        </Reveal>
        <Callout variant={GRAHAS_INTRO.callout.variant} title={GRAHAS_INTRO.callout.title}>
          {GRAHAS_INTRO.callout.body}
        </Callout>
      </section>

      {/* ── The nine grahas (accordion) ─────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="grahas-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">The Navagrahas</p>
          <h2 id="grahas-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-3">
            The nine grahas
          </h2>
          <p className="text-ink-muted text-sm mb-6">Tap any planet to read its deeper role in your chart.</p>
        </Reveal>
        <GrahaAccordion grahas={NINE_GRAHAS} />
      </section>

      {/* ── Planetary strength ──────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="strength-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{PLANETARY_STRENGTH.eyebrow}</p>
          <h2 id="strength-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-4">
            {PLANETARY_STRENGTH.title}
          </h2>
          <p className="text-ink text-sm sm:text-base leading-relaxed mb-6">{PLANETARY_STRENGTH.intro}</p>
        </Reveal>
        <div className="space-y-3">
          {PLANETARY_STRENGTH.items.map((item, i) => (
            <Reveal key={i} delay={i * 50} className="bg-parchment-card border border-line rounded-xl p-5">
              <h3 className="font-semibold text-sm text-ink mb-1.5">{item.term}</h3>
              <p className="text-ink-muted text-sm leading-relaxed">{item.desc}</p>
            </Reveal>
          ))}
        </div>
        <Callout variant={PLANETARY_STRENGTH.callout.variant} title={PLANETARY_STRENGTH.callout.title}>
          {PLANETARY_STRENGTH.callout.body}
        </Callout>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="faq-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">Common Questions</p>
          <h2 id="faq-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">
            Frequently asked questions
          </h2>
        </Reveal>
        <FAQ items={PLANETS_FAQ} title={null} />
      </section>

      {/* ── Continue → Moon sign ────────────────────────────────────────── */}
      <div className="mt-10">
        <RelatedArticles
          variant="next"
          title="Next in the Basics Series"
          items={[{
            title: 'Why Your Moon Sign Matters More Than You Think',
            href: '/learn/basics/moon-sign-guide',
            comingSoon: false,
            description: 'Western astrology leans on the Sun sign. Vedic astrology leans on the Moon — here is why, and what it changes.',
          }]}
        />
      </div>
    </KnowledgeLayout>
  )
}
