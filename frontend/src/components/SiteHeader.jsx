// frontend/src/components/SiteHeader.jsx
//
// Fixed top header. Always renders at full opacity in the night colour —
// consistent across every page whether the page background behind it is
// dark (Landing hero) or light (PersonalHome parchment).
//
// scrollProgress still wires into blur and a slight border accent, giving
// the Landing page's hero a subtle deepening effect as you scroll past —
// but the background colour itself no longer fades in. That fading caused
// the header to look beige/grey at the top of light-background pages
// because the partially-transparent night colour was compositing against
// the warm parchment behind it.
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AccountMenu from './AccountMenu'

export default function SiteHeader({ scrollProgress = 1, onCtaClick, showLanguageToggle = true }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const otherLang = i18n.language.startsWith('en') ? 'hi' : 'en'
  const p = Math.min(1, Math.max(0, scrollProgress))

  // Background: always full night. Blur and border accent subtly increase
  // as the user scrolls, giving a frosted-glass lift without any colour shift.
  const blurPx      = 6 + p * 6
  const borderAlpha = 0.06 + p * 0.08

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 bg-night border-b transition-[backdrop-filter,border-color] duration-150 ease-out"
      style={{
        backdropFilter:       `blur(${blurPx}px)`,
        WebkitBackdropFilter: `blur(${blurPx}px)`,
        borderColor: `rgba(255, 255, 255, ${borderAlpha})`,
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(isAuthenticated ? '/home' : '/')}
          className="flex items-center gap-2 shrink-0"
          aria-label={t('app_title')}
        >
          <img src="/starjyotish.svg" alt="" className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="font-serif font-semibold text-lg sm:text-xl text-primary-light">
            {t('app_title')}
          </span>
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
