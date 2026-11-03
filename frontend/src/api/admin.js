// frontend/src/api/admin.js
// API client for admin and astrologer endpoints.
// Every call requires a Bearer token — pass accessToken from useAuth().
import { fetchWithAuth } from './auth'

// Goes through fetchWithAuth so an expired access token is refreshed and the
// call retried, instead of every dashboard call failing ~15 minutes after
// login. Errors carry .status like api/auth.js's authFetch.
async function adminFetch(path, accessToken, { method = 'GET', body } = {}) {
  const resp = await fetchWithAuth(path, { method, body }, accessToken)
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) {
    const err = new Error(data.detail ?? 'Server error')
    err.status = resp.status
    throw err
  }
  return data
}

// ── Admin — users ──────────────────────────────────────────────────────────────
export const adminListUsers = (token, params = {}) => {
  const q = new URLSearchParams()
  if (params.q)      q.set('q', params.q)
  if (params.limit)  q.set('limit', params.limit)
  if (params.offset) q.set('offset', params.offset)
  return adminFetch(`/api/admin/users?${q}`, token)
}
export const adminUserReports = (token, userId) =>
  adminFetch(`/api/admin/users/${userId}/reports`, token)

// ── Admin — settings ───────────────────────────────────────────────────────────
export const adminListSettings = (token) =>
  adminFetch('/api/admin/settings', token)
export const adminUpsertSetting = (token, key, body) =>
  adminFetch(`/api/admin/settings/${key}`, token, { method: 'PUT', body })

// ── Admin — audit log ──────────────────────────────────────────────────────────
export const adminAuditLogs = (token, params = {}) => {
  const q = new URLSearchParams()
  if (params.entity_type) q.set('entity_type', params.entity_type)
  if (params.limit)       q.set('limit', params.limit)
  return adminFetch(`/api/admin/audit-logs?${q}`, token)
}

// ── Admin — astrologers ────────────────────────────────────────────────────────
export const adminListAstrologers = (token) =>
  adminFetch('/api/admin/astrologers?verified_only=false', token)
export const adminOnboardAstrologer = (token, body) =>
  adminFetch('/api/admin/astrologers', token, { method: 'POST', body })
export const adminSetKyc = (token, profileId, status) =>
  adminFetch(`/api/admin/astrologers/${profileId}/kyc?status=${status}`, token, { method: 'PATCH' })

// ── Astrologer ─────────────────────────────────────────────────────────────────
export const astrologerGetProfile = (token) =>
  adminFetch('/api/astrologer/me', token)
export const astrologerUpdateProfile = (token, body) =>
  adminFetch('/api/astrologer/me', token, { method: 'PATCH', body })
export const astrologerGetBookings = (token) =>
  adminFetch('/api/astrologer/me/bookings', token)
export const astrologerGetEarnings = (token) =>
  adminFetch('/api/astrologer/me/earnings', token)

// ── Admin — testimonials ───────────────────────────────────────────────────────
export const adminListTestimonials = (token) =>
  adminFetch('/api/admin/testimonials', token)
export const adminSetTestimonialStatus = (token, id, status, notes) =>
  adminFetch(`/api/admin/testimonials/${id}`, token, { method: 'PATCH', body: { status, admin_notes: notes } })
