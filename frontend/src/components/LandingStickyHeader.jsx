// frontend/src/components/LandingStickyHeader.jsx
//
// On a single-screen landing page a sticky header is unnecessary noise —
// it's only worth it once there's real scroll depth to outrun. Mounted by
// Landing.jsx alongside a sentinel placed right after the hero; visibility
// is driven by that sentinel leaving the viewport, not a raw scroll-Y
// threshold, so it stays correct regardless of hero height changes.
import { useTranslation } from 'react-i18next'

export default function LandingStickyHeader({ visible, onLanguageChange, currentLanguage, onCtaClick }) {
  const { t } = useTranslation()

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
          <button
            onClick={onCtaClick}
            className="bg-primary hover:bg-primary-dark text-night text-xs font-semibold px-3.5 py-1.5 rounded-full transition"
          >
            {t('landing_cta_generic')}
          </button>
        </div>
      </div>
    </div>
  )
}
