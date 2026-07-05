// frontend/src/components/home/JournalPrompt.jsx
//
// Submits to POST /api/feedback/daily-guidance — backed by the Feedback
// model (see backend/db/models/feedback.py), which already existed and
// already supports optional user_id, rating, and related_type. This is
// no longer just a cosmetic state toggle: the reaction is actually stored.
//
// The quota key prevents re-submission after a page reload, consistent
// with the same pattern AskPersonaPanel uses for its daily quota — both
// are "once per day" UX nudges backed by localStorage, with the real
// server-side record being the authoritative store.
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { API_BASE } from '../../api/config'

const STORAGE_KEY = (date) => `sj_journal_feedback_v1:${date}`
const TODAY = new Date().toISOString().slice(0, 10)

function alreadySubmittedToday() {
  try { return !!localStorage.getItem(STORAGE_KEY(TODAY)) } catch { return false }
}

function markSubmittedToday(reaction) {
  try { localStorage.setItem(STORAGE_KEY(TODAY), reaction) } catch { /* best-effort */ }
}

export default function JournalPrompt() {
  const { t } = useTranslation()
  const { accessToken } = useAuth()
  const [picked, setPicked] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY(TODAY)) || null } catch { return null }
  })
  const [status, setStatus] = useState(picked ? 'done' : 'idle')

  const OPTIONS = [
    { id: 'spot_on',    emoji: '🎯', key: 'journal_spot_on' },
    { id: 'somewhat',   emoji: '🤔', key: 'journal_somewhat' },
    { id: 'not_really', emoji: '❌', key: 'journal_not_really' },
  ]

  async function handlePick(reaction) {
    if (status === 'done' || status === 'sending') return
    setPicked(reaction)
    setStatus('sending')

    try {
      await fetch(`${API_BASE}/api/feedback/daily-guidance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ reaction, guidance_date: TODAY }),
      })
    } catch { /* silent — local state still reflects their answer */ }

    markSubmittedToday(reaction)
    setStatus('done')
  }

  const submitted = status === 'done'

  return (
    <div className="border border-dashed border-line rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-parchment-card">
      <p className="text-[13.5px] text-ink-muted">
        {submitted ? t('journal_thanks') : t('journal_question')}
      </p>
      <div className="flex gap-2">
        {OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => handlePick(opt.id)}
            disabled={submitted}
            className={`text-xs font-semibold px-4 py-2 rounded-full border transition ${
              picked === opt.id
                ? 'bg-primary text-night border-primary'
                : submitted
                  ? 'border-line text-ink-faint opacity-40 cursor-default'
                  : 'border-line text-ink-muted hover:border-primary/50'
            }`}
          >
            {status === 'sending' && picked === opt.id ? '…' : `${opt.emoji} ${t(opt.key)}`}
          </button>
        ))}
      </div>
    </div>
  )
}
