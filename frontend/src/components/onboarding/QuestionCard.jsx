// frontend/src/components/onboarding/QuestionCard.jsx
//
// The one-question-per-screen shell every onboarding step (other than
// Welcome and Generating, which have their own full-screen treatments)
// renders inside. Keeping title/helper/footer structure identical across
// steps is what makes the flow feel like one continuous conversation
// rather than six different forms stitched together.
import { Button, Card } from '../ui'

export default function QuestionCard({ title, helperText, children, primaryLabel, onPrimary, primaryDisabled, primaryLoading }) {
  return (
    <Card padding="lg">
      <h1 className="font-serif font-semibold text-xl sm:text-2xl text-ink text-center mb-1.5">{title}</h1>
      {helperText && <p className="text-ink-muted text-sm text-center mb-6">{helperText}</p>}

      <div className={helperText ? '' : 'mt-6'}>{children}</div>

      {primaryLabel && (
        <Button
          size="lg"
          onClick={onPrimary}
          disabled={primaryDisabled}
          className="w-full mt-7"
        >
          {primaryLoading ? '…' : primaryLabel}
        </Button>
      )}
    </Card>
  )
}
