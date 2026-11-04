// Session cache for AI and chart reports. Each report is a slow (~20s),
// paid LLM call; without this, leaving a report tab and coming back, or
// remounting the page, generated it again. Keyed by endpoint + request
// body, and the body carries the chart and the language, so each chart and
// language is cached separately. Only successful responses are cached.
import { API_BASE } from './config'
import { errorFromResponse } from './errors'

const PREFIX = 'sj_report:'

// JSON with sorted object keys, so { a, b } and { b, a } share a key.
function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().filter(k => value[k] !== undefined)
      .map(k => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

const cacheKey = (endpoint, body) => `${PREFIX}${endpoint}:${stableStringify(body)}`

// The chart fields the report endpoints read. Other input fields (name,
// topic, timeAccuracy) are ignored by the server, so they stay out of the
// body and the cache key; otherwise the same reading would be generated
// and paid for once per entry point.
export function chartBody(input) {
  return { date: input.date, time: input.time, place: input.place }
}

// The exact body ChartReading sends to /api/kundli/reading.
export function readingBody(input, lang) {
  return { ...chartBody(input), language: lang }
}

export function peekReport(endpoint, body) {
  try {
    const raw = sessionStorage.getItem(cacheKey(endpoint, body))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function fetchReport(endpoint, body, { signal, force = false, fallback = 'Server error' } = {}) {
  if (!force) {
    const cached = peekReport(endpoint, body)
    if (cached) return cached
  }
  const resp = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
  if (!resp.ok) throw await errorFromResponse(resp, fallback)
  const data = await resp.json()
  try {
    sessionStorage.setItem(cacheKey(endpoint, body), JSON.stringify(data))
  } catch {
    // Storage blocked or full: the report still shows, just isn't cached.
  }
  return data
}
