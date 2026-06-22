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
      className={`fixed top-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <img src="/astroguru.svg" alt="AstroGuru" className="w-6 h-6 shrink-0" />
          <span className="font-bold text-slate-800 text-sm truncate">{t('app_title')}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex gap-1">
            {['en', 'hi'].map(lang => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-2 py-1 rounded-full text-[11px] font-semibold transition ${
                  currentLanguage.startsWith(lang)
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {lang === 'en' ? 'EN' : 'हि'}
              </button>
            ))}
          </div>
          <button
            onClick={onCtaClick}
            className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold px-3.5 py-1.5 rounded-full transition"
          >
            {t('landing_cta_generic')}
          </button>
        </div>
      </div>
    </div>
  )
}
