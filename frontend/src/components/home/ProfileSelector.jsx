// frontend/src/components/home/ProfileSelector.jsx
//
// UX affordance only — no switching logic exists yet (there's only ever
// one profile to show today; see services/astrologyProfiles.js's
// module comment on the multi-profile architecture that's designed but
// not built). This sits at the top of Home so the *idea* that an account
// can hold more than one Astrology Profile ("Mine," "Mom," "Rahul...") is
// visible from day one, rather than surprising people the day switching
// actually ships. Deliberately disabled rather than hidden — a disabled
// control with an explanatory title says "more is coming," where hiding
// it entirely would say nothing.
import HomeIcon from './HomeIcons'

export default function ProfileSelector({ t, profile }) {
  if (!profile) return null

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-ink-faint uppercase tracking-wide">{t('home_profile_selector_label')}</span>
      <button
        type="button"
        disabled
        aria-disabled="true"
        title={t('home_profile_selector_hint')}
        className="inline-flex items-center gap-1.5 bg-parchment-card border border-line rounded-full pl-3 pr-2.5 py-1.5 text-sm font-medium text-ink cursor-not-allowed"
      >
        <HomeIcon id={profile.relation === 'other' ? 'people' : 'self'} className="w-3.5 h-3.5 text-primary-dark shrink-0" />
        {profile.label}
        <HomeIcon id="chevronDown" className="w-3 h-3 text-ink-faint shrink-0" />
      </button>
    </div>
  )
}
