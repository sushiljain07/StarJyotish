// frontend/src/api/auth.js
import { API_BASE } from './config'

// Every call here sends `credentials: 'include'` — that's what makes the
// browser attach the httpOnly sj_refresh cookie (set by the backend) on
// /auth/refresh and /auth/logout, and what makes the browser store it in
// the first place on /auth/otp/verify and /auth/google. Without this,
// cross-origin requests (Vercel frontend → Railway backend in production)
// never send or receive cookies at all, regardless of CORS being
// configured correctly server-side.
async function authFetch(path, { method = 'POST', body, accessToken } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) {
    const err = new Error(data.detail ?? 'Something went wrong. Please try again.')
    err.status = resp.status
    throw err
  }
  return data
}

export function sendOtp(phoneNumber) {
  return authFetch('/api/auth/otp/send', { body: { phone_number: phoneNumber } })
}

export function verifyOtp(phoneNumber, code) {
  return authFetch('/api/auth/otp/verify', { body: { phone_number: phoneNumber, code } })
}

export function loginWithGoogle(idToken) {
  return authFetch('/api/auth/google', { body: { id_token: idToken } })
}

// Refresh tokens are single-use: the backend rotates the cookie on every
// /auth/refresh. Two refreshes racing with the same cookie (two parallel
// 401 retries, StrictMode's double-mounted effect, two tabs) used to look
// like a stolen-token replay and logged the user out everywhere. So:
//   - every caller in this tab shares one in-flight refresh promise;
//   - a 409 means another tab won the race moments ago and the browser now
//     holds the new cookie, so retry once after a short pause.
let refreshInFlight = null
let sessionListener = null

// AuthContext registers here so a refresh triggered anywhere — including
// fetchWithAuth below, outside React — updates the in-memory token/user.
export function onSessionRefreshed(listener) {
  sessionListener = listener
  return () => { if (sessionListener === listener) sessionListener = null }
}

async function refreshOnce() {
  try {
    return await authFetch('/api/auth/refresh', { body: undefined })
  } catch (err) {
    if (err.status !== 409) throw err
    await new Promise(resolve => setTimeout(resolve, 250))
    return authFetch('/api/auth/refresh', { body: undefined })
  }
}

export function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = refreshOnce()
      .then(data => { sessionListener?.(data); return data })
      .finally(() => { refreshInFlight = null })
  }
  return refreshInFlight
}

export function logout() {
  return authFetch('/api/auth/logout', { body: undefined })
}

export function fetchMe(accessToken) {
  return authFetch('/api/auth/me', { method: 'GET', accessToken })
}

export function updateProfile(accessToken, updates) {
  return authFetch('/api/account/me', { method: 'PATCH', accessToken, body: updates })
}

// Distinct from sendOtp/verifyOtp above: those are the *login* entry
// point (no current user, may create a new account). These are for
// adding or changing the phone number on an *already logged-in* account
// — see routers/account.py's send_phone_link_otp/verify_phone_link_otp
// for why that needs its own endpoints rather than reusing the login ones.
export function sendPhoneLinkOtp(accessToken, phoneNumber) {
  return authFetch('/api/account/phone/send', { accessToken, body: { phone_number: phoneNumber } })
}

export function verifyPhoneLinkOtp(accessToken, phoneNumber, code) {
  return authFetch('/api/account/phone/verify', { accessToken, body: { phone_number: phoneNumber, code } })
}

// Adding or changing the account email: prove ownership with a code sent
// to the new address first (PATCH /account/me no longer accepts a new
// email directly — see backend/routers/account.py).
export function sendEmailLinkOtp(accessToken, email) {
  return authFetch('/api/account/email/send', { accessToken, body: { email } })
}

export function verifyEmailLinkOtp(accessToken, email, code) {
  return authFetch('/api/account/email/verify', { accessToken, body: { email, code } })
}

export function listSessions(accessToken) {
  return authFetch('/api/auth/sessions', { method: 'GET', accessToken })
}

export function revokeSession(accessToken, sessionId) {
  return authFetch(`/api/auth/sessions/${sessionId}`, { method: 'DELETE', accessToken })
}

// For authenticated calls made outside AuthContext.authedRequest (API
// modules that take a raw token). Access tokens are short-lived (~15 min),
// so on a 401 this refreshes once — through the shared refresh above, which
// also updates AuthContext — and retries with the new token. Returns the
// Response; callers keep their own status handling.
export async function fetchWithAuth(path, { method = 'GET', body, headers = {} } = {}, accessToken) {
  const doFetch = token => fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const resp = await doFetch(accessToken)
  if (resp.status !== 401 || !accessToken) return resp
  let fresh
  try {
    fresh = await refreshSession()
  } catch {
    return resp
  }
  return doFetch(fresh.access_token)
}
