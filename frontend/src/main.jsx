import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './i18n/index.js'
import './index.css'
import App from './App.jsx'
import { initSentry, SentryErrorBoundary } from './monitoring.js'
import ErrorFallback from './components/ErrorFallback.jsx'
import { removeLegacyStorage } from './legacyCleanup.js'
import { GOOGLE_CLIENT_ID, GOOGLE_ENABLED } from './config/google.js'

initSentry()
removeLegacyStorage()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Works as a plain error boundary even with Sentry uninitialized
        (VITE_SENTRY_DSN unset) — it just won't report anywhere in that
        case. Catches render errors anywhere below it instead of the
        previous behavior (uncaught error -> blank white page). */}
    <SentryErrorBoundary fallback={({ resetError }) => <ErrorFallback resetError={resetError} />}>
      <HelmetProvider>
        {GOOGLE_ENABLED ? (
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <App />
          </GoogleOAuthProvider>
        ) : (
          <App />
        )}
      </HelmetProvider>
    </SentryErrorBoundary>
  </StrictMode>
)
