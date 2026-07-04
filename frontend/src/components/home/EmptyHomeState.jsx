// frontend/src/components/home/EmptyHomeState.jsx
//
// Shown on /home in place of the Cosmic Snapshot + Birth Chart sections
// only for accounts that explicitly skipped onboarding (see
// services/astrologyProfiles.js's hasSkippedOnboarding — distinct from
// simply not having finished yet, which routes into /onboarding
// automatically via OnboardingGate.jsx and never reaches this state).
//
// Filed under components/home/ rather than components/onboarding/ (where
// this sprint's brief originally suggested it) since it's rendered by
// PersonalHome.jsx and belongs with the rest of that page's sections —
// see docs/USER_JOURNEY.md's "Architectural decisions" for the reasoning.
//
// Copy is written as an invitation forward, not a report of what's
// missing — see i18n's home_empty_title/body. The CTA deliberately
// reuses onboarding_welcome_cta rather than its own string, so the same
// promise ("Begin My First Reading") is never worded two different ways
// depending on which door someone walks through.
import { useNavigate } from 'react-router-dom'
import HomeIcon from './HomeIcons'

export default function EmptyHomeState({ t }) {
  const navigate = useNavigate()

  return (
    <section className="bg-parchment-card rounded-2xl shadow-sm border border-line p-8 sm:p-10 text-center">
      <HomeIcon id="sparkle" className="w-6 h-6 text-primary-dark mx-auto mb-4" />
      <h2 className="font-serif font-semibold text-xl text-ink mb-2">{t('home_empty_title')}</h2>
      <p className="text-ink-muted text-sm max-w-sm mx-auto mb-6">{t('home_empty_body')}</p>
      <button
        onClick={() => navigate('/onboarding')}
        className="bg-primary hover:bg-primary-dark text-night text-sm font-semibold px-5 py-2.5 rounded-full transition"
      >
        {t('onboarding_welcome_cta')}
      </button>
    </section>
  )
}
