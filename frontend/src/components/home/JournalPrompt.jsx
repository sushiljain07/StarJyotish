import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function JournalPrompt() {
  const { t } = useTranslation()
  const [picked, setPicked] = useState(null)

  const OPTIONS = [
    { id: 'spot_on',    emoji: '🎯', key: 'journal_spot_on' },
    { id: 'somewhat',   emoji: '🤔', key: 'journal_somewhat' },
    { id: 'not_really', emoji: '❌', key: 'journal_not_really' },
  ]

  return (
    <div className="border border-dashed border-line rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-parchment-card">
      <p className="text-[13.5px] text-ink-muted">
        {picked ? t('journal_thanks') : t('journal_question')}
      </p>
      <div className="flex gap-2">
        {OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setPicked(opt.id)}
            className={`text-xs font-semibold px-4 py-2 rounded-full border transition ${
              picked === opt.id
                ? 'bg-primary text-night border-primary'
                : 'border-line text-ink-muted hover:border-primary/50'
            }`}
          >
            {opt.emoji} {t(opt.key)}
          </button>
        ))}
      </div>
    </div>
  )
}
