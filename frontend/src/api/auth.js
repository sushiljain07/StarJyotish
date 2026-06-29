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

export function refreshSession() {
  return authFetch('/api/auth/refresh', { body: undefined })
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

export function listSessions(accessToken) {
  return authFetch('/api/auth/sessions', { method: 'GET', accessToken })
}

export function revokeSession(accessToken, sessionId) {
  return authFetch(`/api/auth/sessions/${sessionId}`, { method: 'DELETE', accessToken })
}
