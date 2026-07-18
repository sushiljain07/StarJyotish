// frontend/src/pages/learn/career/TenthHouse.jsx
import KnowledgeLayout from '../../../components/knowledge/KnowledgeLayout'
import LearningMetadata from '../../../components/knowledge/LearningMetadata'
import Callout from '../../../components/knowledge/Callout'
import QuickFacts from '../../../components/knowledge/QuickFacts'
import FAQ from '../../../components/knowledge/FAQ'
import RelatedArticles from '../../../components/knowledge/RelatedArticles'
import CareerCTA from '../../../components/knowledge/CTA'
import Reveal from '../../../components/Reveal'
import { useAuth } from '../../../contexts/AuthContext'
import { HERO, QUICK_FACTS, WHAT_THE_TENTH_IS, HOW_TO_READ, SIGNS_IN_TENTH, BEYOND_PLACEMENT, FAQ as FAQS, CTA } from '../../../config/career10thHouseContent'

function ArticleParagraphs({ paragraphs }) {
  return <div className="space-y-4">{paragraphs.map((p, i) => <p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>)}</div>
}

export default function TenthHouseGuide() {
  const { isAuthenticated } = useAuth()
  return (
    <KnowledgeLayout
      seoTitle="The 10th House: Your Career Signature — Career Direction Path"
      seoDescription={HERO.subtitle}
      path="/learn/career/10th-house"
      eyebrow="Career Direction · Part 1 of 6"
      title={HERO.title}
      subtitle={HERO.subtitle}
      meta={<LearningMetadata estimatedReadTime={8} difficulty="intermediate" category="Career" lastUpdated="2026-07-18" />}
      breadcrumbItems={[
        { label: 'Home', to: isAuthenticated ? '/home' : '/' },
        { label: 'Learn', to: '/learn' },
        { label: 'Career Direction', to: '/learn/paths/career-direction' },
        { label: 'The 10th House' },
      ]}
      cta={<CareerCTA eyebrow={CTA.eyebrow} title={CTA.title} description={CTA.description} buttonLabel={CTA.buttonLabel} to="/generate" variant="full" />}
    >
      <QuickFacts facts={QUICK_FACTS} columns={2} />

      <section className="mt-10" aria-labelledby="tenth-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{WHAT_THE_TENTH_IS.eyebrow}</p>
          <h2 id="tenth-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">{WHAT_THE_TENTH_IS.title}</h2>
          <ArticleParagraphs paragraphs={WHAT_THE_TENTH_IS.paragraphs} />
        </Reveal>
      </section>

      <section className="mt-14" aria-labelledby="read-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{HOW_TO_READ.eyebrow}</p>
          <h2 id="read-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">{HOW_TO_READ.title}</h2>
        </Reveal>
        <dl className="space-y-6 mt-2">
          {HOW_TO_READ.items.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="bg-parchment-card border border-line rounded-2xl p-5">
                <dt className="font-semibold text-sm text-ink mb-2">{item.label}</dt>
                <dd className="text-ink-muted text-sm leading-relaxed">{item.body}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>

      <section className="mt-14" aria-labelledby="signs-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{SIGNS_IN_TENTH.eyebrow}</p>
          <h2 id="signs-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-4">{SIGNS_IN_TENTH.title}</h2>
          <p className="text-ink-muted text-sm leading-relaxed mb-6">{SIGNS_IN_TENTH.description}</p>
        </Reveal>
        <Reveal className="bg-parchment-card border border-line rounded-2xl overflow-hidden">
          <dl>
            {SIGNS_IN_TENTH.items.map((item, i) => (
              <div key={i} className={`flex items-start gap-4 px-5 py-3.5 ${i < SIGNS_IN_TENTH.items.length - 1 ? 'border-b border-line' : ''}`}>
                <dt className="shrink-0 w-44 text-sm font-semibold text-ink">{item.sign} <span className="text-ink-faint font-normal text-xs">({item.lord})</span></dt>
                <dd className="text-sm text-ink-muted leading-relaxed">{item.tendency}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <section className="mt-14" aria-labelledby="beyond-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{BEYOND_PLACEMENT.eyebrow}</p>
          <h2 id="beyond-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">{BEYOND_PLACEMENT.title}</h2>
          <ArticleParagraphs paragraphs={BEYOND_PLACEMENT.paragraphs} />
        </Reveal>
      </section>

      <section className="mt-14" aria-labelledby="faq-heading">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">Common Questions</p>
          <h2 id="faq-heading" className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">Frequently asked questions</h2>
        </Reveal>
        <FAQ items={FAQS} title={null} />
      </section>

      <div className="mt-10">
        <RelatedArticles variant="next" title="Career Direction path" items={[
          { title: 'The 10th Lord: The Planet Running Your Career', href: '/learn/career/10th-lord', comingSoon: false, description: 'The ruling planet of your 10th house is the single most important career indicator.' },
        ]} />
      </div>
    </KnowledgeLayout>
  )
}
