// frontend/src/components/home/ReflectionLoop.jsx
//
// The card that makes the home page a conversation across days.
//
// Morning: "Yesterday we suggested X — how did it go?" with one-tap
// reactions. Evening (after 7 PM local): flips to a reflection prompt
// about today. Either way, a "Tell Jyoti" affordance opens the existing
// AskPersonaPanel with the reflection as conversational context — the
// person can elaborate in free text and Jyoti answers from their chart.
//
// Data flow:
// - Yesterday's headline comes from the useDailyEditor localStorage cache
//   (keyed by date, so yesterday's entry is still readable this morning).
// - Reactions POST to /api/feedback/daily-guidance (the endpoint added in
//   this sprint's feedback work); failures degrade to local-only silently
//   because a reflection card must never show an error state — it's a
//   ritual, not a form.
// - "Tell Jyoti" dispatches the 'sj:open-jyoti' window event that
//   AskPersonaPanel listens for, with a prefill so the chat opens
//   mid-conversation instead of blank.
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { API_BASE } from '../../api/config'
import JyotiAvatar from './JyotiAvatar'

function yesterdayHeadline(profileKey, lang) {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const day = d.toISOString().slice(0, 10)
  try {
    // Try v2 key first, fall back to v1 for backwards compat
    const raw = localStorage.getItem(`sj_daily_ed_v2:${profileKey}:${lang}:${day}`)
              || localStorage.getItem(`sj_daily_edition_v1:${profileKey}:${lang}:${day}`)
    return raw ? JSON.parse(raw)?.headline ?? null : null
  } catch {
    return null
  }
}

function reactionKey(profileKey) {
  const day = new Date().toISOString().slice(0, 10)
  return `sj_reflection_v1:${profileKey}:${day}`
}

const REACTIONS = [
  { id: 'spot_on', rating: 3, emoji: '🎯' },
  { id: 'somewhat', rating: 2, emoji: '🙂' },
  { id: 'not_really', rating: 1, emoji: '🤔' },
]

export default function ReflectionLoop({ profile, lang = 'en' }) {
  const { t } = useTranslation()
  const profileKey = profile ? `${profile.birth_date}:${profile.birth_time}:${profile.place}` : null

  const isEvening = new Date().getHours() >= 19
  const yHeadline = useMemo(
    () => (profileKey ? yesterdayHeadline(profileKey, lang) : null),
    [profileKey, lang],
  )

  const [reacted, setReacted] = useState(() => {
    try { return Boolean(localStorage.getItem(reactionKey(profileKey))) } catch { return false }
  })
  const [thanked, setThanked] = useState(false)

  // Nothing to reflect on yet (first day) and it's not evening — stay quiet.
  if (!profile || (!yHeadline && !isEvening)) return null

  function react(reaction) {
    setReacted(true)
    setThanked(true)
    try { localStorage.setItem(reactionKey(profileKey), reaction.id) } catch { /* fine */ }
    // Fire-and-forget — the ritual matters, the network doesn't.
    fetch(`${API_BASE}/api/feedback/daily-guidance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reaction: reaction.id }),
    }).catch(() => {})
  }

  function tellJyoti() {
    const prefill = isEvening
      ? t('reflection_jyoti_prefill_evening')
      : t('reflection_jyoti_prefill_morning', { headline: yHeadline ?? '' })
    window.dispatchEvent(new CustomEvent('sj:open-jyoti', { detail: { prefill } }))
  }

  return (
    <div className="bg-parchment-card border border-line rounded-2xl px-5 py-4">
      <div className="flex items-start gap-3.5">
        <span className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-1 ring-primary/30 mt-0.5">
          <JyotiAvatar />
        </span>

        <div className="flex-1 min-w-0">
          {thanked ? (
            <p className="text-sm text-ink leading-relaxed">
              {t('reflection_thanks')}{' '}
              <button onClick={tellJyoti} className="text-primary-dark font-semibold hover:underline">
                {t('reflection_tell_more')}
              </button>
            </p>
          ) : isEvening ? (
            <>
              <p className="text-sm text-ink leading-relaxed mb-2.5">{t('reflection_evening_prompt')}</p>
              <button
                onClick={tellJyoti}
                className="text-xs font-semibold bg-night text-parchment rounded-full px-4 py-2 hover:bg-night-light transition"
              >
                {t('reflection_evening_cta')}
              </button>
            </>
          ) : (
            <>
              <p className="text-[11px] uppercase tracking-wider font-bold text-primary-dark mb-1">
                {t('reflection_yesterday_label')}
              </p>
              <p className="text-[13px] text-ink-muted italic leading-snug mb-2.5 line-clamp-2">
                “{yHeadline}”
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] text-ink font-medium mr-1">{t('reflection_how_did_it_go')}</span>
                {REACTIONS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => react(r)}
                    disabled={reacted}
                    className="text-xs border border-line rounded-full px-3 py-1.5 hover:border-primary/50 hover:bg-primary-light/40 transition disabled:opacity-40"
                  >
                    {r.emoji} {t(`reflection_${r.id}`)}
                  </button>
                ))}
                <button
                  onClick={tellJyoti}
                  className="text-xs text-primary-dark font-semibold hover:underline ml-1"
                >
                  {t('reflection_tell_jyoti')} →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
