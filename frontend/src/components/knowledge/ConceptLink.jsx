// frontend/src/components/knowledge/ConceptLink.jsx
//
// Inline cross-reference for astrology terms within guide copy — "Moon
// Sign", "Ascendant", "Nakshatra", ... — resolved from
// config/concepts.js. This is the mechanism that keeps the Knowledge
// Center from filling up with dead links as new guides ship: every
// mention of a term, anywhere in the app, goes through this component,
// so the moment a real page exists for a concept (one line changed in
// concepts.js), every existing mention of it becomes a live link
// automatically — no call site has to change.
//
// `children` overrides the display label (useful mid-sentence, e.g. a
// plural "Nakshatras" for a concept stored singular); omit it to use the
// concept's own label from concepts.js.
import { Link } from 'react-router-dom'
import { getConcept } from '../../config/concepts'

// `tone="dark"` is for links on a night surface (gold text must stay light).
const LINK_TONES = {
  light: 'text-primary-ink hover:text-ink',
  dark: 'text-primary-light hover:text-primary-glow',
}

export default function ConceptLink({ id, children, tone = 'light' }) {
  const concept = getConcept(id)
  const label = children ?? concept?.label ?? id

  if (concept?.href) {
    return (
      <Link
        to={concept.href}
        className={`${LINK_TONES[tone] ?? LINK_TONES.light} border-b border-dotted border-primary/50 hover:border-primary transition`}
      >
        {label}
      </Link>
    )
  }

  return (
    <span
      className="border-b border-dotted border-current/40 cursor-default"
      title="Guide coming soon"
    >
      {label}
    </span>
  )
}
