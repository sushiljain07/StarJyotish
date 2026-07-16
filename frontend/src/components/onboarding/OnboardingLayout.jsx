// frontend/src/components/onboarding/OnboardingLayout.jsx
//
// Shared wizard chrome for every onboarding screen, rendered inside the
// app shell (WorkspaceLayout provides SiteHeader, background, and footer).
// This row carries only the wizard's own controls: a way back one step
// and (while it's still allowed) a way out entirely. The wordmark that
// used to sit between them is gone — the shell's header directly above
// already shows it.
import CelestialBackdrop from '../CelestialBackdrop'

export default function OnboardingLayout({ onBack, onSkip, skipLabel, children }) {
  return (
    <div className="flex-1 flex flex-col">
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
