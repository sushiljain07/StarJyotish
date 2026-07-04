// frontend/src/components/Footer.jsx
//
// Site-wide footer. Cleaned up in SJ-009:
//   — Services column removed (duplicated topic cards already above the fold)
//   — Learn column kept but trimmed to real destinations only
//     (Zodiac/Nakshatra/Dasha placeholder "#" links removed)
//   — Company column replaced by a single clean column: About, Contact,
//     Blog; "How It Works" (duplicate of hero section), "Pricing" (not
//     live yet) removed
//   — "Get in Touch" section folded into the column — email sits
//     naturally alongside Contact Us rather than as a separate heading
//   — Grid is now 3 columns instead of 4 at md+
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SocialButtons from './SocialButtons'
import { useIsMobile } from '../hooks/useIsMobile'

const TRUST_BADGES = ['landing_badge_accuracy', 'landing_badge_free', 'landing_badge_bilingual', 'landing_badge_ai']
const PAYMENT_PLACEHOLDERS = ['Razorpay', 'UPI', 'Visa', 'Mastercard']

function FooterLink({ to, state, children }) {
  return (
    <li>
      <Link
        to={to}
        state={state}
        className="text-ink-onnight/80 hover:text-primary text-sm transition flex items-center gap-1.5"
      >
        <span className="text-primary/50 text-xs">›</span>{children}
      </Link>
    </li>
  )
}

function FooterColumn({ heading, children }) {
  const isMobile = useIsMobile()

  if (!isMobile) {
    return (
      <div>
        <h3 className="text-xs font-semibold tracking-wide uppercase text-primary-light mb-3">{heading}</h3>
        {children}
      </div>
    )
  }

  return (
    <details key={String(isMobile)} className="group">
      <summary className="text-xs font-semibold tracking-wide uppercase text-primary-light mb-3 cursor-pointer select-none flex items-center justify-between">
        {heading}
        <span className="text-primary-light/60 transition-transform group-open:rotate-180">⌄</span>
      </summary>
      {children}
    </details>
  )
}

export default function Footer() {
  const { t, i18n } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-night border-t border-white/10 text-ink-onnight">
      {/* ── Brand + link columns ── */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2">
            <img src="/starjyotish.svg" alt="" className="w-8 h-8" />
            <span className="font-serif font-semibold text-lg text-primary-light">{t('app_title')}</span>
          </div>
          <p className="text-sm text-ink-onnight/70 mt-3 leading-relaxed max-w-xs">{t('landing_subhead')}</p>
          <p className="text-xs font-semibold tracking-wide uppercase text-ink-onnight/50 mt-5 mb-2">{t('footer_follow_heading')}</p>
          <SocialButtons dark />
        </div>

        {/* Learn — only real, live destinations */}
        <FooterColumn heading={t('footer_learn_heading')}>
          <ul className="space-y-2.5">
            <FooterLink to="/learn">{t('footer_link_knowledge_center', 'Knowledge Center')}</FooterLink>
            <FooterLink to="/faq">{t('footer_link_faq')}</FooterLink>
            <FooterLink to="/blog">{t('footer_link_blog')}</FooterLink>
          </ul>
        </FooterColumn>

        {/* Company — about + contact + pricing; email folded in */}
        <FooterColumn heading={t('footer_company_heading')}>
          <ul className="space-y-2.5">
            <FooterLink to="/about">{t('footer_link_about')}</FooterLink>
            <FooterLink to="/pricing">{t('footer_link_pricing')}</FooterLink>
            <FooterLink to="/contact">{t('footer_link_contact')}</FooterLink>
          </ul>
          <p className="flex items-center gap-1.5 text-sm text-ink-onnight/80 mt-4">
            ✉️ contact@starjyotish.com
          </p>
        </FooterColumn>
      </div>

      {/* ── Newsletter ── */}
      <div className="bg-night-light border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-serif font-semibold text-base text-primary-light">{t('footer_newsletter_heading')}</p>
            <p className="text-xs text-ink-onnight/70 mt-1 max-w-sm">{t('footer_newsletter_body')}</p>
          </div>
          <form onSubmit={e => e.preventDefault()} className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              required
              placeholder={t('footer_newsletter_placeholder')}
              className="flex-1 md:w-64 rounded-lg px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="submit" className="bg-primary hover:bg-primary-dark text-night font-semibold text-sm px-4 py-2 rounded-lg transition shrink-0">
              {t('footer_newsletter_cta')}
            </button>
          </form>
        </div>
        <p className="max-w-6xl mx-auto px-6 pb-4 text-[11px] text-ink-onnight/50 md:text-right">🔒 {t('footer_newsletter_note')}</p>
      </div>

      {/* ── Trust badges + payment placeholders ── */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center gap-2 border-t border-white/10">
        {TRUST_BADGES.map(key => (
          <span key={key} className="bg-primary/10 text-primary text-[11px] font-medium px-3 py-1 rounded-full border border-primary/30">
            {t(key)}
          </span>
        ))}
        <span className="text-[11px] font-semibold tracking-wide uppercase text-ink-onnight/40 ml-2">{t('footer_payment_heading')}</span>
        {PAYMENT_PLACEHOLDERS.map(name => (
          <span key={name} className="bg-white/5 border border-white/10 text-ink-onnight/70 text-[11px] px-3 py-1 rounded">
            {name}
          </span>
        ))}
      </div>

      {/* ── Bottom bar ── */}
      <div className="max-w-6xl mx-auto px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-ink-onnight/60">
          <Link to="/privacy" className="hover:text-primary transition">{t('footer_bottom_privacy')}</Link>
          <Link to="/terms" className="hover:text-primary transition">{t('footer_bottom_terms')}</Link>
          <Link to="/refund-policy" className="hover:text-primary transition">{t('footer_bottom_refund')}</Link>
          <Link to="/disclaimer" className="hover:text-primary transition">{t('footer_bottom_disclaimer')}</Link>
        </div>
        <p className="text-ink-onnight/50 text-center">
          {t('footer_copyright', { year })} · {t('footer_powered_by')}
        </p>
        <div className="flex gap-1">
          {['en', 'hi'].map(lang => (
            <button
              key={lang}
              onClick={() => i18n.changeLanguage(lang)}
              className={`px-2 py-1 rounded-full text-[11px] font-semibold transition ${
                i18n.language.startsWith(lang) ? 'bg-primary text-night' : 'bg-white/5 text-ink-onnight/60 hover:bg-white/10'
              }`}
            >
              {lang === 'en' ? 'EN' : 'हि'}
            </button>
          ))}
        </div>
      </div>
    </footer>
  )
}
