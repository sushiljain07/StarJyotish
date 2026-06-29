// frontend/src/components/auth/GoogleLoginButton.jsx
//
// Renders Google's own "Sign in with Google" button via the official
// Identity Services SDK (@react-oauth/google) — this backend never sees a
// password or handles the Google OAuth dance itself; it only ever
// receives the signed ID token Google's button hands back, and verifies
// that server-side (backend/services/google_oauth.py). Needs
// <GoogleOAuthProvider clientId="..."> somewhere above it in the tree —
// see main.jsx.
import { GoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'

export default function GoogleLoginButton({ onSuccess }) {
  const { t } = useTranslation()
  const { loginWithGoogleToken } = useAuth()
  const [error, setError] = useState('')

  return (
    <div className="space-y-2">
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            setError('')
            try {
              const user = await loginWithGoogleToken(credentialResponse.credential)
              onSuccess?.(user)
            } catch {
              setError(t('login_google_failed'))
            }
          }}
          onError={() => setError(t('login_google_failed'))}
          shape="pill"
          theme="outline"
          text="continue_with"
        />
      </div>
      {error && <p className="text-vermillion text-sm text-center">{error}</p>}
    </div>
  )
}
