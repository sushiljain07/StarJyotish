// frontend/src/components/home/ContinuityStrip.jsx
//
// The "the app remembers you" strip that appears above the hero on return visits.
// Shows:
//   - Engagement streak ("Day 5 in a row")
//   - Yesterday's reaction ("Yesterday you said today's guidance was spot on 🎯")
//   - Personalisation signal ("You engage most with Question cards — here's one")
//
// Intentionally compact — 1 line of text max, no chrome. The strip is a
// whisper, not a banner. It disappears on the user's first ever visit.

import { useMemo } from 'react'

const CARD_LABELS = {
  HEADLINE:       "daily headlines",
  QUESTION:       "reflection questions",
  OPPORTUNITY:    "opportunity windows",
  WATCH:          "gentle cautions",
  NAKSHATRA_FLASH:"nakshatra insights",
  TIMING_WINDOW:  "timing windows",
  DASHA_WHISPER:  "dasha whispers",
}

const REACTION_EMOJI = { up: "🎯", skip: "🙂", down: "🤔" }

export default function ContinuityStrip({ summary }) {
  const message = useMemo(() => {
    if (!summary) return null
    const { streak, reactions, top_cards } = summary

    // Nothing to show yet
    if (!reactions?.length && !streak) return null

    // Streak first — most motivating signal
    if (streak >= 3) {
      return `✨ Day ${streak} in a row — your chart is watching with you.`
    }

    // Yesterday's reaction
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yKey = yesterday.toISOString().slice(0, 10)
    const yReaction = reactions?.find(r => r.date === yKey)
    if (yReaction) {
      const emoji = REACTION_EMOJI[yReaction.reaction] || ''
      if (yReaction.reaction === 'up') {
        return `${emoji} Yesterday's guidance resonated — here's today's reading.`
      }
      if (yReaction.reaction === 'down') {
        return `🔄 Switching the lens — today's card draws from a different part of your chart.`
      }
    }

    // Top card preference
    if (top_cards?.[0]) {
      const label = CARD_LABELS[top_cards[0].card_type] || 'insights'
      return `✦ You tend to engage most with ${label}.`
    }

    // New user — first engagement
    if (streak === 1) {
      return `✨ Day 1 of your journey. The sky updates every time you return.`
    }

    return null
  }, [summary])

  if (!message) return null

  return (
    <div
      style={{
        fontSize: '12px',
        color: 'rgba(217,164,65,0.7)',
        fontWeight: 500,
        letterSpacing: '0.01em',
        padding: '6px 4px',
        animation: 'fadeSlideInFast 0.25s ease-out both',
      }}
      aria-live="polite"
    >
      {message}
    </div>
  )
}
