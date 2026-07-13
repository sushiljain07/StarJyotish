// frontend/src/components/onboarding/ReviewCard.jsx
//
// Step 7 — shows everything gathered so far and lets the person jump
// back to fix any one answer before the real chart-generating API call
// fires. `onEdit(step)` hands the exact step id back to Onboarding.jsx's
// setStep(), so "Edit" is a real jump, not a full restart.
import { formatDate } from '../../utils/format'

function Row({ label, value, editLabel, onEdit }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-line last:border-0">
      <div>
        <p className="text-ink-faint text-xs">{label}</p>
        <p className="text-ink text-sm font-medium">{value}</p>
      </div>
      <button onClick={onEdit} className="text-primary-dark text-xs font-semibold hover:underline shrink-0 ml-3">
        {editLabel}
      </button>
    </div>
  )
}

export default function ReviewCard({ t, draft, onEdit }) {
  const timeLabel = draft.birthTimeAccuracy === 'unknown'
    ? t('onboarding_review_time_unknown')
    : `${draft.hour}:${draft.minute} ${draft.ampm}${draft.birthTimeAccuracy === 'approximate' ? ` (${t('onboarding_review_time_approx_tag')})` : ''}`

  const edit = t('onboarding_review_edit')

  return (
    <div>
      <Row label={t('onboarding_review_date')} value={formatDate(draft.birthDate)} editLabel={edit} onEdit={() => onEdit('birthDate')} />
      <Row label={t('onboarding_review_time')} value={timeLabel} editLabel={edit} onEdit={() => onEdit('birthTime')} />
      <Row label={t('onboarding_review_place')} value={draft.place} editLabel={edit} onEdit={() => onEdit('birthPlace')} />
    </div>
  )
}
