// frontend/src/components/SiteHeader.jsx
//
// Fixed header. Transparent at top of page, solidifies as the user scrolls.
//
// Two background modes:
//   dark=true  (default) — page has a dark/night hero behind the header
//              (Landing, Generate Chart, Result.jsx). At scroll=0 the night
//              background shows through at low opacity; as the user scrolls
//              it solidifies to an opaque night strip.
//   dark=false — page has a light/parchment background (PersonalHome,
//              Profile, Learn, static pages). At scroll=0 the header is
//              nearly invisible against the parchment; as the user scrolls
//              it solidifies to the same night strip. This prevents the
//              muddy grey artefact that appeared when rgba(night, 0.15)
//              rendered on top of the warm parchment colour.
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AccountMenu from './AccountMenu'

const NIGHT_RGB = '23, 27, 51'  // tailwind night.DEFAULT #171B33

export default function SiteHeader({ scrollProgress = 1, onCtaClick, showLanguageToggle = true, dark = true }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const otherLang = i18n.language.startsWith('en') ? 'hi' : 'en'
  const p = Math.min(1, Math.max(0, scrollProgress))

  // On dark backgrounds the header starts at 15% opacity and climbs to 95%.
  // On light (parchment) backgrounds, we start at 0% so there is no grey
  // artefact at the very top, and climb to the same 95% as you scroll down.
  const bgAlpha     = dark ? 0.15 + p * 0.80 : p * 0.95
  const blurPx      = 6 + p * 6
  const borderAlpha = dark ? p * 0.10 : p * 0.08

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 border-b transition-[background-color,backdrop-filter,box-shadow,border-color] duration-150 ease-out"
      style={{
        backgroundColor: `rgba(${NIGHT_RGB}, ${bgAlpha})`,
        backdropFilter:         `blur(${blurPx}px)`,
        WebkitBackdropFilter:   `blur(${blurPx}px)`,
        borderColor: `rgba(255, 255, 255, ${borderAlpha})`,
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Logo — brand mark only, links to home/landing */}
        <button
          onClick={() => navigate(isAuthenticated ? '/home' : '/')}
          className="flex items-center gap-2 shrink-0"
          aria-label={t('app_title')}
        >
          <img src="/starjyotish.svg" alt="" className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="font-serif font-semibold text-lg sm:text-xl text-primary-light">{t('app_title')}</span>
        </button>

        {/* Right-side controls */}
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
