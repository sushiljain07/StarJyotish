// frontend/src/components/home/DisclaimerBlock.jsx
//
// A short summary, not a duplicate of pages/Disclaimer.jsx's full legal
// text (translated via i18n's `disclaimer` key) — keeping the wording in
// one place avoids the two drifting apart after a future policy edit.
import { Link } from 'react-router-dom'

export default function DisclaimerBlock() {
  return (
    <p className="text-[11px] text-ink-onnight/40 leading-relaxed max-w-3xl pt-2">
      <strong className="text-ink-onnight/55">A note on these readings.</strong>{' '}
      Star Jyotish's guidance is generated using traditional Vedic astrology calculations
      interpreted with AI assistance, for reflection and self-understanding — not a
      substitute for professional medical, financial, legal, or psychological advice.{' '}
      <Link to="/disclaimer" className="underline hover:text-ink-onnight/70">Read the full disclaimer</Link>.
    </p>
  )
}
