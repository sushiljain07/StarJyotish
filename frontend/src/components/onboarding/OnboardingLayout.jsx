// frontend/src/components/onboarding/OnboardingLayout.jsx
//
// Shared shell for every onboarding screen. Deliberately its own minimal
// header rather than <SiteHeader> — the account menu, language toggle,
// and marketing CTA that make sense everywhere else would just be noise
// in the middle of a guided flow the person is meant to complete in one
// sitting. Only three things ever live up here: a way back one step, the
// wordmark, and (while it's still allowed) a way out entirely.
import CelestialBackdrop from '../CelestialBackdrop'

export default function OnboardingLayout({ onBack, onSkip, skipLabel, children }) {
  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="w-20">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back"
              className="text-ink-muted hover:text-ink -ml-2 p-2 rounded-full hover:bg-line/40 transition"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                   strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <img src="/starjyotish.svg" alt="" className="w-5 h-5" />
          <span className="font-serif font-semibold text-sm text-ink-muted">Star Jyotish</span>
        </div>

        <div className="w-20 text-right">
          {onSkip && (
            <button onClick={onSkip} className="text-ink-faint hover:text-primary-dark text-xs font-medium transition">
              {skipLabel}
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-6 -z-10 overflow-hidden rounded-3xl">
            <CelestialBackdrop className="text-primary/[0.12]" />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
