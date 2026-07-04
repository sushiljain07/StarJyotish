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
//
// That transition is driven by `scrollProgress` — a continuous 0–1 value
// (see hooks/useScrollProgress.js), not a snap between two fixed states.
// An earlier version used a plain boolean here, which read as a hard cut:
// hero content (the capability badges, specifically) stayed crisply
// visible right up against the header's edge, then a visibly different
// background appeared the instant a scroll threshold was crossed.
// Interpolating background opacity *and* blur strength against scroll
// position fixes both problems at once — the header solidifies
// gradually as you actually scroll, and a blur floor even at
// progress = 0 means hero content behind the header is always softened
// rather than legible-but-cut-off, which is what made the old transition
// look like a glitch rather than glass.
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AccountMenu from './AccountMenu'

// rgb(23, 27, 51) is tailwind.config.js's night.DEFAULT (#171B33) spelled
// out as channels — needed in rgba() form here since the alpha itself is
// what's being interpolated, which Tailwind's bg-night/NN utility classes
// can't do continuously (they're a fixed set of opacity steps, not a
// range).
const NIGHT_RGB = '23, 27, 51'

export default function SiteHeader({ scrollProgress = 1, onCtaClick, showLanguageToggle = true }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Single-button toggle (shows the *other* language, switches to it on
  // click) instead of two separate EN/HI pills — half the width, and this
  // header already has more controls competing for room (account menu,
  // CTA) than the old hero-only toggle did.
  const otherLang = i18n.language.startsWith('en') ? 'hi' : 'en'

  const p = Math.min(1, Math.max(0, scrollProgress))
  const bgAlpha = 0.15 + p * 0.80          // .15 at the very top, .95 once fully scrolled — matches the old bg-night/95 end state
  const blurPx = 6 + p * 6                 // 6px floor even at the top so hero content behind never renders crisp, 12px once solid
  const borderAlpha = p * 0.10             // hairline only appears once mostly solid
  const shadowAlpha = p * 0.12

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 border-b transition-[background-color,backdrop-filter,box-shadow,border-color] duration-150 ease-out"
      style={{
        backgroundColor: `rgba(${NIGHT_RGB}, ${bgAlpha})`,
        backdropFilter: `blur(${blurPx}px)`,
        WebkitBackdropFilter: `blur(${blurPx}px)`,
        borderColor: `rgba(255, 255, 255, ${borderAlpha})`,
        boxShadow: `0 1px 8px rgba(0, 0, 0, ${shadowAlpha})`,
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(isAuthenticated ? '/home' : '/')}
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
