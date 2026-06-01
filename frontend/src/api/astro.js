// frontend/src/api/astro.js
const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function fetchKundli({ date, time, place }) {
  const resp = await fetch('${API_BASE}/api/kundli', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, time, place }),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Server error')
  }

  return resp.json()
}
