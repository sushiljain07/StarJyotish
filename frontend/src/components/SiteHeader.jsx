// frontend/src/components/SiteHeader.jsx
//
// Fixed header present from first paint. Transparent/glass at the top,
// solidifies as you scroll (driven by scrollProgress 0–1).
//
// Layer 1 product nav (Home/Learn/Generate Chart) was removed from the
// desktop header in SJ-009 — mobile already had a better pattern (Kundli
// pill between language/profile), and the desktop nav strip was visually
// redundant with the logo/CTA and added clutter to every page. The
// header now focuses on: logo, language toggle, sign-in/account.
// The onCtaClick CTA button is kept for Landing's hero, shown at all
// widths (no longer needs md:hidden since there's no duplicate nav link).
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AccountMenu from './AccountMenu'

// rgb(23, 27, 51) is tailwind.config.js's night.DEFAULT (#171B33) spelled
// out as channels — needed in rgba() form here since the alpha itself is
// what's being interpolated continuously.
const NIGHT_RGB = '23, 27, 51'

export default function SiteHeader({ scrollProgress = 1, onCtaClick, showLanguageToggle = true }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const otherLang = i18n.language.startsWith('en') ? 'hi' : 'en'

  const p = Math.min(1, Math.max(0, scrollProgress))
  const bgAlpha    = 0.15 + p * 0.80
  const blurPx     = 6 + p * 6
  const borderAlpha = p * 0.10
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
