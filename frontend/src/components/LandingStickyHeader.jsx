// frontend/src/components/LandingStickyHeader.jsx
//
// On a single-screen landing page a sticky header is unnecessary noise —
// it's only worth it once there's real scroll depth to outrun. Mounted by
// Landing.jsx alongside a sentinel placed right after the hero; visibility
// is driven by that sentinel leaving the viewport, not a raw scroll-Y
// threshold, so it stays correct regardless of hero height changes.
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LandingStickyHeader({ visible, onLanguageChange, currentLanguage, onCtaClick }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <div
      className={`fixed top-0 inset-x-0 z-30 bg-night/95 backdrop-blur border-b border-white/10 shadow-sm transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Was the same webp wordmark used in the hero, shown smaller — but
            that artwork has a soft glow/shadow baked in by design (it's
            meant to be looked at large). Shrunk down to header height, the
            glow doesn't shrink the way sharp edges would, so it reads as
            blurry rather than refined. Switched to the SVG mark (vector —
            crisp at any size) + real text (browser-rendered, never soft),
            the same pairing already used for the brand in Footer.jsx. */}
        <div className="flex items-center gap-2 shrink-0">
          <img src="/starjyotish.svg" alt="" className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="font-serif font-semibold text-lg sm:text-xl text-primary-light">{t('app_title')}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex gap-1">
            {['en', 'hi'].map(lang => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-2 py-1 rounded-full text-[11px] font-semibold transition ${
                  currentLanguage.startsWith(lang)
                    ? 'bg-primary text-night'
                    : 'bg-white/10 text-ink-onnight hover:bg-white/20'
                }`}
              >
                {lang === 'en' ? 'EN' : 'हि'}
              </button>
            ))}
          </div>

          {/* Account control — swaps between "Sign in" and a name/Logout
              pair based on AuthContext, same pattern as the hero's
              top-bar version (see Landing.jsx). Name falls back to the
              phone number when no name has been set yet (the common case
              right after OTP signup, before a profile edit).
              On mobile, the sticky header is already tight (brand +
              language toggle + this + the CTA button all compete for one
              row), so the *name* hides below `sm` — the action (Sign in /
              Logout) stays visible at every width, since that's what
              actually needs to be reachable, not the identity label. */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline text-ink-onnight text-xs max-w-[8rem] truncate">
                {user?.name || user?.phone_number || user?.email}
              </span>
              <button
                onClick={() => logout()}
                className="bg-white/10 hover:bg-white/20 text-ink-onnight hover:text-primary-light text-[11px] font-semibold px-2.5 py-1 rounded-full transition"
              >
                {t('nav_logout')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-white/10 hover:bg-white/20 text-ink-onnight hover:text-primary-light text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition"
            >
              {t('nav_sign_in')}
            </button>
          )}

          {/* "nav_cta_compact" rather than the hero's full "Generate My
              Free Kundli" label — this row also carries the full
              wordmark text and the Sign in/Logout control now, and the
              long CTA label was the thing actually forcing a choice
              between showing the brand name and showing those controls.
              Shortening the CTA here (only here — the hero keeps its
              full label) was the better trade than hiding the wordmark. */}
          <button
            onClick={onCtaClick}
            className="bg-primary hover:bg-primary-dark text-night text-xs font-semibold px-3.5 py-1.5 rounded-full transition"
          >
            {t('nav_cta_compact')}
          </button>
        </div>
      </div>
    </div>
  )
}
