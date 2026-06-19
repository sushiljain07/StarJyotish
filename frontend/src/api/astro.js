
async function postJson(url, body) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Server error')
  }
  return resp.json()
}

export function fetchKundli({ date, time, place }) {
  return postJson('/api/kundli', { date, time, place })
}

export function fetchTransit({ date, time, place }) {
  return postJson('/api/kundli/transit', { date, time, place })
}

export function fetchAshtakavarga({ date, time, place }) {
  return postJson('/api/kundli/ashtakavarga', { date, time, place })
}

export function fetchBhavaChalit({ date, time, place }) {
  return postJson('/api/kundli/bhava-chalit', { date, time, place })
}

export function fetchKPChart({ date, time, place }) {
  return postJson('/api/kundli/kp', { date, time, place })
}

export function fetchDivisional({ date, time, place, division }) {
  return postJson(`/api/kundli/divisional?division=${division}`, { date, time, place })
}
