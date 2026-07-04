// frontend/src/components/onboarding/LoadingState.jsx
//
// Step 8 — shown only while the real POST /api/kundli call
// (services/astrologyProfiles.js's createProfile) is in flight.
// Deliberately no artificial minimum duration: the three lines rotate on
// a timer purely for visual life, but Onboarding.jsx navigates away the
// instant the real request resolves, whichever line happens to be
// showing — see this sprint's brief: "Do NOT fake delays."
import { useEffect, useState } from 'react'

const LINES = [
  'onboarding_generating_1',
  'onboarding_generating_2',
  'onboarding_generating_3',
]

export default function LoadingState({ t }) {
  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setLineIndex(i => Math.min(i + 1, LINES.length - 1))
    }, 1400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="text-center py-10">
      <div className="w-14 h-14 mx-auto mb-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      <p className="font-serif text-lg text-ink transition-opacity duration-300">{t(LINES[lineIndex])}</p>
    </div>
  )
}
