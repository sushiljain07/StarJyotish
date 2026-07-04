// frontend/src/components/home/ProfileSelector.jsx
//
// Shows which Astrology Profile is currently active and, when the user
// has more than one, lets them switch between them. With one profile the
// dropdown is still shown (not hidden) so the UI stays predictable —
// it just has only one option, no hint text.
import { useState, useRef, useEffect } from 'react'
import HomeIcon from './HomeIcons'

export default function ProfileSelector({ t, profile, profiles = [], onSwitch }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const hasMany = profiles.length > 1

  useEffect(() => {
    if (!open) return
    function close(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  if (!profile) return null

  function handleSelect(p) {
    onSwitch?.(p)
    setOpen(false)
  }

  return (
    <div className="flex items-center gap-2 mb-3" ref={ref}>
      <span className="text-[10px] text-ink-faint uppercase tracking-wide">
        {t('home_profile_selector_label')}
      </span>

      <div className="relative">
        <button
          type="button"
          onClick={() => hasMany && setOpen(o => !o)}
          aria-haspopup={hasMany ? 'listbox' : undefined}
          aria-expanded={hasMany ? open : undefined}
          className={`inline-flex items-center gap-1.5 bg-parchment-card border border-line rounded-full pl-3 pr-2.5 py-1.5 text-sm font-medium text-ink transition ${
            hasMany
              ? 'cursor-pointer hover:border-primary/50 hover:bg-primary-light/40'
              : 'cursor-default'
          }`}
        >
          <HomeIcon
            id={profile.relation === 'other' ? 'people' : 'self'}
            className="w-3.5 h-3.5 text-primary-dark shrink-0"
          />
          {profile.label}
          {hasMany && (
            <HomeIcon
              id="chevronDown"
              className={`w-3 h-3 text-ink-faint shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          )}
        </button>

        {open && hasMany && (
          <ul
            role="listbox"
            className="absolute left-0 top-full mt-1.5 w-48 bg-parchment-card rounded-xl shadow-xl border border-line py-1.5 z-50"
          >
            {profiles.map(p => (
              <li key={p.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={p.id === profile.id}
                  onClick={() => handleSelect(p)}
                  className={`w-full text-left px-3.5 py-2 text-sm flex items-center gap-2 transition ${
                    p.id === profile.id
                      ? 'text-primary-dark font-semibold bg-primary-light/40'
                      : 'text-ink hover:bg-primary-light/30'
                  }`}
                >
                  <HomeIcon
                    id={p.relation === 'other' ? 'people' : 'self'}
                    className="w-3.5 h-3.5 shrink-0 text-primary-dark"
                  />
                  {p.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
