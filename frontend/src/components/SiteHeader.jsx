// frontend/src/components/SiteHeader.jsx
//
// Fixed header. Two background modes:
//   dark=true  (default) — page has a dark hero behind the header. Header
//              text stays light throughout; background solidifies on scroll.
//   dark=false — page background is light parchment. At the top the header
//              is transparent, so its foreground must be DARK to stay
//              readable; as the night background fades in on scroll the
//              foreground crossfades to the light-on-dark palette.
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

  const bgAlpha     = dark ? 0.15 + p * 0.80 : p * 0.95
  const blurPx      = 6 + p * 6
  const borderAlpha = dark ? p * 0.10 : p * 0.08

  // Foreground colours. On dark pages: always light. On light pages:
  // dark ink at the top, crossfading to light as the night bg solidifies.
  // The crossfade midpoint (p=0.5) is where the night bg is ~50% opaque,
  // which is exactly when light text becomes more readable than dark.
  const onDark = dark || p > 0.5
  const titleColor  = onDark ? 'text-primary-light' : 'text-night'
  const pillClasses = onDark
    ? 'bg-white/10 hover:bg-white/20 text-ink-onnight'
    : 'bg-night/10 hover:bg-night/20 text-night'

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 border-b transition-[background-color,backdrop-filter,box-shadow,border-color] duration-150 ease-out"
      style={{
        backgroundColor: `rgba(${NIGHT_RGB}, ${bgAlpha})`,
        backdropFilter:       `blur(${blurPx}px)`,
        WebkitBackdropFilter: `blur(${blurPx}px)`,
        borderColor: onDark ? `rgba(255,255,255,${borderAlpha})` : `rgba(${NIGHT_RGB},0.08)`,
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(isAuthenticated ? '/home' : '/')}
          className="flex items-center gap-2 shrink-0"
          aria-label={t('app_title')}
        >
          <img src="/starjyotish.svg" alt="" className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className={`font-serif font-semibold text-lg sm:text-xl transition-colors duration-150 ${titleColor}`}>
            {t('app_title')}
          </span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {showLanguageToggle && (
            <button
              onClick={() => i18n.changeLanguage(otherLang)}
              className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-full transition ${pillClasses}`}
            >
              {otherLang === 'en' ? 'EN' : 'हि'}
            </button>
          )}

          {!isAuthenticated && (
            <button
              onClick={() => navigate('/login')}
              className={`text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition ${pillClasses}`}
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
