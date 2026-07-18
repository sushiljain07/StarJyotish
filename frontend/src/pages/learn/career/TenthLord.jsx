import KnowledgeLayout from '../../../components/knowledge/KnowledgeLayout'
import LearningMetadata from '../../../components/knowledge/LearningMetadata'
import FAQ from '../../../components/knowledge/FAQ'
import RelatedArticles from '../../../components/knowledge/RelatedArticles'
import CareerCTA from '../../../components/knowledge/CTA'
import Reveal from '../../../components/Reveal'
import QuickFacts from '../../../components/knowledge/QuickFacts'
import { useAuth } from '../../../contexts/AuthContext'
import { HERO, QUICK_FACTS, WHAT_IS_TENTH_LORD, LORD_BY_HOUSE, STRENGTH_OF_LORD, FAQ as FAQS, CTA } from '../../../config/career10thLordContent'
function P({ paragraphs }) { return <div className="space-y-4">{paragraphs.map((p,i)=><p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>)}</div> }
export default function TenthLordGuide() {
  const { isAuthenticated } = useAuth()
  return (
    <KnowledgeLayout seoTitle="The 10th Lord — Career Direction Path" seoDescription={HERO.subtitle} path="/learn/career/10th-lord" eyebrow="Career Direction · Part 2 of 6" title={HERO.title} subtitle={HERO.subtitle} meta={<LearningMetadata estimatedReadTime={7} difficulty="intermediate" category="Career" lastUpdated="2026-07-18" />} breadcrumbItems={[{label:'Home',to:isAuthenticated?'/home':'/'},{label:'Learn',to:'/learn'},{label:'Career Direction',to:'/learn/paths/career-direction'},{label:'The 10th Lord'}]} cta={<CareerCTA eyebrow={CTA.eyebrow} title={CTA.title} description={CTA.description} buttonLabel={CTA.buttonLabel} to="/generate" variant="full" />}>
      <QuickFacts facts={QUICK_FACTS} columns={2} />
      <section className="mt-10"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{WHAT_IS_TENTH_LORD.eyebrow}</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">{WHAT_IS_TENTH_LORD.title}</h2><P paragraphs={WHAT_IS_TENTH_LORD.paragraphs} /></Reveal></section>
      <section className="mt-14"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{LORD_BY_HOUSE.eyebrow}</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">{LORD_BY_HOUSE.title}</h2></Reveal>
        <Reveal className="bg-parchment-card border border-line rounded-2xl overflow-hidden"><dl>{LORD_BY_HOUSE.items.map((item,i)=><div key={i} className={`flex items-start gap-4 px-5 py-3.5 ${i<LORD_BY_HOUSE.items.length-1?'border-b border-line':''}`}><dt className="shrink-0 w-16 text-sm font-bold text-primary-dark">{item.house}th</dt><dd className="text-sm text-ink-muted leading-relaxed">{item.meaning}</dd></div>)}</dl></Reveal>
      </section>
      <section className="mt-14"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{STRENGTH_OF_LORD.eyebrow}</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">{STRENGTH_OF_LORD.title}</h2><P paragraphs={STRENGTH_OF_LORD.paragraphs} /></Reveal></section>
      <section className="mt-14"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">Common Questions</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">Frequently asked questions</h2></Reveal><FAQ items={FAQS} title={null} /></section>
      <div className="mt-10"><RelatedArticles variant="next" title="Career Direction path" items={[{title:'The 10th House: Your Career Signature',href:'/learn/career/10th-house',comingSoon:false,description:'Back to part 1.'},{title:'Saturn and the Sun: The Karmic Career Planets',href:'/learn/career/saturn-and-sun',comingSoon:false,description:'Next: the natural career significators.'}]} /></div>
    </KnowledgeLayout>
  )
}
