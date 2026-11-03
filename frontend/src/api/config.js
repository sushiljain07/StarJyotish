// Base URL of the backend API.
// - In dev: leave VITE_API_URL unset, Vite's proxy (vite.config.js) forwards /api -> localhost:8000
// - In prod (frontend and backend on different domains): set VITE_API_URL to the deployed backend URL,
//   — production is https://api.starjyotish.com (trailing slash is fine too — stripped below).
//   A different backend host must also be added to connect-src in vercel.json's CSP,
//   or the browser will block every API call.
//
// A value without a scheme (e.g. "my-api.up.railway.app") would otherwise be
// treated by fetch() as a *relative* path on the frontend's own origin; on
// Vercel the SPA rewrite then answers every API call with index.html and a
// 200, so requests look successful while returning nothing. Default such
// values to https:// instead.
export function normalizeApiBase(raw) {
  const trimmed = (raw || '').trim().replace(/\/+$/, '')
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL)
