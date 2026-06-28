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
        {/* Exact same file as the hero logo, just shown smaller — that's
            what keeps the two permanently in sync instead of two
            separately-maintained "versions" of the brand. Most of the
            wordmark renders in white/cream, so this bar stays dark
            (rather than the light parchment card it was before) — on a
            light background most of the logo would be unreadable. */}
        <img
          src="/starjyotish-logo.webp"
          alt="Star Jyotish"
          width={667}
          height={297}
          className="h-9 sm:h-10 w-auto shrink-0"
        />

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
