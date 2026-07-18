import KnowledgeLayout from '../../../components/knowledge/KnowledgeLayout'
import LearningMetadata from '../../../components/knowledge/LearningMetadata'
import FAQ from '../../../components/knowledge/FAQ'
import RelatedArticles from '../../../components/knowledge/RelatedArticles'
import CareerCTA from '../../../components/knowledge/CTA'
import Reveal from '../../../components/Reveal'
import QuickFacts from '../../../components/knowledge/QuickFacts'
import { useAuth } from '../../../contexts/AuthContext'
import { HERO, QUICK_FACTS, THE_SUN_IN_CAREER, SATURN_IN_CAREER, WHEN_THEY_CONFLICT, FAQ as FAQS, CTA } from '../../../config/careerSaturnSunContent'
function P({ paragraphs }) { return <div className="space-y-4">{paragraphs.map((p,i)=><p key={i} className="text-ink text-sm sm:text-base leading-relaxed">{p}</p>)}</div> }
export default function SaturnAndSunGuide() {
  const { isAuthenticated } = useAuth()
  return (
    <KnowledgeLayout seoTitle="Saturn and the Sun — Career Direction Path" seoDescription={HERO.subtitle} path="/learn/career/saturn-and-sun" eyebrow="Career Direction · Part 3 of 6" title={HERO.title} subtitle={HERO.subtitle} meta={<LearningMetadata estimatedReadTime={8} difficulty="intermediate" category="Career" lastUpdated="2026-07-18" />} breadcrumbItems={[{label:'Home',to:isAuthenticated?'/home':'/'},{label:'Learn',to:'/learn'},{label:'Career Direction',to:'/learn/paths/career-direction'},{label:'Saturn and the Sun'}]} cta={<CareerCTA eyebrow={CTA.eyebrow} title={CTA.title} description={CTA.description} buttonLabel={CTA.buttonLabel} to="/generate" variant="full" />}>
      <QuickFacts facts={QUICK_FACTS} columns={2} />
      <section className="mt-10"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{THE_SUN_IN_CAREER.eyebrow}</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">{THE_SUN_IN_CAREER.title}</h2><P paragraphs={THE_SUN_IN_CAREER.paragraphs} /></Reveal></section>
      <section className="mt-14"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{SATURN_IN_CAREER.eyebrow}</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">{SATURN_IN_CAREER.title}</h2><P paragraphs={SATURN_IN_CAREER.paragraphs} /></Reveal></section>
      <section className="mt-14"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{WHEN_THEY_CONFLICT.eyebrow}</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">{WHEN_THEY_CONFLICT.title}</h2><P paragraphs={WHEN_THEY_CONFLICT.paragraphs} /></Reveal></section>
      <section className="mt-14"><Reveal><p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">Common Questions</p><h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink leading-snug mb-6">Frequently asked questions</h2></Reveal><FAQ items={FAQS} title={null} /></section>
      <div className="mt-10"><RelatedArticles variant="next" title="Career Direction path" items={[{title:'The 10th Lord: The Planet Running Your Career',href:'/learn/career/10th-lord',comingSoon:false,description:'Previous guide.'},{title:'The D10 Dashamsha Chart: Vocational Precision',href:'/learn/career/d10-dashamsha',comingSoon:false,description:'Next: the dedicated career divisional chart.'}]} /></div>
    </KnowledgeLayout>
  )
}
