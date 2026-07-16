// frontend/src/components/home/SkyRemembers.jsx
//
// Merges ReflectionLoop + JournalPrompt into the approved mock's single
// "The sky remembers" beat:
//   (a) a memory line quoting the most recent PAST-day reaction from
//       useUserJourney's summary. Journey reactions carry card_type /
//       planet / house / date but not the original headline text, so the
//       quoted sentence is looked up the same way ReflectionLoop always
//       did it — from the per-day daily-editor cache
//       (sj_daily_ed_v2:<profileKey>:<lang>:<date>). Hidden entirely if
//       there's no reaction history yet (spec: "hide the line if no
//       history").
//   (b) a free-text, one-line journal + Keep button. This part is new —
//       neither old component had free text (ReflectionLoop was tap-a-
//       reaction, JournalPrompt was tap-a-rating-emoji). Entries persist
//       to localStorage as sj_journal: [{date, text}].
//   (c) on Keep, an inline confirmation echo.
//
// ReflectionLoop.jsx and JournalPrompt.jsx remain on disk untouched and
// importable — they're just no longer wired into PersonalHome, which now
// uses this beat in their place.
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

function headlineForDate(profileKey, lang, dateStr) {
  if (!profileKey || !dateStr) return null
  try {
    const raw = localStorage.getItem(`sj_daily_ed_v2:${profileKey}:${lang}:${dateStr}`)
              || localStorage.getItem(`sj_daily_edition_v1:${profileKey}:${lang}:${dateStr}`)
    return raw ? JSON.parse(raw)?.headline ?? null : null
  } catch {
    return null
  }
}

// Same reaction ids DailyPatrikaHero's chips record — reused here so a
// past "up" reaction reads back as the same "✓ Resonates" chip label.
const REACTION_CHIP = {
  up: ['patrika_react_resonates', '✓ Resonates'],
  skip: ['patrika_react_notsure', 'Not sure'],
  tellmore: ['patrika_react_tellmore', 'Tell me more'],
}

function useMemoryLine(profile, lang, journeySummary, t) {
  const profileKey = profile ? `${profile.birth_date}:${profile.birth_time}:${profile.place}` : null
  const todayStr = new Date().toISOString().slice(0, 10)

  return useMemo(() => {
    const past = journeySummary?.reactions?.find(r => r.date && r.date !== todayStr)
    if (!past) return null
    const headline = headlineForDate(profileKey, lang, past.date)
    if (!headline) return null
    const [chipKey, chipFallback] = REACTION_CHIP[past.reaction] ?? [null, past.reaction]
    const chipLabel = chipKey ? t(chipKey, chipFallback) : chipFallback
    return t('home_memory_line', {
      defaultValue: 'Yesterday you marked {{chip}} on "{{headline}}" — did it hold true?',
      chip: chipLabel,
      headline,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeySummary, profileKey, lang, todayStr])
}

const JOURNAL_KEY = 'sj_journal'

function saveJournalEntry(text) {
  try {
    const raw = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]')
    const entries = Array.isArray(raw) ? raw : []
    entries.unshift({ date: new Date().toISOString().slice(0, 10), text })
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries.slice(0, 200)))
  } catch {
    /* best-effort — the ritual matters, the storage doesn't have to be perfect */
  }
}

function JournalRow({ t }) {
  const [value, setValue] = useState('')
  const [echo, setEcho] = useState(null)

  function keep() {
    const text = value.trim()
    if (!text) return
    saveJournalEntry(text)
    setValue('')
    setEcho(t('home_journal_echo', "Kept under tonight's sky — you'll see this again when this sky returns."))
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') keep() }}
          type="text"
          placeholder={t('home_journal_placeholder', 'One line for tonight’s sky…')}
          aria-label={t('home_journal_aria', 'Journal entry')}
          className="flex-1 min-w-0 bg-white/[0.05] border border-white/[0.14] rounded-xl px-3.5 py-2.5 text-sm text-primary-light placeholder:text-ink-onnight/40 focus:outline-none focus:border-primary"
        />
        <button
          onClick={keep}
          className="shrink-0 bg-primary hover:bg-primary-glow text-night font-semibold text-sm rounded-xl px-4.5 transition"
        >
          {t('home_journal_keep', 'Keep')}
        </button>
      </div>
      {echo && <p className="text-2xs text-sage mt-2.5">{echo}</p>}
    </div>
  )
}

export default function SkyRemembers({ profile, lang = 'en', journeySummary }) {
  const { t } = useTranslation()
  const memoryLine = useMemoryLine(profile, lang, journeySummary, t)

  return (
    <div className="bg-white/[0.045] border border-white/[0.09] rounded-card px-5 py-4">
      {memoryLine && (
        <p className="text-sm text-ink-onnight/85 leading-relaxed mb-4">{memoryLine}</p>
      )}
      <JournalRow t={t} />
    </div>
  )
}
