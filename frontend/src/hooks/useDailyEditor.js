// frontend/src/hooks/useDailyEditor.js  v2
//
// KEY CHANGE FROM v1: Content now rotates per SESSION, not per day.
//
// v1 cached the edition in localStorage per calendar day, which meant the
// same sentence every single visit — exactly what killed engagement.
//
// v2 strategy:
//   - sessionStorage holds the current variation index (increments each tab open)
//   - variation=0 is the "daily baseline" — still cached per day in localStorage
//     so the LLM is not called on the 5th visit within 10 minutes
//   - variation=1,2,… are fetched fresh and cached per session tab, not per day
//   - This means: open the app today → see Headline card. Close, reopen → see
//     Question card. Close, reopen → see Opportunity card. Different every time.
//
// The variation index only increments when the user OPENS A NEW SESSION
// (new tab or returning after 30+ minutes), not on page refreshes.

import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../api/config'

const SESSION_VAR_KEY = 'sj_session_variation'
const SESSION_TIME_KEY = 'sj_session_time'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 min = new session

function getDailyKey(profileKey, lang) {
  const day = new Date().toISOString().slice(0, 10)
  return `sj_daily_ed_v2:${profileKey}:${lang}:${day}`
}

function getSessionKey(profileKey, lang, variation) {
  return `sj_sess_ed_v2:${profileKey}:${lang}:${variation}`
}

function getOrCreateVariation() {
  try {
    const lastTime = parseInt(sessionStorage.getItem(SESSION_TIME_KEY) || '0', 10)
    const now = Date.now()
    const isNewSession = now - lastTime > SESSION_TIMEOUT_MS

    if (isNewSession) {
      // New session: increment variation counter stored in localStorage
      const current = parseInt(localStorage.getItem(SESSION_VAR_KEY) || '0', 10)
      const next = (current + 1) % 20 // cycle through 20 variations
      localStorage.setItem(SESSION_VAR_KEY, String(next))
      sessionStorage.setItem(SESSION_TIME_KEY, String(now))
      sessionStorage.setItem('sj_this_session_var', String(next))
      return next
    }

    // Same session: reuse the variation for this tab
    const thisVar = sessionStorage.getItem('sj_this_session_var')
    if (thisVar !== null) return parseInt(thisVar, 10)

    // First time in this session tab
    const stored = parseInt(localStorage.getItem(SESSION_VAR_KEY) || '0', 10)
    sessionStorage.setItem('sj_this_session_var', String(stored))
    sessionStorage.setItem(SESSION_TIME_KEY, String(now))
    return stored
  } catch {
    return 0
  }
}

export function useDailyEditor(profile, panchang, lang = 'en') {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const variationRef = useRef(null)

  const md = profile?.chart?.dasha?.current_mahadasha
  const ad = profile?.chart?.dasha?.current_antardasha
  const profileKey = profile
    ? `${profile.birth_date}:${profile.birth_time}:${profile.place}`
    : null

  useEffect(() => {
    if (!profile || !md) return

    // Determine variation on first run
    if (variationRef.current === null) {
      variationRef.current = getOrCreateVariation()
    }
    const variation = variationRef.current

    // variation=0: use per-day cache (call LLM at most once per day)
    // variation>0: use per-session cache (call LLM once per session)
    const cacheKey = variation === 0
      ? getDailyKey(profileKey, lang)
      : getSessionKey(profileKey, lang, variation)

    try {
      const cached = sessionStorage.getItem(cacheKey) || localStorage.getItem(cacheKey)
      if (cached) {
        setData(JSON.parse(cached))
        return
      }
    } catch { /* miss */ }

    let cancelled = false
    setLoading(true)

    // Build natal_planets array from chart for return detection
    const natalPlanets = profile.chart?.planets?.map(p => ({
      name: p.name,
      sign_index: p.sign_index,
      degree: p.degree ?? 0,
    })) ?? null

    fetch(`${API_BASE}/api/daily-edition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: profile.birth_date,
        time: profile.birth_time,
        place: profile.place,
        label: profile.label?.split(' ')[0] || 'friend',
        md_planet: md.planet,
        ad_planet: ad?.planet ?? null,
        md_start: md.start ?? null,
        md_end: md.end ?? null,
        abhijit_start: panchang?.muhurtas?.abhijit_muhurta?.start ?? null,
        abhijit_end: panchang?.muhurtas?.abhijit_muhurta?.end ?? null,
        language: lang,
        variation,
        natal_planets: natalPlanets,
      }),
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(json => {
        if (cancelled) return
        setData(json)
        try {
          if (variation === 0) {
            localStorage.setItem(cacheKey, JSON.stringify(json))
          } else {
            sessionStorage.setItem(cacheKey, JSON.stringify(json))
          }
        } catch { /* quota */ }
      })
      .catch(() => { /* hero degrades gracefully */ })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileKey, md?.planet, lang, Boolean(panchang?.muhurtas)])

  // Expose a manual refresh for the pull-to-refresh or "Show me something else" button
  function requestRefresh() {
    try {
      const current = parseInt(localStorage.getItem(SESSION_VAR_KEY) || '0', 10)
      const next = (current + 1) % 20
      localStorage.setItem(SESSION_VAR_KEY, String(next))
      sessionStorage.setItem('sj_this_session_var', String(next))
      sessionStorage.setItem(SESSION_TIME_KEY, '0') // force new session on next read
      variationRef.current = null
      setData(null)
    } catch { /* ignore */ }
  }

  return { edition: data, loading, requestRefresh, variation: variationRef.current ?? 0 }
}
