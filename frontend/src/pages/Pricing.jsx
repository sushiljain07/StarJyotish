// frontend/src/pages/Pricing.jsx
//
// Early access: everything is free. This route used to list paid plans
// (₹99/₹299/₹499) with no checkout behind them, which contradicted the app
// (the paywall is off and Ask is 5 questions per conversation for everyone).
// The URL stays /pricing so existing links and the sitemap keep working.
// The admin "Pricing Plans" setting is deliberately not read here; it
// returns when billing is built.
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import FAQAccordion from '../components/FAQAccordion'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import { Card } from '../components/ui'
import { useScrollProgress } from '../hooks/useScrollProgress'

const INCLUDED = ['kundli', 'reading', 'ask', 'panchang']

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function Pricing() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const scrollProgress = useScrollProgress(80)

  const faqItems = [
    { question: t('early_access_faq_q1'), answer: t('early_access_faq_a1') },
    { question: t('early_access_faq_q2'), answer: t('early_access_faq_a2') },
    { question: t('pricing_faq_q4'), answer: t('pricing_faq_a4') },
  ]

  return (
    <div className="min-h-dvh bg-parchment">
      <Seo title={t('early_access_heading')} description={t('early_access_subhead')} path="/pricing" />
      <SiteHeader scrollProgress={scrollProgress} onCtaClick={() => navigate('/generate')} />

      <main id="main" tabIndex={-1}>
      <div className="relative overflow-hidden bg-night px-6 pt-24 pb-12 text-center">
        <Reveal>
          <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">{t('early_access_eyebrow')}</p>
          <h1 className="font-serif font-semibold text-3xl sm:text-4xl text-primary-light leading-tight">{t('early_access_heading')}</h1>
          <p className="text-ink-onnight text-sm mt-3 max-w-lg mx-auto leading-relaxed">{t('early_access_subhead')}</p>
        </Reveal>
      </div>

      <section className="px-4 py-12">
        <Reveal className="max-w-xl mx-auto">
          <Card padding="lg">
            <h2 className="font-serif font-semibold text-xl text-ink mb-4">{t('early_access_included_heading')}</h2>
            <ul className="space-y-3">
              {INCLUDED.map(id => (
                <li key={id} className="flex gap-2.5 text-sm text-ink leading-relaxed">
                  <CheckIcon />
                  <span>{t(`early_access_item_${id}`)}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/generate"
              className="mt-6 flex items-center justify-center min-h-[44px] px-6 py-3 rounded-full bg-primary hover:bg-primary-dark text-night font-semibold transition"
            >
              {t('early_access_cta')}
            </Link>
          </Card>
        </Reveal>
      </section>

      <section className="px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <Reveal><h2 className="text-center font-serif font-semibold text-2xl text-ink mb-6">{t('pricing_faq_heading')}</h2></Reveal>
          <Reveal delay={80}><FAQAccordion items={faqItems} /></Reveal>
        </div>
      </section>

      </main>

      <Footer />
    </div>
  )
}
