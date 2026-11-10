// frontend/src/pages/Login.jsx
import { Navigate, useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Seo from '../components/Seo'
import CelestialBackdrop from '../components/CelestialBackdrop'
import PhoneOtpForm from '../components/auth/PhoneOtpForm'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'
import { useAuth } from '../contexts/AuthContext'

// Decides where a signed-in visitor lands. An explicit `next` (set by
// ProtectedRoute.jsx when a signed-out visitor tried to reach a specific
// protected page directly) always wins. Otherwise: an account with at
// least one Astrology Profile already goes to /home; a brand-new account
// goes to /onboarding for "Your First Reading" instead — see
// docs/USER_JOURNEY.md's state machine. OnboardingGate.jsx enforces this
// same rule again at the /home route itself, so this is purely a
// same-visit shortcut, not the actual enforcement.
//
// Without a local profile we send the user to /home rather than
// /onboarding: OnboardingGate there checks the *server* first, so a
// returning user on a new device isn't pushed into re-onboarding.
function destinationFor(explicitNext) {
  return explicitNext || '/home'
}

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()

  // "Back to wherever this was opened from" — react-router's history state
  // carries an `idx` that's 0 for the first entry of this tab's session,
  // so idx === 0 means there's nothing in-app to go back to (e.g. someone
  // opened /login directly, or in a new tab) and navigate(-1) would leave
  // the app entirely rather than doing what "click outside" implies.
  function goBackOrHome() {
    const idx = window.history.state?.idx
    if (typeof idx === 'number' && idx > 0) navigate(-1)
    else navigate('/')
  }

  // Already logged in (e.g. browser back button after a successful
  // login) — no reason to show the form again.
  // Whatever else the caller put in router state alongside `next` (e.g.
  // Landing's topic / presetQuestion / landToAsk) is passed on to the
  // destination — it used to be dropped, losing the visitor's pick.
  const { next, ...forwardState } = location.state ?? {}
  const carry = Object.keys(forwardState).length ? forwardState : undefined

  function destinationForRole(role) {
    return role === 'admin' ? '/admin' : role === 'astrologer' ? '/astrologer' : destinationFor(next)
  }

  // <Navigate>, not navigate(): navigate() during render is ignored, which
  // left a blank page for an already-signed-in visitor.
  if (isAuthenticated) {
    return <Navigate to={destinationForRole(user?.role)} state={carry} replace />
  }

  function handleSuccess(loggedInUser) {
    navigate(destinationForRole(loggedInUser?.role), { replace: true, state: carry })
  }

  return (
    <div
      className="min-h-dvh bg-night flex items-center justify-center px-4 py-12 relative overflow-hidden"
      onClick={goBackOrHome}
    >
      <Seo title={t('login_title')} description={t('login_seo_description')} path="/login" noindex />
      <CelestialBackdrop className="text-primary opacity-30 absolute inset-0" />
      {/* Visible back affordance — the click-outside-to-dismiss pattern is
          undiscoverable on mobile. A small top-left link makes the escape
          obvious without breaking the focused card layout. */}
      <button
        onClick={e => { e.stopPropagation(); goBackOrHome() }}
        className="absolute top-4 left-4 text-ink-onnight/60 hover:text-primary text-xs font-medium flex items-center gap-1 transition z-10"
        aria-label={t('nav_back', '← Back')}
      >
        ← {t('nav_back', 'Back')}
      </button>

      <main id="main" tabIndex={-1} className="relative w-full max-w-sm">
      <div
        className="relative w-full max-w-sm bg-parchment-card rounded-2xl shadow-xl p-6 sm:p-8"
        onClick={e => e.stopPropagation()}
      >
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
      </main>
    </div>
  )
}
