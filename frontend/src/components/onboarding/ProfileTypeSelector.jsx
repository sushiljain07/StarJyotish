// frontend/src/components/onboarding/ProfileTypeSelector.jsx
//
// "Whose chart would you like to create?" — the fork that makes the
// User Account / Astrology Profile split real from the very first
// question, rather than assuming everyone is only ever reading their own
// chart. Built as two equally-weighted cards (not a toggle or dropdown)
// so "Someone Else" reads as just as natural a choice as "Mine" — this
// is also the shape "Add Profile" reuses later for a second, third
// profile (see docs/USER_JOURNEY.md).
import HomeIcon from '../home/HomeIcons'

const OPTIONS = [
  { id: 'self', icon: 'self', labelKey: 'onboarding_whose_mine', descKey: 'onboarding_whose_mine_desc' },
  { id: 'other', icon: 'people', labelKey: 'onboarding_whose_other', descKey: 'onboarding_whose_other_desc' },
]

export default function ProfileTypeSelector({ t, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {OPTIONS.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          aria-pressed={value === opt.id}
          className={`text-center rounded-xl border-2 px-4 py-6 transition ${
            value === opt.id
              ? 'border-primary bg-primary-light/50'
              : 'border-line bg-parchment hover:border-primary/40'
          }`}
        >
          <HomeIcon id={opt.icon} className={`w-7 h-7 mx-auto mb-2 ${value === opt.id ? 'text-primary-dark' : 'text-ink-muted'}`} />
          <span className="block font-semibold text-ink text-sm">{t(opt.labelKey)}</span>
          <span className="block text-ink-faint text-xs mt-1">{t(opt.descKey)}</span>
        </button>
      ))}
    </div>
  )
}
