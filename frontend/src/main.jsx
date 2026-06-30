import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './i18n/index.js'
import './index.css'
import App from './App.jsx'

// Empty string rather than throwing when unset, so the app still boots
// for local dev before Google Cloud credentials exist — the Google
// button itself just won't render a usable client until this is set
// (see frontend/.env.example), same "degrade gracefully without optional
// config" pattern as VITE_PAYWALL_ENABLED/config/auth.js elsewhere here.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </HelmetProvider>
  </StrictMode>
)
