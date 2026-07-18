import KnowledgeLayout from '../../../components/knowledge/KnowledgeLayout'
import LearningMetadata from '../../../components/knowledge/LearningMetadata'
import FAQ from '../../../components/knowledge/FAQ'
import QuickFacts from '../../../components/knowledge/QuickFacts'
import RelatedArticles from '../../../components/knowledge/RelatedArticles'
import PageCTA from '../../../components/knowledge/CTA'
import Reveal from '../../../components/Reveal'
import { useAuth } from '../../../contexts/AuthContext'
import * as C from '../../../config/marriageD9Content'

function P({ paragraphs }) {
  return <div className="space-y-4">{paragraphs.map((p,i)=><p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>)}</div>
}

function ItemList({ items }) {
  if (!items) return null
  return (
    <dl className="space-y-4 mt-2">
      {items.map((item,i) => (
        <Reveal key={i} delay={i*50}>
          <div className="bg-parchment-card border border-line rounded-2xl p-5">
            <dt className="font-semibold text-sm text-ink mb-2">{item.label || item.condition || item.koot || item.question}</dt>
            <dd className="text-ink-muted text-sm leading-relaxed">{item.body || item.effect || item.measures || item.answer}</dd>
          </div>
        </Reveal>
      ))}
    </dl>
  )
}

export default function D9NavamsaGuide() {
  const { isAuthenticated } = useAuth()
  const sections = Object.entries(C).filter(([k]) => !['HERO','QUICK_FACTS','FAQ','CTA'].includes(k))
  
  return (
    <KnowledgeLayout
      seoTitle="The D9 Navamsa Chart — Marriage & Compatibility Path"
      seoDescription={C.HERO.subtitle}
      path="/learn/marriage/d9-navamsa"
      eyebrow="Marriage & Compatibility · Part 3 of 7"
      title={C.HERO.title}
      subtitle={C.HERO.subtitle}
      meta={<LearningMetadata estimatedReadTime={9} difficulty="intermediate" category="Marriage" lastUpdated="2026-07-18" />}
      breadcrumbItems={[
        { label: 'Home', to: isAuthenticated ? '/home' : '/' },
        { label: 'Learn', to: '/learn' },
        { label: 'Marriage & Compatibility', to: '/learn/paths/marriage-compatibility' },
        { label: 'The D9 Navamsa Chart' },
      ]}
      cta={<PageCTA eyebrow={C.CTA.eyebrow} title={C.CTA.title} description={C.CTA.description} buttonLabel={C.CTA.buttonLabel} to="/generate" variant="full" />}
    >
      <QuickFacts facts={C.QUICK_FACTS} columns={2} />
      
      {sections.map(([key, val]) => val && (
        <section key={key} className="mt-14">
          <Reveal>
            {val.eyebrow && <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{val.eyebrow}</p>}
            {val.title && <h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">{val.title}</h2>}
            {val.description && <p className="text-ink-muted text-sm leading-relaxed mb-6">{val.description}</p>}
            {val.paragraphs && <P paragraphs={val.paragraphs} />}
          </Reveal>
          {(val.items || val.groups) && <ItemList items={val.items || val.groups} />}
        </section>
      ))}

      <section className="mt-14">
        <Reveal>
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">Common Questions</p>
          <h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">Frequently asked questions</h2>
        </Reveal>
        <FAQ items={C.FAQ} title={null} />
      </section>

      <div className="mt-10">
        <RelatedArticles variant="next" title="Marriage & Compatibility path" items={[
          { title: 'Guna Milan: What the Compatibility Score Actually Means', href: '/learn/marriage/guna-milan', comingSoon: false, description: 'Continue the path.' },
        ]} />
      </div>
    </KnowledgeLayout>
  )
}
