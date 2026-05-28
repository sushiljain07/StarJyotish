// frontend/src/api/astro.js
export async function fetchKundli({ date, time, place }) {
  const resp = await fetch('/api/kundli', {
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
