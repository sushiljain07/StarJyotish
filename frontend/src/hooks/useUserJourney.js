// frontend/src/hooks/useUserJourney.js
//
// Manages the user's interaction history for continuity:
//   - Records card reactions (up/down/skip) to /api/journey/card-reaction
//   - Loads journey summary from /api/journey/summary (streak, top cards)
//   - Falls back to localStorage when offline or unauthenticated
//   - Provides the "continuity data" that makes the home page feel like it
//     remembers you: "You've been on a 5-day streak" / "You love Question cards"

import { useState, useEffect, useCallback } from 'react'
import { fetchWithAuth } from '../api/auth'
import { localDateStr } from '../utils/localDate'

const LOCAL_REACTIONS_KEY = 'sj_journey_reactions_v1'
//const LOCAL_STREAK_KEY = 'sj_journey_streak_v1'

function loadLocalReactions() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_REACTIONS_KEY) || '[]')
  } catch { return [] }
}

function saveLocalReaction(entry) {
  try {
    const existing = loadLocalReactions()
    const updated = [entry, ...existing].slice(0, 90) // keep 90 days local
    localStorage.setItem(LOCAL_REACTIONS_KEY, JSON.stringify(updated))
  } catch { /* quota */ }
}

function computeLocalStreak(reactions) {
  const days = new Set(reactions.map(r => r.date))
  let streak = 0
  const today = new Date()
  while (true) {
    const d = localDateStr(today)
    if (!days.has(d)) break
    streak++
    today.setDate(today.getDate() - 1)
  }
  return streak
}

export function useUserJourney(accessToken) {
  const [summary, setSummary] = useState(null)
  const [loadingJourney, setLoadingJourney] = useState(false)
  // cardReactions: { [cardType]: 'up' | 'down' | 'skip' } — session-level, resets on reload
  const [cardReactions, setCardReactions] = useState({})


  // Load journey summary on mount
  useEffect(() => {
    if (!accessToken) {
      // Offline: derive from local reactions
      const local = loadLocalReactions()
      const streak = computeLocalStreak(local)
      const cardCounts = {}
      for (const r of local) {
        if (r.reaction === 'up') {
          cardCounts[r.card_type] = (cardCounts[r.card_type] || 0) + 1
        }
      }
      const topCards = Object.entries(cardCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([card_type, count]) => ({ card_type, count }))
      setSummary({ reactions: local.slice(0, 30), streak, top_cards: topCards })
      return
    }

    setLoadingJourney(true)
    fetchWithAuth('/api/journey/summary', {}, accessToken)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setSummary(data)
        } else {
          // Fallback to local
          const local = loadLocalReactions()
          setSummary({ reactions: local.slice(0, 30), streak: computeLocalStreak(local), top_cards: [] })
        }
      })
      .catch(() => {
        const local = loadLocalReactions()
        setSummary({ reactions: local.slice(0, 30), streak: computeLocalStreak(local), top_cards: [] })
      })
      .finally(() => setLoadingJourney(false))
  }, [accessToken])

  // Record a card reaction
  const recordReaction = useCallback((cardType, reaction, meta = {}) => {
    const entry = {
      card_type: cardType,
      reaction,
      date: localDateStr(),
      planet: meta.planet || null,
      house: meta.house || null,
      variation: meta.variation || 0,
    }

    // Optimistic local save always
    saveLocalReaction(entry)
    // Update local streak immediately
    setCardReactions(prev => ({ ...prev, [cardType]: reaction }))
    setSummary(prev => {
      if (!prev) return prev
      const reactions = [entry, ...(prev.reactions || [])].slice(0, 30)
      const streak = computeLocalStreak(reactions)
      return { ...prev, reactions, streak }
    })

    // Fire-and-forget to backend (unauthenticated is fine)
    fetchWithAuth('/api/journey/card-reaction', { method: 'POST', body: entry }, accessToken)
      .catch(() => { /* silent */ })
  }, [accessToken])

  return { summary, loadingJourney, recordReaction, cardReactions }
}
