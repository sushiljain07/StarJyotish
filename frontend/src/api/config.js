// Base URL of the backend API.
// - In dev: leave VITE_API_URL unset, Vite's proxy (vite.config.js) forwards /api -> localhost:8000
// - In prod (frontend and backend on different domains): set VITE_API_URL to the deployed backend URL,
//   e.g. https://starjyotish-backend.up.railway.app  (trailing slash is fine too — stripped below)
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
