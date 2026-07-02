// frontend/src/api/admin.js
// API client for admin and astrologer endpoints.
// Every call requires a Bearer token — pass accessToken from useAuth().
import { API_BASE } from './config'

async function adminFetch(path, accessToken, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }
  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) throw new Error(data.detail ?? 'Server error')
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
