// frontend/src/components/home/DisclaimerBlock.jsx
//
// A short summary, not a duplicate of pages/Disclaimer.jsx's full legal
// text (translated via i18n's `disclaimer` key) — keeping the wording in
// one place avoids the two drifting apart after a future policy edit.
import { Link } from 'react-router-dom'

export default function DisclaimerBlock() {
  return (
    <div className="flex items-center justify-center gap-2 text-[11px] text-ink-faint text-center py-2">
      <span>🪔</span>
      <p>
        For reflection &amp; self-understanding, not medical, financial, or legal advice.{' '}
        <Link to="/disclaimer" className="underline hover:text-ink-muted">Full disclaimer</Link>
      </p>
    </div>
  )
}
