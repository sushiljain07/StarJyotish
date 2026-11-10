// The language toggle, built entirely from the registry in i18n/languages.js:
// no language is named here. Up to 3 languages show as buttons, more as a
// select. The choice is saved to the profile when signed in (best effort).
import { useTranslation } from 'react-i18next'
import { LANGUAGES, currentLanguage } from '../i18n/languages'
import { markLanguageChosenByUser } from '../i18n'
import { useAuth } from '../contexts/AuthContext'

const MAX_BUTTONS = 3

// Footers can render outside an AuthProvider (tests, error pages); the
// switcher then simply behaves as signed out.
function useOptionalAuth() {
  try {
    return useAuth()
  } catch {
    return null
  }
}

export default function LanguageSwitcher({ size = 'md', tone = 'night' }) {
  const { t, i18n } = useTranslation()
  const auth = useOptionalAuth()
  const active = currentLanguage()

  function choose(lng) {
    i18n.changeLanguage(lng)
    markLanguageChosenByUser()
    if (auth?.user && auth.updateMyProfile) {
      // Best effort: neither a throw nor a rejection may undo the switch.
      try {
        Promise.resolve(auth.updateMyProfile({ preferred_language: lng })).catch(() => {})
      } catch {
        // Profile save failed synchronously; the language still changed.
      }
    }
  }

  const pad = size === 'sm' ? 'px-2 text-[11px]' : 'px-3 text-xs'
  const idle = tone === 'light'
    ? 'bg-ink/5 text-ink/70 hover:bg-ink/10'
    : 'bg-white/5 text-ink-onnight/60 hover:bg-white/10'

  if (LANGUAGES.length > MAX_BUTTONS) {
    return (
      <select
        value={active}
        onChange={e => choose(e.target.value)}
        aria-label={t('lang_toggle_label')}
        className={`min-h-[32px] rounded-full font-semibold ${pad} ${idle}`}
      >
        {LANGUAGES.map(({ code, nativeName }) => (
          <option key={code} value={code} lang={code}>{nativeName}</option>
        ))}
      </select>
    )
  }

  return (
    <div role="group" aria-label={t('lang_toggle_label')} className="flex gap-1">
      {LANGUAGES.map(({ code, label, nativeName }) => (
        <button
          key={code}
          type="button"
          lang={code}
          title={nativeName}
          aria-pressed={active === code}
          onClick={() => choose(code)}
          className={`min-w-[32px] min-h-[32px] rounded-full font-semibold transition ${pad} ${
            active === code ? 'bg-primary text-night' : idle
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
