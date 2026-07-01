// frontend/src/components/ErrorFallback.jsx
//
// Fallback UI for the top-level Sentry.ErrorBoundary in main.jsx. Before
// this existed, any uncaught render error anywhere in the component tree
// (a bad chart payload, a null-reference in one of the 15+ chart panels on
// Result.jsx, etc.) unmounted the entire app to a blank white screen with
// no way to recover except a manual refresh — and no report of what broke.
// This codebase doesn't use prop-types (450+ pre-existing instances of
// this same lint warning elsewhere), so match that convention here too.
// eslint-disable-next-line react/prop-types
export default function ErrorFallback({ resetError }) {
  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <p className="text-primary-dark text-xs font-bold tracking-wide uppercase mb-2">
          Something went wrong
        </p>
        <h1 className="font-serif font-semibold text-2xl text-ink mb-3">
          This page hit an unexpected error
        </h1>
        <p className="text-ink-muted text-sm leading-relaxed mb-6">
          It&apos;s been reported automatically. Try reloading the page — if it
          keeps happening, head back to the homepage and try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              resetError()
              window.location.reload()
            }}
            className="px-5 py-2.5 rounded-lg bg-primary-dark text-white text-sm font-semibold hover:opacity-90 transition"
          >
            Reload page
          </button>
          <a
            href="/"
            className="px-5 py-2.5 rounded-lg border border-primary-dark/30 text-primary-dark text-sm font-semibold hover:bg-primary-dark/5 transition"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}
