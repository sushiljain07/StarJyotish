// frontend/src/components/onboarding/ProgressIndicator.jsx
//
// A row of segments, not a percentage or "Step 3 of 6" label — the exact
// count matters less than the visible sense of "almost there." Only
// shown across the actual question steps (profile type → review);
// Welcome and Generating aren't questions, so OnboardingLayout's callers
// simply don't render this on those two screens.
export default function ProgressIndicator({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-6" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current ? 'bg-primary w-6' : 'bg-line w-3'
          }`}
        />
      ))}
    </div>
  )
}
