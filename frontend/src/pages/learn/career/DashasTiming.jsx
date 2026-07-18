import KnowledgeLayout from '../../../components/knowledge/KnowledgeLayout'
import LearningMetadata from '../../../components/knowledge/LearningMetadata'
import FAQ from '../../../components/knowledge/FAQ'
import RelatedArticles from '../../../components/knowledge/RelatedArticles'
import CareerCTA from '../../../components/knowledge/CTA'
import Reveal from '../../../components/Reveal'
import QuickFacts from '../../../components/knowledge/QuickFacts'
import { useAuth } from '../../../contexts/AuthContext'
import { HERO, QUICK_FACTS, HOW_DASHAS_TRIGGER_CAREER, KEY_DASHAS, FAQ as FAQS, CTA } from '../../../config/careerDashasContent'
function P({ paragraphs }) { return <div className="space-y-4">{paragraphs.map((p,i)=><p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>)}</div> }
export default function DashasTimingGuide() {
  const { isAuthenticated } = useAuth()
  return (
    <KnowledgeLayout seoTitle="Dashas and Career Timing — Career Direction Path" seoDescription={HERO.subtitle} path="/learn/career/dashas-timing" eyebrow="Career Direction · Part 5 of 6" title={HERO.title} subtitle={HERO.subtitle} meta={<LearningMetadata estimatedReadTime={8} difficulty="intermediate" category="Career" lastUpdated="2026-07-18" />} breadcrumbItems={[{label:'Home',to:isAuthenticated?'/home':'/'},{label:'Learn',to:'/learn'},{label:'Career Direction',to:'/learn/paths/career-direction'},{label:'Dashas & Timing'}]} cta={<CareerCTA eyebrow={CTA.eyebrow} title={CTA.title} description={CTA.description} buttonLabel={CTA.buttonLabel} to="/generate" variant="full" />}>
      <QuickFacts facts={QUICK_FACTS} columns={2} />
      <section className="mt-10"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{HOW_DASHAS_TRIGGER_CAREER.eyebrow}</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">{HOW_DASHAS_TRIGGER_CAREER.title}</h2><P paragraphs={HOW_DASHAS_TRIGGER_CAREER.paragraphs} /></Reveal></section>
      <section className="mt-14"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{KEY_DASHAS.eyebrow}</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">{KEY_DASHAS.title}</h2></Reveal>
        <dl className="space-y-5 mt-2">{KEY_DASHAS.items.map((item,i)=><Reveal key={i} delay={i*50}><div className="bg-parchment-card border border-line rounded-2xl p-5"><dt className="font-semibold text-sm text-ink mb-2">{item.label}</dt><dd className="text-ink-muted text-sm leading-relaxed">{item.body}</dd></div></Reveal>)}</dl>
      </section>
      <section className="mt-14"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">Common Questions</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">Frequently asked questions</h2></Reveal><FAQ items={FAQS} title={null} /></section>
      <div className="mt-10"><RelatedArticles variant="next" title="Career Direction path" items={[{title:'The D10 Dashamsha Chart',href:'/learn/career/d10-dashamsha',comingSoon:false,description:'Previous guide.'},{title:'Rajyogas: Career Combinations Worth Knowing',href:'/learn/career/rajyogas',comingSoon:false,description:'Next and final guide.'}]} /></div>
    </KnowledgeLayout>
  )
}
