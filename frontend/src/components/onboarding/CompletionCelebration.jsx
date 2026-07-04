// frontend/src/components/onboarding/CompletionCelebration.jsx
//
// Shown once, right after a real chart has been generated and saved —
// between `generating` and `/home`. Onboarding ends with a form-submit
// feeling without this: a spinner, then suddenly you're on a dashboard.
// This one beat says the thing that actually happened ("your first
// Astrology Profile now exists") before handing off, which is what makes
// the ending feel like an arrival rather than a redirect.
import HomeIcon from '../home/HomeIcons'

export default function CompletionCelebration({ t, label, onContinue }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-primary-light flex items-center justify-center">
        <HomeIcon id="sparkle" className="w-7 h-7 text-primary-dark" />
      </div>
      <h1 className="font-serif font-semibold text-2xl text-ink mb-2">{t('onboarding_complete_title')}</h1>
      <p className="text-ink-muted text-sm max-w-xs mx-auto mb-8">
        {t('onboarding_complete_body', { name: label })}
      </p>
      <button
        onClick={onContinue}
        className="bg-primary hover:bg-primary-dark text-night font-semibold px-6 py-3 rounded-full transition"
      >
        {t('onboarding_complete_cta')}
      </button>
    </div>
  )
}
