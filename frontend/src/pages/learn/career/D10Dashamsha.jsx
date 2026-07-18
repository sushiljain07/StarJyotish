import KnowledgeLayout from '../../../components/knowledge/KnowledgeLayout'
import LearningMetadata from '../../../components/knowledge/LearningMetadata'
import FAQ from '../../../components/knowledge/FAQ'
import RelatedArticles from '../../../components/knowledge/RelatedArticles'
import CareerCTA from '../../../components/knowledge/CTA'
import Reveal from '../../../components/Reveal'
import QuickFacts from '../../../components/knowledge/QuickFacts'
import { useAuth } from '../../../contexts/AuthContext'
import { HERO, QUICK_FACTS, WHAT_IS_D10, HOW_TO_READ_D10, FAQ as FAQS, CTA } from '../../../config/careerD10Content'
function P({ paragraphs }) { return <div className="space-y-4">{paragraphs.map((p,i)=><p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>)}</div> }
export default function D10DashamshaguideGuide() {
  const { isAuthenticated } = useAuth()
  return (
    <KnowledgeLayout seoTitle="The D10 Dashamsha Chart — Career Direction Path" seoDescription={HERO.subtitle} path="/learn/career/d10-dashamsha" eyebrow="Career Direction · Part 4 of 6" title={HERO.title} subtitle={HERO.subtitle} meta={<LearningMetadata estimatedReadTime={9} difficulty="intermediate" category="Career" lastUpdated="2026-07-18" />} breadcrumbItems={[{label:'Home',to:isAuthenticated?'/home':'/'},{label:'Learn',to:'/learn'},{label:'Career Direction',to:'/learn/paths/career-direction'},{label:'D10 Dashamsha'}]} cta={<CareerCTA eyebrow={CTA.eyebrow} title={CTA.title} description={CTA.description} buttonLabel={CTA.buttonLabel} to="/generate" variant="full" />}>
      <QuickFacts facts={QUICK_FACTS} columns={2} />
      <section className="mt-10"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{WHAT_IS_D10.eyebrow}</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">{WHAT_IS_D10.title}</h2><P paragraphs={WHAT_IS_D10.paragraphs} /></Reveal></section>
      <section className="mt-14"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{HOW_TO_READ_D10.eyebrow}</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">{HOW_TO_READ_D10.title}</h2></Reveal>
        <dl className="space-y-5 mt-2">{HOW_TO_READ_D10.items.map((item,i)=><Reveal key={i} delay={i*50}><div className="bg-parchment-card border border-line rounded-2xl p-5"><dt className="font-semibold text-sm text-ink mb-2">{item.label}</dt><dd className="text-ink-muted text-sm leading-relaxed">{item.body}</dd></div></Reveal>)}</dl>
      </section>
      <section className="mt-14"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">Common Questions</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">Frequently asked questions</h2></Reveal><FAQ items={FAQS} title={null} /></section>
      <div className="mt-10"><RelatedArticles variant="next" title="Career Direction path" items={[{title:'Saturn and the Sun: The Karmic Career Planets',href:'/learn/career/saturn-and-sun',comingSoon:false,description:'Previous guide.'},{title:'Dashas and Career Timing: When Doors Open',href:'/learn/career/dashas-timing',comingSoon:false,description:'Next: the timing system.'}]} /></div>
    </KnowledgeLayout>
  )
}
