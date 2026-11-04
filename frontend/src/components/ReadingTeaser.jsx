// frontend/src/components/ReadingTeaser.jsx
//
// The AI reading is the product's main promise, but on /kundli it sat
// below two full charts. This card puts it at the top of the chart tab.
// It never starts a reading itself (that would be a hidden ~20s LLM call
// on every chart view): it previews this chart's reading when one is
// already cached for the session, and otherwise invites the user to open it.
import { useTranslation } from 'react-i18next'
import { peekReport, readingBody } from '../api/reportCache'
import { Card } from './ui'

// Same order ChartReading shows its sections in. Kept here so the chart
// page doesn't pull ChartReading's code into its own bundle.
const SECTION_ORDER = ['identity', 'strengths', 'currentperiod', 'prediction', 'health', 'relationships']

export default function ReadingTeaser({ input, onOpen }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language?.startsWith('hi') ? 'hi' : 'en'
  const cached = peekReport('/api/kundli/reading', readingBody(input, lang))
  const sections = cached?.prediction_sections ?? {}
  const preview = SECTION_ORDER.map(key => sections[key]).find(text => text?.trim())

  return (
    <Card className="mb-5 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-serif font-semibold text-ink">{t('teaser_heading')}</p>
        <p className="text-sm text-ink-muted mt-0.5 line-clamp-2">{preview ?? t('teaser_body')}</p>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="shrink-0 min-h-[44px] px-5 rounded-full bg-primary hover:bg-primary-dark text-night text-sm font-semibold transition"
      >
        {preview ? t('teaser_continue') : t('teaser_reveal')}
      </button>
    </Card>
  )
}
