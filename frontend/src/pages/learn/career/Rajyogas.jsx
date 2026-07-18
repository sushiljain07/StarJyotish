import KnowledgeLayout from '../../../components/knowledge/KnowledgeLayout'
import LearningMetadata from '../../../components/knowledge/LearningMetadata'
import FAQ from '../../../components/knowledge/FAQ'
import RelatedArticles from '../../../components/knowledge/RelatedArticles'
import CareerCTA from '../../../components/knowledge/CTA'
import Reveal from '../../../components/Reveal'
import QuickFacts from '../../../components/knowledge/QuickFacts'
import { useAuth } from '../../../contexts/AuthContext'
import { HERO, QUICK_FACTS, WHAT_ARE_RAJYOGAS, KEY_YOGAS, FAQ as FAQS, CTA } from '../../../config/careerRajYogasContent'
function P({ paragraphs }) { return <div className="space-y-4">{paragraphs.map((p,i)=><p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>)}</div> }
export default function RajyogasGuide() {
  const { isAuthenticated } = useAuth()
  return (
    <KnowledgeLayout seoTitle="Rajyogas: Career Combinations — Career Direction Path" seoDescription={HERO.subtitle} path="/learn/career/rajyogas" eyebrow="Career Direction · Part 6 of 6" title={HERO.title} subtitle={HERO.subtitle} meta={<LearningMetadata estimatedReadTime={7} difficulty="intermediate" category="Career" lastUpdated="2026-07-18" />} breadcrumbItems={[{label:'Home',to:isAuthenticated?'/home':'/'},{label:'Learn',to:'/learn'},{label:'Career Direction',to:'/learn/paths/career-direction'},{label:'Rajyogas'}]} cta={<CareerCTA eyebrow={CTA.eyebrow} title={CTA.title} description={CTA.description} buttonLabel={CTA.buttonLabel} to="/generate" variant="full" />}>
      <QuickFacts facts={QUICK_FACTS} columns={2} />
      <section className="mt-10"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{WHAT_ARE_RAJYOGAS.eyebrow}</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">{WHAT_ARE_RAJYOGAS.title}</h2><P paragraphs={WHAT_ARE_RAJYOGAS.paragraphs} /></Reveal></section>
      <section className="mt-14"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">Key Combinations</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">Major career Rajyogas</h2></Reveal>
        <div className="space-y-4">{KEY_YOGAS.map((yoga,i)=><Reveal key={i} delay={i*50}><div className="bg-parchment-card border border-line rounded-2xl p-5"><h3 className="font-semibold text-sm text-ink mb-2">{yoga.name}</h3><p className="text-xs text-ink-faint mb-2"><span className="font-semibold">Formation:</span> {yoga.formation}</p><p className="text-sm text-ink-muted leading-relaxed"><span className="font-semibold text-ink">Effect:</span> {yoga.career_effect}</p></div></Reveal>)}</div>
      </section>
      <section className="mt-14"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">Common Questions</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">Frequently asked questions</h2></Reveal><FAQ items={FAQS} title={null} /></section>
      <div className="mt-10"><RelatedArticles variant="next" title="Career Direction path" items={[{title:'Dashas and Career Timing',href:'/learn/career/dashas-timing',comingSoon:false,description:'Previous guide.'},{title:'Career Direction — Full Path',href:'/learn/paths/career-direction',comingSoon:false,description:'Return to the path overview.'}]} /></div>
    </KnowledgeLayout>
  )
}
