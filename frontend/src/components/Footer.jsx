// frontend/src/components/Footer.jsx
//
// Site-wide footer — sits at the bottom of Landing.jsx today, written to be
// dropped onto any other page later (e.g. Disclaimer.jsx already does).
// Every color/spacing/radius choice below is an existing token from
// tailwind.config.js or a pattern copied from Landing.jsx / BirthForm.jsx —
// see inline notes. No new design decisions were made for this component.
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Same capability badges already shown in the hero (services/topic.js has no
// "trust" claims of its own, and these are the only ones the app can back up
// honestly today — see Landing.jsx's BADGES comment). Reusing them here
// instead of inventing new unverified claims like "Astrologer Verified" or
// a star rating, which don't apply yet (no marketplace, no review data).
const TRUST_BADGES = ['landing_badge_accuracy', 'landing_badge_free', 'landing_badge_bilingual', 'landing_badge_ai']
const PAYMENT_PLACEHOLDERS = ['Razorpay', 'UPI', 'Visa', 'Mastercard']
// Same stroke-icon convention as TabIcon.jsx (viewBox 24, stroke="currentColor",
// fill="none", with small filled accents) — kept here since these are
// one-off social glyphs, not shared elsewhere like TabIcon's tab set.
const SOCIAL_ICONS = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  x: <path d="M4 4l16 16M20 4L4 20" />,
  youtube: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="3" />
      <path d="M10.5 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M14 8.7h-1.3c-.9 0-1.4.5-1.4 1.4V12h2.4l-.3 2.2h-2.1V19h-2.2v-4.8H9V12h1.7v-2.2c0-1.8 1.1-3.1 3-3.1H14z" fill="currentColor" stroke="none" />
    </>
  ),
}

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

function SocialButton({ icon }) {
  // Placeholders only — no links yet, per the brief.
  return (
    <button
      type="button"
      aria-label={icon}
      className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-ink-onnight hover:text-primary hover:border-primary/40 transition"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        {SOCIAL_ICONS[icon]}
      </svg>
    </button>
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
          <div className="flex gap-2">
            {Object.keys(SOCIAL_ICONS).map(id => <SocialButton key={id} icon={id} />)}
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-xs font-semibold tracking-wide uppercase text-primary-light mb-3">{t('footer_services_heading')}</h3>
          <ul className="space-y-2.5">
            <FooterLink to="/generate">{t('footer_link_free_kundli')}</FooterLink>
            <FooterLink to="/generate" state={{ topic: 'career' }}>{t('footer_link_career')}</FooterLink>
            <FooterLink to="/generate" state={{ topic: 'relationship' }}>{t('footer_link_relationship')}</FooterLink>
            <FooterLink to="/generate" state={{ topic: 'health' }}>{t('footer_link_health')}</FooterLink>
            <FooterLink to="/generate" state={{ topic: 'finance' }}>{t('footer_link_finance')}</FooterLink>
          </ul>
        </div>

        {/* Learn */}
        <div>
          <h3 className="text-xs font-semibold tracking-wide uppercase text-primary-light mb-3">{t('footer_learn_heading')}</h3>
          <ul className="space-y-2.5">
            <FooterLink to="#">{t('footer_link_zodiac')}</FooterLink>
            <FooterLink to="#">{t('footer_link_nakshatra')}</FooterLink>
            <FooterLink to="#">{t('footer_link_dasha')}</FooterLink>
            <FooterLink to="#">{t('footer_link_blog')}</FooterLink>
            <FooterLink to="/#faq">{t('footer_link_faq')}</FooterLink>
          </ul>
        </div>

        {/* Company + minimal contact (room left to add phone/address as
            extra <li> rows later — no restructuring needed) */}
        <div>
          <h3 className="text-xs font-semibold tracking-wide uppercase text-primary-light mb-3">{t('footer_company_heading')}</h3>
          <ul className="space-y-2.5">
            <FooterLink to="#">{t('footer_link_about')}</FooterLink>
            <FooterLink to="#">{t('footer_link_how_it_works')}</FooterLink>
            <FooterLink to="#">{t('footer_link_pricing')}</FooterLink>
            <li>
              <a href="mailto:info.starjyotish@gmail.com" className="text-ink-onnight/80 hover:text-primary text-sm transition flex items-center gap-1.5">
                <span className="text-primary/50 text-xs">›</span>{t('footer_link_contact')}
              </a>
            </li>
          </ul>
          <h3 className="text-xs font-semibold tracking-wide uppercase text-primary-light mt-6 mb-2">{t('footer_contact_heading')}</h3>
          <ul className="space-y-2 text-sm text-ink-onnight/80">
            <li className="flex items-center gap-1.5">✉️ info.starjyotish@gmail.com</li>
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
          <Link to="#" className="hover:text-primary transition">{t('footer_bottom_privacy')}</Link>
          <Link to="#" className="hover:text-primary transition">{t('footer_bottom_cookie')}</Link>
          <Link to="#" className="hover:text-primary transition">{t('footer_bottom_terms')}</Link>
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
