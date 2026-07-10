// frontend/src/components/SiteHeader.jsx
//
// Fixed top header — logo + sign-in/CTA/account only.
// Language switching lives in the Footer bottom bar (EN / हि buttons).
// Nav links (Knowledge, Pricing, Blog) live in the Footer and BottomNav.
// Keeping the header minimal reduces cognitive load and visual noise
// at the top of every page.
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AccountMenu from './AccountMenu'

export default function SiteHeader({ scrollProgress = 1, onCtaClick }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const p = Math.min(1, Math.max(0, scrollProgress))

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
