// frontend/src/components/home/JournalPrompt.jsx
//
// Client-side only for now — there's no backend endpoint yet to persist
// this feedback per user/day. Recording it here still gives an honest
// "thanks" interaction; wiring it to a real table is future backend work,
// not something to fake with a fictitious success state.
import { useState } from 'react'

const OPTIONS = [
  { id: 'spot_on', emoji: '🎯', label: 'Spot on' },
  { id: 'somewhat', emoji: '🤔', label: 'Somewhat' },
  { id: 'not_really', emoji: '❌', label: 'Not really' },
]

export default function JournalPrompt() {
  const [picked, setPicked] = useState(null)

  return (
    <div className="border border-dashed border-white/20 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <p className="text-[13.5px] text-ink-onnight/80">
        {picked ? 'Thanks — noted for today.' : 'How did today\u2019s guidance land for you?'}
      </p>
      <div className="flex gap-2">
        {OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setPicked(opt.id)}
            className={`text-xs font-semibold px-4 py-2 rounded-full border transition ${
              picked === opt.id
                ? 'bg-primary text-night border-primary'
                : 'border-white/20 text-ink-onnight/80 hover:border-primary/50'
            }`}
          >
            {opt.emoji} {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
