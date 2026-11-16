// frontend/src/components/ErrorFallback.jsx
//
// Fallback UI for the top-level Sentry.ErrorBoundary in main.jsx. Before
// this existed, any uncaught render error anywhere in the component tree
// (a bad chart payload, a null-reference in one of the 15+ chart panels on
// Result.jsx, etc.) unmounted the entire app to a blank white screen with
// no way to recover except a manual refresh — and no report of what broke.
// This codebase doesn't use prop-types (450+ pre-existing instances of
// this same lint warning elsewhere), so match that convention here too.
import { useTranslation } from 'react-i18next'
import { Button } from './ui'

// eslint-disable-next-line react/prop-types
export default function ErrorFallback({ resetError }) {
  const { t } = useTranslation()
  return (
    <div className="min-h-dvh bg-parchment flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <p className="text-primary-ink text-xs font-bold tracking-wide uppercase mb-2">
          {t('error_fallback_eyebrow')}
        </p>
        <h1 className="font-serif font-semibold text-2xl text-ink mb-3">
          {t('error_fallback_title')}
        </h1>
        <p className="text-ink-muted text-sm leading-relaxed mb-6">
          {t('error_fallback_body')}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => {
              resetError()
              window.location.reload()
            }}
          >
            {t('error_fallback_reload')}
          </Button>
          <Button variant="outline" href="/">
            {t('error_fallback_home')}
          </Button>
        </div>
      </div>
    </div>
  )
}
