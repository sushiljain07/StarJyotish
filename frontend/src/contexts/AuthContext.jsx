// frontend/src/contexts/AuthContext.jsx
//
// The access token lives only in this component's state — never in
// localStorage/sessionStorage — so it disappears the moment the tab
// closes or this provider unmounts. That's deliberate: a token an XSS
// payload can't read from storage is a token it can't steal. Losing it on
// every reload is fine because of the silent-resume effect below: the
// httpOnly refresh cookie the backend set on login survives a reload even
// though this component's state doesn't, so /api/auth/refresh can mint a
// fresh access token without the user having to re-enter an OTP.
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  verifyOtp as apiVerifyOtp,
  loginWithGoogle as apiLoginWithGoogle,
  refreshSession as apiRefreshSession,
  onSessionRefreshed,
  logout as apiLogout,
  updateProfile as apiUpdateProfile,
  sendPhoneLinkOtp as apiSendPhoneLinkOtp,
  verifyPhoneLinkOtp as apiVerifyPhoneLinkOtp,
  sendEmailLinkOtp as apiSendEmailLinkOtp,
  verifyEmailLinkOtp as apiVerifyEmailLinkOtp,
} from '../api/auth'
import { clearChartSession } from '../services/lastChart'
import i18n, { savedLanguageChoice, markLanguageFromProfile } from '../i18n'
import { LANGUAGES, currentLanguage } from '../i18n/languages'

const AuthContext = createContext(null)

// A refresh failure that says nothing about the session itself (429, 5xx,
// no network) — as opposed to a 401/403, which means signed out.
const isTransientRefreshError = err => err?.status !== 401 && err?.status !== 403

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  // Starts true and flips to false once the mount-time silent-refresh
  // attempt below resolves either way — components like ProtectedRoute
  // need this to avoid bouncing a genuinely-logged-in user to /login for
  // the one render before that attempt finishes.
  const [loading, setLoading] = useState(true)
  // 'unreachable' when the silent refresh failed for a reason that says
  // nothing about the session (rate limit, server error, no network). The
  // person may well still be signed in, so ProtectedRoute offers a retry
  // instead of sending them to /login.
  const [sessionError, setSessionError] = useState(null)

  // Any successful refresh — here, in authedRequest, or in fetchWithAuth
  // (api/auth.js) — lands in this state, so the token never goes stale.
  useEffect(() => onSessionRefreshed(data => {
    setAccessToken(data.access_token)
    setUser(data.user)
  }), [])

  useEffect(() => {
    let cancelled = false
    // Shared with every other refresh in this tab (see api/auth.js), so
    // StrictMode's double-run of this effect can't spend the refresh
    // token twice.
    apiRefreshSession()
      .catch(err => {
        // A 401/403 (never logged in, or the cookie expired) is an
        // entirely normal outcome, not an error to surface. Anything else
        // is transient (api/auth.js already retried it).
        if (!cancelled && isTransientRefreshError(err)) setSessionError('unreachable')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const retrySession = useCallback(async () => {
    setSessionError(null)
    setLoading(true)
    try {
      await apiRefreshSession()  // updates state via onSessionRefreshed
    } catch (err) {
      if (isTransientRefreshError(err)) setSessionError('unreachable')
    } finally {
      setLoading(false)
    }
  }, [])

  const loginWithPhone = useCallback(async (phoneNumber, code) => {
    const data = await apiVerifyOtp(phoneNumber, code)
    setAccessToken(data.access_token)
    setUser(data.user)
    return data.user
  }, [])

  const loginWithGoogleToken = useCallback(async (idToken) => {
    const data = await apiLoginWithGoogle(idToken)
    setAccessToken(data.access_token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // Best-effort — even if the network call fails, drop the local
      // session state so the UI reflects "logged out" immediately.
    }
    setAccessToken(null)
    setUser(null)
    clearChartSession()
  }, [])

  // Runs `fn(accessToken)` and, if it fails with a 401 (the access token
  // expired — they're short-lived by design, see backend/services/
  // jwt_service.py), silently refreshes once and retries with the new
  // token. Every authenticated API call in the app should go through
  // this rather than reading `accessToken` directly, so a 15-minute-old
  // token never surfaces as a confusing logout mid-session.
  const authedRequest = useCallback(async (fn) => {
    try {
      return await fn(accessToken)
    } catch (err) {
      if (err.status !== 401) throw err
      const data = await apiRefreshSession()  // updates state via onSessionRefreshed
      return fn(data.access_token)
    }
  }, [accessToken])

  const updateMyProfile = useCallback((updates) => (
    authedRequest(token => apiUpdateProfile(token, updates)).then(updated => {
      setUser(updated)
      return updated
    })
  ), [authedRequest])

  // Reconcile device and profile language when a person signs in or resumes.
  // A language chosen on this device wins and is pushed to the profile;
  // otherwise the profile's applies. Keyed on the id only, so a toggle
  // mid-session isn't undone by the profile update that follows it.
  const userId = user?.id
  const profileLanguage = user?.preferred_language
  useEffect(() => {
    if (!userId) return
    const known = code => LANGUAGES.some(l => l.code === code)
    const saved = savedLanguageChoice()
    if (saved.source === 'user' && known(saved.code)) {
      if (saved.code !== profileLanguage) {
        Promise.resolve(updateMyProfile({ preferred_language: saved.code })).catch(() => {})
      }
      return
    }
    if (known(profileLanguage) && profileLanguage !== currentLanguage()) {
      i18n.changeLanguage(profileLanguage)
      markLanguageFromProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Adding/changing the phone number is a two-step OTP flow scoped to the
  // already-logged-in account (see api/auth.js's comment on why this
  // isn't the same pair of functions as loginWithPhone above). Only the
  // verify step needs to update local `user` state — the send step
  // doesn't change anything about the account yet.
  const sendPhoneLinkOtp = useCallback((phoneNumber) => (
    authedRequest(token => apiSendPhoneLinkOtp(token, phoneNumber))
  ), [authedRequest])

  const verifyPhoneLinkOtp = useCallback((phoneNumber, code) => (
    authedRequest(token => apiVerifyPhoneLinkOtp(token, phoneNumber, code)).then(updated => {
      setUser(updated)
      return updated
    })
  ), [authedRequest])

  // Same two-step shape as the phone flow above, for the account email.
  const sendEmailLinkOtp = useCallback((email) => (
    authedRequest(token => apiSendEmailLinkOtp(token, email))
  ), [authedRequest])

  const verifyEmailLinkOtp = useCallback((email, code) => (
    authedRequest(token => apiVerifyEmailLinkOtp(token, email, code)).then(updated => {
      setUser(updated)
      return updated
    })
  ), [authedRequest])

  const value = {
    user,
    accessToken,
    loading,
    sessionError,
    retrySession,
    isAuthenticated: !!user,
    loginWithPhone,
    loginWithGoogleToken,
    logout,
    authedRequest,
    updateMyProfile,
    sendPhoneLinkOtp,
    verifyPhoneLinkOtp,
    sendEmailLinkOtp,
    verifyEmailLinkOtp,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>')
  return ctx
}
