// frontend/src/pages/Login.jsx
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Seo from '../components/Seo'
import CelestialBackdrop from '../components/CelestialBackdrop'
import PhoneOtpForm from '../components/auth/PhoneOtpForm'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()

  const next = location.state?.next || '/'

  // Already logged in (e.g. browser back button after a successful
  // login) — no reason to show the form again.
  if (isAuthenticated) {
    const role = user?.role
    navigate(role === 'admin' ? '/admin' : role === 'astrologer' ? '/astrologer' : next, { replace: true })
    return null
  }

  function handleSuccess(loggedInUser) {
    const role = loggedInUser?.role
    navigate(role === 'admin' ? '/admin' : role === 'astrologer' ? '/astrologer' : next, { replace: true })
  }

  return (
    <div className="min-h-screen bg-night flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <Seo title={t('login_title')} description={t('login_seo_description')} path="/login" noindex />
      <CelestialBackdrop className="text-primary opacity-30 absolute inset-0" />

      <div className="relative w-full max-w-sm bg-parchment-card rounded-2xl shadow-xl p-6 sm:p-8">
        <Link to="/" className="block text-center mb-5">
          <img src="/starjyotish.svg" alt="Star Jyotish" className="w-12 h-12 mx-auto mb-2" />
        </Link>
        <h1 className="font-serif font-semibold text-2xl text-ink text-center mb-1">{t('login_title')}</h1>
        <p className="text-ink-muted text-sm text-center mb-6">{t('login_subtitle')}</p>

        <PhoneOtpForm onSuccess={handleSuccess} />

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-line" />
          <span className="text-ink-faint text-xs uppercase tracking-wide">{t('login_or')}</span>
          <div className="flex-1 h-px bg-line" />
        </div>

        <GoogleLoginButton onSuccess={handleSuccess} />

        <p className="text-ink-faint text-xs text-center mt-6">{t('login_disclaimer')}</p>
      </div>
    </div>
  )
}
