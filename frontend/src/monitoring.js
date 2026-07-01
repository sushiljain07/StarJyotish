// Error monitoring — opt-in, same "degrade gracefully without optional
// config" pattern as VITE_GOOGLE_CLIENT_ID / VITE_LOGIN_REQUIRED elsewhere
// in this app. With VITE_SENTRY_DSN unset, initSentry() is a no-op.
//
// Get a DSN from https://sentry.io -> new Project -> React -> Settings ->
// Client Keys, then set VITE_SENTRY_DSN in Vercel's project env vars (and
// optionally .env.production for a local production build/preview).
import * as Sentry from '@sentry/react'

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Kept at 0 to start — this only captures exceptions, not performance
    // traces, which is the highest-value/lowest-cost place to start on
    // Sentry's free tier. Raise later if you want tracing too.
    tracesSampleRate: 0,
  })
}

export const SentryErrorBoundary = Sentry.ErrorBoundary
