// frontend/src/components/SiteHeader.jsx
//
// Replaces LandingStickyHeader.jsx's "appear only after scrolling past the
// hero" pattern, which left the page with *no* persistent navigation at
// all for as long as the visitor was looking at the hero — a real bug,
// not just a style preference, since it meant the only way to reach
// /login, switch language, or trigger the CTA before scrolling was to
// already know those things existed somewhere below.
//
// This header is mounted once, fixed at the top, for the entire app
// lifetime. What changes on scroll is its *style*, not its presence:
//   - At the top: transparent / glass, blending into whatever's behind it
//     (the dark hero on Landing, or a page's own background elsewhere) —
//     deliberately minimal so it doesn't compete with a hero moment.
//   - Scrolled: solidifies into an opaque dark bar with a hard edge,
//     exactly like the old sticky header looked once visible.
// The transition between the two is a plain CSS background/border
// transition, not a swap between two different components — there's only
// ever one header in the DOM.
//
// `scrolled` is passed in by the page (Landing.jsx reuses the same
// IntersectionObserver-driven boolean it already had for other
// scroll-aware UI) rather than this component owning its own scroll
// listener — pages without a tall hero (e.g. Profile.jsx) can just pass
// `scrolled` as always-true and get the solid style from pixel zero,
// which is the right default anywhere that isn't a dramatic landing hero.
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AccountMenu from './AccountMenu'

export default function SiteHeader({ scrolled = true, onCtaClick, showLanguageToggle = true }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Single-button toggle (shows the *other* language, switches to it on
  // click) instead of two separate EN/HI pills — half the width, and this
  // header already has more controls competing for room (account menu,
  // CTA) than the old hero-only toggle did.
  const otherLang = i18n.language.startsWith('en') ? 'hi' : 'en'

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        scrolled
          ? 'bg-night/95 backdrop-blur border-b border-white/10 shadow-sm'
          : 'bg-night/25 backdrop-blur-sm border-b border-white/0'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 shrink-0"
          aria-label={t('app_title')}
        >
          <img src="/starjyotish.svg" alt="" className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="font-serif font-semibold text-lg sm:text-xl text-primary-light">{t('app_title')}</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {showLanguageToggle && (
            <button
              onClick={() => i18n.changeLanguage(otherLang)}
              className="bg-white/10 hover:bg-white/20 text-ink-onnight text-[11px] font-semibold px-2.5 py-1.5 rounded-full transition"
            >
              {otherLang === 'en' ? 'EN' : 'हि'}
            </button>
          )}

          {!isAuthenticated && (
            <button
              onClick={() => navigate('/login')}
              className="bg-white/10 hover:bg-white/20 text-ink-onnight hover:text-primary-light text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition"
            >
              {t('nav_sign_in')}
            </button>
          )}

          {onCtaClick && (
            <button
              onClick={onCtaClick}
              className="bg-primary hover:bg-primary-dark text-night text-xs font-semibold px-3 sm:px-3.5 py-1.5 rounded-full transition whitespace-nowrap"
            >
              <span className="sm:hidden">{t('nav_cta_mobile')}</span>
              <span className="hidden sm:inline">{t('nav_cta_compact')}</span>
            </button>
          )}

          {isAuthenticated && <AccountMenu />}
        </div>
      </div>
    </header>
  )
}
