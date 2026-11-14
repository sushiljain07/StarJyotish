// frontend/src/components/ScrollToTop.jsx
//
// Floating "back to top" button. On mobile it floats just above the fixed
// bottom bars (the same height BottomChromeSpacer reserves) so it never covers
// footer links. It is not rendered at all on routes that show the Ask FAB:
// the FAB takes priority.
import { useTranslation } from 'react-i18next'
import { useBottomChrome } from './layout/useBottomChrome'

export default function ScrollToTop({ visible }) {
  const { t } = useTranslation()
  const { spacerHeight, hasFab } = useBottomChrome()
  if (hasFab) return null
  const bottom = `calc(${spacerHeight} + 0.75rem)`
  return (
    <button
      style={{ '--stt-bottom': bottom }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t('scroll_to_top_label')}
      className={`fixed bottom-[var(--stt-bottom)] md:bottom-5 right-[max(1.25rem,var(--safe-right))] z-40 w-11 h-11 rounded-full bg-primary hover:bg-primary-dark text-night shadow-lg flex items-center justify-center transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}
