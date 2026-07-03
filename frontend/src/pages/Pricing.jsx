// frontend/src/pages/Pricing.jsx
//
// Plan data is fetched from the AppSetting key "pricing_plans" via the
// existing /api/settings/public endpoint. Falls back to
// FALLBACK_PLANS if the setting hasn't been configured yet.
// Admin edits plans in the admin dashboard → Pricing Plans tab.
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { API_BASE } from '../api/config'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import FAQAccordion from '../components/FAQAccordion'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import { useScrollProgress } from '../hooks/useScrollProgress'

const FALLBACK_PLANS = [
  { id: 'free',       name: 'Free',       name_hi: 'मुफ्त',    price_monthly: 0,   highlight: false, badge: null,           accent: 'border-line',    features: ['Full Kundli (all 16 divisional charts)','Vimshottari Dasha timeline','Ashtakavarga tables','One AI reading per chart','3 Ask questions per chart'],                                                               cta: 'Generate Free Kundli',    cta_hi: 'मुफ्त कुंडली बनाएं',      tagline: 'Your real Kundli, always free.', tagline_hi: 'आपकी असली कुंडली, हमेशा मुफ्त।' },
  { id: 'seeker',     name: 'Seeker',     name_hi: 'साधक',     price_monthly: 99,  highlight: false, badge: null,           accent: 'border-primary', features: ['Everything in Free','Unlimited chart generations','Unlimited Ask questions','Career deep-dive report','Relationship (Navamsa) report','Wealth & Finance report','Priority AI (faster responses)'],              cta: 'Start Seeker Plan',       cta_hi: 'साधक योजना शुरू करें',    tagline: 'For the curious — go deeper.',   tagline_hi: 'जिज्ञासु के लिए — गहराई में जाएं।' },
  { id: 'jyotishi',   name: 'Jyotishi',   name_hi: 'ज्योतिषी', price_monthly: 299, highlight: true,  badge: 'Most Popular', accent: 'border-sage',    features: ['Everything in Seeker','Synastry & compatibility charts','Transit alerts (email)','PDF report downloads','Muhurta (auspicious timing)','Early access to new features'],                                    cta: 'Start Jyotishi Plan',     cta_hi: 'ज्योतिषी योजना शुरू करें', tagline: 'For serious practitioners.',     tagline_hi: 'गंभीर साधकों के लिए।' },
  { id: 'sampoorna',  name: 'Sampoorna',  name_hi: 'संपूर्ण',  price_monthly: 499, highlight: false, badge: 'Coming soon',  accent: 'border-mauve',   features: ['Everything in Jyotishi','1 live consultation / month (30 min)','Verified astrologer, your choice','Post-consultation notes & summary','Priority support'],                                          cta: 'Start Sampoorna Plan',    cta_hi: 'संपूर्ण योजना शुरू करें',  tagline: 'When you want a human astrologer too.', tagline_hi: 'जब आप एक मानव ज्योतिषी भी चाहते हैं।' },
]

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PlanCard({ plan, annual, isHindi, onSelect }) {
  const comingSoon = plan.badge === 'Coming soon'
  const monthly = plan.price_monthly
  const displayPrice = annual && monthly > 0 ? Math.round(monthly * 0.8) : monthly
  const name    = isHindi && plan.name_hi    ? plan.name_hi    : plan.name
  const tagline = isHindi && plan.tagline_hi ? plan.tagline_hi : plan.tagline
  const cta     = isHindi && plan.cta_hi     ? plan.cta_hi     : plan.cta

  return (
    <div className={`relative bg-parchment-card rounded-2xl border-2 ${plan.accent || 'border-line'} p-6 flex flex-col ${plan.highlight ? 'shadow-lg shadow-primary/10' : 'shadow-sm'}`}>
      {plan.badge && (
        <div className={`absolute -top-3 left-5 text-xs font-bold px-3 py-1 rounded-full ${plan.highlight ? 'bg-primary text-night' : 'bg-parchment-card border border-line text-ink-muted'}`}>
          {plan.badge}
        </div>
      )}
      <div className="mb-4">
        <div className="font-serif font-semibold text-xl text-ink">{name}</div>
        <div className="text-xs text-ink-muted mt-0.5">{tagline}</div>
      </div>
      <div className="mb-5">
        <div className="flex items-end gap-1.5">
          <span className="font-bold text-3xl text-ink">{monthly === 0 ? 'Free' : `₹${displayPrice}`}</span>
          {monthly > 0 && <span className="text-ink-faint text-sm mb-1">/month</span>}
        </div>
        {monthly > 0 && annual && (
          <div className="text-xs text-sage font-medium mt-0.5">
            ₹{Math.round(monthly * 0.8 * 12)}/year · save ₹{Math.round(monthly * 0.2 * 12)}
          </div>
        )}
        {monthly === 0 && <div className="text-xs text-ink-faint mt-0.5">No card required</div>}
      </div>
      <ul className="space-y-2 flex-1 mb-6">
        {(plan.features || []).map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-ink leading-relaxed">
            <CheckIcon /><span>{f}</span>
          </li>
        ))}
      </ul>
      <button onClick={() => !comingSoon && onSelect(plan)} disabled={comingSoon}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition ${comingSoon ? 'bg-parchment text-ink-faint cursor-not-allowed border border-line' : plan.highlight ? 'bg-primary hover:bg-primary-dark text-night shadow-md' : monthly === 0 ? 'bg-night hover:bg-night-light text-primary border border-primary/30' : 'bg-parchment hover:bg-primary-light text-primary-dark border border-primary/40'}`}>
        {comingSoon ? 'Coming Soon' : cta}
      </button>
    </div>
  )
}

export default function Pricing() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isHindi = i18n.language === 'hi'
  const [annual, setAnnual] = useState(false)
  const [plans, setPlans] = useState(FALLBACK_PLANS)
  const scrollProgress = useScrollProgress(80)

  useEffect(() => {
    fetch(`${API_BASE}/api/settings/public`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.pricing_plans && Array.isArray(data.pricing_plans)) setPlans(data.pricing_plans) })
      .catch(() => {})
  }, [])

  const faqItems = [1,2,3,4,5].map(n => ({ question: t(`pricing_faq_q${n}`), answer: t(`pricing_faq_a${n}`) }))

  function handleSelect(plan) {
    if (plan.price_monthly === 0) navigate('/generate')
    else navigate('/login', { state: { next: '/pricing', plan: plan.id } })
  }

  return (
    <div className="min-h-screen bg-parchment">
      <Seo title="Plans & Pricing — Star Jyotish" description={t('pricing_subhead')} path="/pricing" />
      <SiteHeader scrollProgress={scrollProgress} onCtaClick={() => navigate('/generate')} />

      <div className="relative overflow-hidden bg-night px-6 pt-24 pb-12 text-center">
        <Reveal>
          <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">{t('pricing_eyebrow')}</p>
          <h1 className="font-serif font-semibold text-3xl sm:text-4xl text-primary-light leading-tight">{t('pricing_heading')}</h1>
          <p className="text-ink-onnight text-sm mt-3 max-w-lg mx-auto leading-relaxed">{t('pricing_subhead')}</p>
        </Reveal>
        <Reveal delay={100} className="flex items-center justify-center gap-3 mt-7">
          <span className={`text-sm ${!annual ? 'text-primary font-semibold' : 'text-ink-onnight'}`}>{t('pricing_billing_monthly')}</span>
          <button onClick={() => setAnnual(v => !v)} className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-primary' : 'bg-white/20'}`} role="switch" aria-checked={annual}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${annual ? 'left-7' : 'left-1'}`} />
          </button>
          <span className={`text-sm flex items-center gap-1.5 ${annual ? 'text-primary font-semibold' : 'text-ink-onnight'}`}>
            {t('pricing_billing_annual')}
            <span className="text-[10px] font-bold bg-sage text-white px-1.5 py-0.5 rounded-full">{t('pricing_annual_save')}</span>
          </span>
        </Reveal>
      </div>

      <section className="px-4 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 70}>
              <PlanCard plan={plan} annual={annual} isHindi={isHindi} onSelect={handleSelect} />
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal className="px-4 pb-8">
        <div className="max-w-3xl mx-auto bg-parchment-card border border-line rounded-2xl px-5 py-4 flex flex-wrap items-center justify-center gap-6 text-xs text-ink-muted">
          {[{icon:'🔒',text:'Razorpay-secured payment'},{icon:'↩️',text:'7-day refund guarantee'},{icon:'📵',text:'Cancel anytime'},{icon:'🇮🇳',text:'UPI accepted'}].map(({icon,text}) => (
            <div key={text} className="flex items-center gap-1.5"><span>{icon}</span><span>{text}</span></div>
          ))}
        </div>
      </Reveal>

      <div className="flex items-center justify-center gap-3 py-1" aria-hidden="true">
        <span className="h-px w-12 sm:w-20 bg-line" />
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-primary/70" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></svg>
        <span className="h-px w-12 sm:w-20 bg-line" />
      </div>

      <section className="px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <Reveal><h2 className="text-center font-serif font-semibold text-2xl text-ink mb-6">{t('pricing_faq_heading')}</h2></Reveal>
          <Reveal delay={80}><FAQAccordion items={faqItems} /></Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}
