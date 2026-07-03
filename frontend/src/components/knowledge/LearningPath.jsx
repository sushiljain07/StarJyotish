// frontend/src/components/knowledge/LearningPath.jsx
//
// The "Birth Chart Basics → Zodiac → Nakshatras → ..." sequence shown on
// guide pages so a reader always knows where they are in the wider
// curriculum, not just on this one page. Entirely data-driven — `steps`
// is built by a page via config/knowledgeGraph.js's
// getLearningPathSteps(), so this component has zero built-in knowledge
// of what the actual curriculum is or how many steps it has.
//
// Status per step:
//   'current'   — the page the reader is on right now (filled pill)
//   'completed' — supported now, populated later once a completion-
//                 tracking feature exists (see knowledgeGraph.js's note
//                 on `completedIds` — no persistence is wired up yet)
//   'available' — a real guide exists elsewhere in the path
//   'locked'    — no guide exists there yet; always renders as
//                 non-interactive "Soon", never as a dead link
import { Link } from 'react-router-dom'

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  )
}

const STEP_CLASSES = {
  current:   'bg-primary text-night font-semibold',
  completed: 'bg-primary-light text-primary-dark font-medium border border-primary/30',
  available: 'bg-parchment-card text-ink-muted border border-line hover:border-primary/40 hover:text-ink transition',
  locked:    'bg-parchment-card/60 text-ink-faint border border-line/60 cursor-default',
}

export default function LearningPath({ title = 'Your learning path', steps }) {
  if (!steps || steps.length === 0) return null

  return (
    <nav aria-label={title}>
      {title && <p className="text-xs font-bold tracking-widest uppercase text-primary-dark mb-4">{title}</p>}
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-3">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1
          const tone = STEP_CLASSES[step.status] ?? STEP_CLASSES.locked
          const classes = `flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-full whitespace-nowrap ${tone}`
          const canLink = step.href && (step.status === 'available' || step.status === 'completed')

          const content = (
            <>
              {step.status === 'completed' && <CheckIcon />}
              <span>{step.label}</span>
              {step.status === 'locked' && <span className="text-[10px] opacity-70">Soon</span>}
            </>
          )

          return (
            <li key={step.id} className="flex items-center gap-1.5">
              {canLink ? (
                <Link to={step.href} className={classes}>{content}</Link>
              ) : (
                <span className={classes} aria-current={step.status === 'current' ? 'step' : undefined}>
                  {content}
                </span>
              )}
              {!isLast && <span className="text-ink-faint text-xs px-0.5" aria-hidden="true">→</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
