// frontend/src/components/knowledge/LearningMetadata.jsx
//
// The reading-time / difficulty / category / last-updated row a guide
// page's Hero needs — generalizes the plain "{date} · {readMin} min
// read" line BlogArticle.jsx already had, adding difficulty and category
// as two more data points. Every value is a prop: this component has no
// idea what "Zodiac Signs" is, it just renders whatever
// config/knowledgeGraph.js hands it — no hardcoded JSX content.
import { DIFFICULTY_LABELS } from '../../config/learningTaxonomy'

const DIFFICULTY_TONE = {
  beginner: 'bg-sage-light text-sage',
  intermediate: 'bg-primary-light text-primary-dark',
  advanced: 'bg-vermillion-light text-vermillion',
}

function formatLastUpdated(iso) {
  if (!iso) return null
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function LearningMetadata({ estimatedReadTime, difficulty, category, lastUpdated, variant = 'dark' }) {
  const textTone = variant === 'dark' ? 'text-ink-onnight' : 'text-ink-muted'
  const sepTone = variant === 'dark' ? 'text-ink-onnight/40' : 'text-ink-faint'
  const updated = formatLastUpdated(lastUpdated)

  if (!estimatedReadTime && !difficulty && !category && !updated) return null

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 text-xs ${textTone}`}>
      {difficulty && (
        <span className={`font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_TONE[difficulty] ?? DIFFICULTY_TONE.beginner}`}>
          {DIFFICULTY_LABELS[difficulty] ?? difficulty}
        </span>
      )}
      {category && <span>{category}</span>}
      {estimatedReadTime && (
        <>
          <span className={sepTone} aria-hidden="true">·</span>
          <span>{estimatedReadTime} min read</span>
        </>
      )}
      {updated && (
        <>
          <span className={sepTone} aria-hidden="true">·</span>
          <span>Updated {updated}</span>
        </>
      )}
    </div>
  )
}
