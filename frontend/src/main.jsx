import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './i18n/index.js'
import './index.css'
import App from './App.jsx'
import { initSentry, SentryErrorBoundary } from './monitoring.js'
import ErrorFallback from './components/ErrorFallback.jsx'

initSentry()

// Empty string rather than throwing when unset, so the app still boots
// for local dev before Google Cloud credentials exist — the Google
// button itself just won't render a usable client until this is set
// (see frontend/.env.example), same "degrade gracefully without optional
// config" pattern as VITE_PAYWALL_ENABLED/config/auth.js elsewhere here.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Works as a plain error boundary even with Sentry uninitialized
        (VITE_SENTRY_DSN unset) — it just won't report anywhere in that
        case. Catches render errors anywhere below it instead of the
        previous behavior (uncaught error -> blank white page). */}
    <SentryErrorBoundary fallback={({ resetError }) => <ErrorFallback resetError={resetError} />}>
      <HelmetProvider>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      </HelmetProvider>
    </SentryErrorBoundary>
  </StrictMode>
)
