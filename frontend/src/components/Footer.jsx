// frontend/src/components/Footer.jsx
//
// Site-wide footer — sits at the bottom of Landing.jsx today, written to be
// dropped onto any other page later (e.g. Disclaimer.jsx already does).
// Every color/spacing/radius choice below is an existing token from
// tailwind.config.js or a pattern copied from Landing.jsx / BirthForm.jsx —
// see inline notes. No new design decisions were made for this component.
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SocialButtons from './SocialButtons'
import { useIsMobile } from '../hooks/useIsMobile'

// Same capability badges already shown in the hero (services/topic.js has no
// "trust" claims of its own, and these are the only ones the app can back up
// honestly today — see Landing.jsx's BADGES comment). Reusing them here
// instead of inventing new unverified claims like "Astrologer Verified" or
// a star rating, which don't apply yet (no marketplace, no review data).
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

// Renders as a native <details>/<summary> on mobile (collapsed by
// default — the footer is the last thing on an already-long page, and
// two fully-expanded link columns just add scroll depth most visitors
// never touch), and as a plain always-open heading + list on sm+, where
// vertical space isn't scarce and a click-to-expand interaction would
// just be friction for no benefit. `key={isMobile}` forces a clean
// remount on breakpoint change so the `open` attribute (which React only
// applies once, on mount — it doesn't track it afterwards) re-evaluates,
// e.g. if someone resizes a desktop browser window down past the
// breakpoint.
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
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10">
        {/* Brand */}
        <div className="sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <img src="/starjyotish.svg" alt="" className="w-8 h-8" />
            <span className="font-serif font-semibold text-lg text-primary-light">{t('app_title')}</span>
          </div>
          <p className="text-sm text-ink-onnight/70 mt-3 leading-relaxed max-w-xs">{t('landing_subhead')}</p>
          <p className="text-xs font-semibold tracking-wide uppercase text-ink-onnight/50 mt-5 mb-2">{t('footer_follow_heading')}</p>
          <SocialButtons dark />
        </div>

        {/* Services */}
        <FooterColumn heading={t('footer_services_heading')}>
          <ul className="space-y-2.5">
            <FooterLink to="/generate">{t('footer_link_free_kundli')}</FooterLink>
            <FooterLink to="/generate" state={{ topic: 'career' }}>{t('footer_link_career')}</FooterLink>
            <FooterLink to="/generate" state={{ topic: 'relationship' }}>{t('footer_link_relationship')}</FooterLink>
            <FooterLink to="/generate" state={{ topic: 'health' }}>{t('footer_link_health')}</FooterLink>
            <FooterLink to="/generate" state={{ topic: 'finance' }}>{t('footer_link_finance')}</FooterLink>
          </ul>
        </FooterColumn>

        {/* Learn — Zodiac/Nakshatra/Dasha still stay as "#" deliberately:
            the individual guide pages don't exist yet, so pointing them
            anywhere would just be a different kind of dead link (see
            components/knowledge/ for the shared infra those pages will
            use once built). The Knowledge Center hub itself is real now
            (/learn), so it gets a proper link, and once each guide ships
            its "#" above should become e.g. "/learn/zodiac". */}
        <FooterColumn heading={t('footer_learn_heading')}>
          <ul className="space-y-2.5">
            <FooterLink to="/learn">{t('footer_link_knowledge_center', 'Knowledge Center')}</FooterLink>
            <FooterLink to="#">{t('footer_link_zodiac')}</FooterLink>
            <FooterLink to="#">{t('footer_link_nakshatra')}</FooterLink>
            <FooterLink to="#">{t('footer_link_dasha')}</FooterLink>
            <FooterLink to="/blog">{t('footer_link_blog')}</FooterLink>
            <FooterLink to="/faq">{t('footer_link_faq')}</FooterLink>
          </ul>
        </FooterColumn>

        {/* Company + minimal contact (room left to add phone/address as
            extra <li> rows later — no restructuring needed). "How it
            works" now points at the real 3-step section already on the
            landing page (id="how-it-works", see Landing.jsx) instead of a
            dead "#" — that section's content already answers the
            question, so this just makes it reachable from anywhere
            instead of building a second copy of the same explanation as
            a standalone page. Pricing stays "#" — there's genuinely no
            pricing to show yet (pre-revenue, see README). */}
        <div>
          <h3 className="text-xs font-semibold tracking-wide uppercase text-primary-light mb-3">{t('footer_company_heading')}</h3>
          <ul className="space-y-2.5">
            <FooterLink to="/about">{t('footer_link_about')}</FooterLink>
            <FooterLink to="/#how-it-works">{t('footer_link_how_it_works')}</FooterLink>
            <FooterLink to="/pricing">{t('footer_link_pricing')}</FooterLink>
            <FooterLink to="/contact">{t('footer_link_contact')}</FooterLink>
          </ul>
          <h3 className="text-xs font-semibold tracking-wide uppercase text-primary-light mt-6 mb-2">{t('footer_contact_heading')}</h3>
          <ul className="space-y-2 text-sm text-ink-onnight/80">
            <li className="flex items-center gap-1.5">✉️ contact@starjyotish.com</li>
          </ul>
        </div>
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
          <Link to="/privacy#cookies" className="hover:text-primary transition">{t('footer_bottom_cookie')}</Link>
          <Link to="/terms" className="hover:text-primary transition">{t('footer_bottom_terms')}</Link>
          <Link to="/refund-policy" className="hover:text-primary transition">{t('footer_bottom_refund')}</Link>
          <Link to="/disclaimer" className="hover:text-primary transition">{t('footer_bottom_disclaimer')}</Link>
        </div>
        <p className="text-ink-onnight/50 text-center">
          {t('footer_copyright', { year })} · {t('footer_powered_by')}
        </p>
        {/* Same EN/हि pattern used in the hero and sticky header */}
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
