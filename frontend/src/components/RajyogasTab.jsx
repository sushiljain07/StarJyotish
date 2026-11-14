import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { currentLanguage } from '../i18n/languages'
import { chartBody, fetchReport } from '../api/reportCache'
import { useLatestRequest } from '../hooks/useLatestRequest'
import { hasPremiumAccess } from '../config/entitlements'
import PaywallCard from './PaywallCard'
import { errorMessage } from '../api/errors'

// Icons by stable backend id. The reference text (meaning, characteristics,
// benefits) lives in the locale files as rajyoga_ref_<id>_<part>.
const YOGA_ICONS = {
  raja_yoga:      '👑',
  dharma_karma:   '⚖️',
  budha_aditya:   '☀️',
  gaja_kesari:    '🐘',
  hamsa:          '🦢',
  malavya:        '💎',
  sasa:           '🪐',
  bhadra:         '📚',
  ruchaka:        '⚔️',
  amala:          '🌸',
  adhi:           '🏛️',
  dhana:          '💰',
  kendra_trikona: '🔺',
  yogakaraka:     '🌟',
  neecha_bhanga:  '🔄',
  vipareeta:      '🌪️',
  kahala:         '🦁',
  lakshmi:        '🌺',
  saraswati:      '🎶',
  chamara:        '🪭',
}

const REF_LIST = [1, 2, 3, 4]

function YogaCard({ yoga, defaultOpen }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(defaultOpen ?? false)
  const icon = YOGA_ICONS[yoga.id] ?? '✨'
  const refKey = part => `rajyoga_ref_${yoga.id}_${part}`
  const info = i18n.exists(refKey('meaning'))
    ? {
        meaning: t(refKey('meaning')),
        characteristics: REF_LIST.map(n => t(refKey(`c${n}`))),
        benefits: REF_LIST.map(n => t(refKey(`b${n}`))),
      }
    : null

  const isPresent = yoga.present

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden transition-all ${
      isPresent
        ? 'bg-parchment-card border-emerald-200 border-l-4 border-l-emerald-500'
        : 'bg-night/[0.03] border-line'
    }`}>
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <span className={`text-2xl mt-0.5 ${isPresent ? '' : 'opacity-40'}`}>{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-bold text-sm ${isPresent ? 'text-ink' : 'text-ink-muted'}`}>
              {yoga.yoga}
            </h3>
            {isPresent
              ? <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{t('rajyogas_present')}</span>
              : <span className="text-xs font-medium bg-ink-faint/25 text-ink-muted px-2 py-0.5 rounded-full">{t('rajyogas_absent')}</span>
            }
          </div>
          <p className={`text-xs mt-1 leading-relaxed ${isPresent ? 'text-ink-muted' : 'text-ink-muted'}`}>
            {yoga.description}
          </p>
        </div>
        <span className={`text-ink-faint text-xs mt-1 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Expandable details */}
      {open && info && (
        <div className={`px-4 pb-4 pt-0 border-t ${isPresent ? 'border-emerald-100' : 'border-line'}`}>
          {/* Meaning */}
          <div className="mt-3">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isPresent ? 'text-primary-ink' : 'text-ink-muted'}`}>
              {t('rajyogas_what_is')}
            </p>
            <p className={`text-xs leading-relaxed ${isPresent ? 'text-ink' : 'text-ink-muted'}`}>
              {info.meaning}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            {/* Characteristics */}
            <div className={`rounded-lg p-3 ${isPresent ? 'bg-primary-light' : 'bg-night/10'}`}>
              <p className={`text-xs font-semibold mb-2 ${isPresent ? 'text-primary-ink' : 'text-ink-muted'}`}>
                {t('rajyogas_characteristics')}
              </p>
              <ul className="space-y-1">
                {info.characteristics.map((c, i) => (
                  <li key={i} className={`flex gap-1.5 text-xs leading-relaxed ${isPresent ? 'text-ink' : 'text-ink-muted'}`}>
                    <span className={`mt-1 shrink-0 w-1 h-1 rounded-full ${isPresent ? 'bg-primary' : 'bg-ink-faint'}`} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div className={`rounded-lg p-3 ${isPresent ? 'bg-emerald-50' : 'bg-night/10'}`}>
              <p className={`text-xs font-semibold mb-2 ${isPresent ? 'text-emerald-700' : 'text-ink-muted'}`}>
                {t('rajyogas_benefits')}
              </p>
              <ul className="space-y-1">
                {info.benefits.map((b, i) => (
                  <li key={i} className={`flex gap-1.5 text-xs leading-relaxed ${isPresent ? 'text-ink' : 'text-ink-muted'}`}>
                    <span className={`mt-1 shrink-0 w-1 h-1 rounded-full ${isPresent ? 'bg-emerald-400' : 'bg-ink-faint'}`} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RajyogasTab({ input, active = true }) {
  const { t } = useTranslation()
  const lang = currentLanguage()
  const [status, setStatus]     = useState('idle')
  const beginRequest = useLatestRequest()
  const [result, setResult]     = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Pure rule-based yoga detection (services/career_analysis.check_all_yogas),
  // not an LLM call — auto-load like every other non-LLM tab, instead of
  // gating behind a click. `load` is defined further down but hoisted, since
  // it's a function declaration, not a const/arrow function.
  useEffect(() => {
    if (hasPremiumAccess()) load()
  }, [])

  // A loaded (or loading) result follows the language toggle.
  const shownLangRef = useRef(lang)
  useEffect(() => {
    // Hidden (kept-mounted) panels in /insights wait: the ref keeps the
    // language last shown, so the switch happens once, on becoming active.
    if (!active || shownLangRef.current === lang) return
    shownLangRef.current = lang
    if (hasPremiumAccess() && (status === 'done' || status === 'loading')) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, active])

  if (!hasPremiumAccess()) {
    return (
      <PaywallCard
        icon="👑"
        title={t('rajyogas_paywall_title')}
        body={t('rajyogas_paywall_body')}
        bullets={[t('rajyogas_paywall_bullet_1'), t('rajyogas_paywall_bullet_2'), t('rajyogas_paywall_bullet_3')]}
      />
    )
  }

  // Rule-based, but still cached for the session so revisiting the tab
  // is instant.
  async function load() {
    const { isCurrent } = beginRequest()
    setStatus('loading')
    setErrorMsg('')
    try {
      const data = await fetchReport('/api/rajyogas', { ...chartBody(input), language: lang }, { fallback: t('rajyogas_error_generic') })
      if (!isCurrent()) return
      setResult(data)
      setStatus('done')
    } catch (e) {
      if (!isCurrent()) return
      setErrorMsg(errorMessage(e, t('rajyogas_error_generic')))
      setStatus('error')
    }
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i}
              className="w-2.5 h-2.5 rounded-full bg-primary motion-safe:animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p className="text-sm text-ink-muted">{t('rajyogas_scanning')}</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="text-3xl">⚠️</div>
        <p className="text-sm text-vermillion">{errorMsg}</p>
        <button onClick={load} className="text-sm text-primary-ink underline">{t('rajyogas_try_again')}</button>
      </div>
    )
  }

  const present = result.yogas.filter(y => y.present)

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="bg-night rounded-2xl p-5 text-primary-light shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">👑</span>
          <div>
            <h2 className="font-bold text-lg leading-tight">{t('rajyogas_title')}</h2>
            <p className="text-ink-onnight text-xs">
              {t('rajyogas_subtitle')}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <div className="bg-primary/15 rounded-xl px-4 py-2 text-center inline-block">
            <div className="text-2xl font-extrabold text-primary-light">{present.length}</div>
            <div className="text-xs text-primary-light">{t('rajyogas_active_label')}</div>
          </div>
        </div>
      </div>

      {/* Present yogas — open by default */}
      {present.length > 0 ? (
        <div>
          <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-3 px-1">
            {t('rajyogas_active_heading', { count: present.length })}
          </h3>
          <div className="space-y-3">
            {present.map((y, i) => <YogaCard key={i} yoga={y} defaultOpen={true} />)}
          </div>
        </div>
      ) : (
        <div className="bg-parchment-card rounded-xl p-6 text-center border border-line shadow-sm">
          <div className="text-3xl mb-2">🌱</div>
          <p className="text-ink-muted text-sm">{t('rajyogas_none')}</p>
          <p className="text-ink-muted text-xs mt-1">{t('rajyogas_none_note')}</p>
        </div>
      )}
    </div>
  )
}
