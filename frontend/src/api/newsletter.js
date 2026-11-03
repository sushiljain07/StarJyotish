// frontend/src/api/newsletter.js
import { API_BASE } from './config'

// Resolves only when the backend has stored the subscription
// (backend/routers/newsletter.py); rejects otherwise so callers can show
// an error instead of a false "you're subscribed".
export async function subscribeNewsletter(email) {
  const resp = await fetch(`${API_BASE}/api/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  })
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}))
    const err = new Error(typeof data.detail === 'string' ? data.detail : 'Subscription failed')
    err.status = resp.status
    throw err
  }
  return resp.json()
}
