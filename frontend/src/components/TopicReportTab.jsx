// frontend/src/components/TopicReportTab.jsx
//
// Generalized version of CareerReportTab.jsx's rendering engine — same
// styled cards (gold/gem/gradient/verdict/tinted/plain), same idle → loading
// → done/error flow, parameterized by topic instead of hardcoded to career.
// CareerReportTab.jsx itself is left untouched; this is a fresh component
// for the topics being built now (relationship first, health/wealth next),
// not a refactor of the already-shipped career page.
//
// Unlike Career, these reports are NOT behind hasPremiumAccess() — the
// monetization plan gates only the Career Report, so relationship/health/
// wealth stay free, consistent with the rest of the free tier.
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE } from '../api/config'
import SegmentedToggle from './SegmentedToggle'

const TOPIC_CONFIG = {
  relationship: {
    icon: '💕',
    endpoint: '/api/relationship-report',
    loadingSubtext: 'D9 · 7th House · Darakaraka · Marriage Timing',
    // The single biggest accuracy failure this report can make is
    // confidently predicting a future marriage to someone already married —
    // this one extra question is what lets the backend tell the difference.
    requiresMaritalStatus: true,
    sections: [
      { key: 'relationship_destiny_brief',   icon: '✨', style: 'gold'     },
      { key: 'natural_relationship_style',   icon: '💞', style: 'gradient' },
      { key: 'ideal_partner_energy',         icon: '🎯', style: 'verdict'  },
      { key: 'love_or_arranged_verdict',     icon: '⚖️', style: 'verdict'  },
      { key: 'marriage_blessings',           icon: '👑', style: 'tinted'   },
      { key: 'marriage_timing_window',       icon: '⏳', style: 'plain'    },
      { key: 'current_phase',                icon: '🚀', style: 'plain'    },
      { key: 'gemstone_recommendation',      icon: '💎', style: 'gem'      },
      { key: 'rudraksha_recommendation',     icon: '🔴', style: 'tinted'   },
      { key: 'empowering_remedies',          icon: '🙏', style: 'plain'    },
      { key: 'closing_blessing',             icon: '🌟', style: 'gradient' },
    ],
  },
  // Backend endpoint/files use the more descriptive "wealth" naming, but the
  // topic id here must stay 'finance' — matching config/topics.js, which
  // already pairs this topic with division: 2 (D2 Hora) elsewhere in the app.
  finance: {
    icon: '💰',
    endpoint: '/api/wealth-report',
    loadingSubtext: '2nd & 11th House · D2 Hora · Future Dashas',
    sections: [
      { key: 'wealth_destiny_brief',  icon: '✨', style: 'gold'     },
      { key: 'natural_wealth_style',  icon: '📈', style: 'gradient' },
      { key: 'primary_income_path',   icon: '🎯', style: 'verdict'  },
      { key: 'wealth_blessings',      icon: '👑', style: 'tinted'   },
      { key: 'wealth_timing_window',  icon: '⏳', style: 'plain'    },
      { key: 'current_phase',         icon: '🚀', style: 'plain'    },
      { key: 'gemstone_recommendation',  icon: '💎', style: 'gem'    },
      { key: 'rudraksha_recommendation', icon: '🔴', style: 'tinted' },
      { key: 'empowering_remedies',   icon: '🙏', style: 'plain'    },
      { key: 'closing_blessing',      icon: '🌟', style: 'gradient' },
    ],
  },
  // Never diagnostic — see services/health_analysis.py's module docstring
  // for why this deliberately avoids disease-naming/timing claims and
  // sticks to constitution + routine guidance instead.
  health: {
    icon: '🌿',
    endpoint: '/api/health-report',
    loadingSubtext: '6th House · Lagna Lord · D6 Shashthamsha',
    sections: [
      { key: 'health_destiny_brief',           icon: '✨', style: 'gold'     },
      { key: 'natural_constitution',           icon: '🌱', style: 'gradient' },
      { key: 'vitality_and_routine',           icon: '🎯', style: 'verdict'  },
      { key: 'disease_resistance_blessings',   icon: '🛡️', style: 'tinted'   },
      { key: 'health_timing_window',           icon: '⏳', style: 'plain'    },
      { key: 'current_phase',                  icon: '🚀', style: 'plain'    },
      { key: 'gemstone_recommendation',        icon: '💎', style: 'gem'      },
      { key: 'rudraksha_recommendation',       icon: '🔴', style: 'tinted'   },
      { key: 'empowering_remedies',            icon: '🙏', style: 'plain'    },
      { key: 'closing_blessing',               icon: '🌟', style: 'gradient' },
    ],
  },
}

const EFFORT_COLOR = {
  low:    'text-emerald-600 bg-emerald-50',
  medium: 'text-primary-dark bg-primary-light',
  high:   'text-vermillion bg-vermillion-light',
}

function SectionContent({ content }) {
  if (!content) return <span className="text-ink-faint italic">—</span>
  const bullets = content
    .split('\n')
    .map(l => l.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)
  if (bullets.length <= 1)
    return <p className="text-sm leading-relaxed text-ink">{content}</p>
  return (
    <ul className="space-y-2">
      {bullets.map((b, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink">
          <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-current opacity-50" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  )
}

function SectionCard({ icon, section, style }) {
  if (!section?.content) return null

  if (style === 'gold') return (
    <div className="bg-parchment-card rounded-2xl shadow-md overflow-hidden border border-primary/30">
      <div className="bg-gradient-to-r from-primary to-primary-dark px-5 py-3.5 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-extrabold text-night text-lg leading-tight">{section.title}</h3>
      </div>
      <div className="px-5 py-4"><SectionContent content={section.content} /></div>
    </div>
  )

  if (style === 'gem') return (
    <div className="bg-parchment-card rounded-2xl shadow-md overflow-hidden border border-mauve/30">
      <div className="bg-gradient-to-r from-sage to-mauve px-5 py-3.5 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-extrabold text-white text-lg leading-tight">{section.title}</h3>
      </div>
      <div className="px-5 py-4"><SectionContent content={section.content} /></div>
    </div>
  )

  if (style === 'gradient') return (
    <div className="bg-parchment-card rounded-xl shadow-sm overflow-hidden border border-primary/30">
      <div className="bg-night px-5 py-3 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-primary-light text-base">{section.title}</h3>
      </div>
      <div className="px-5 py-4"><SectionContent content={section.content} /></div>
    </div>
  )

  if (style === 'verdict') return (
    <div className="bg-parchment-card rounded-xl p-5 shadow-sm border-l-4 border-vermillion border border-vermillion/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-vermillion text-base">{section.title}</h3>
      </div>
      <SectionContent content={section.content} />
    </div>
  )

  if (style === 'tinted') return (
    <div className="bg-primary-light rounded-xl p-5 shadow-sm border border-primary/30">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-primary-dark text-base">{section.title}</h3>
      </div>
      <SectionContent content={section.content} />
    </div>
  )

  return (
    <div className="bg-parchment-card rounded-xl p-5 shadow-sm border border-line">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-primary text-base">{section.title}</h3>
      </div>
      <SectionContent content={section.content} />
    </div>
  )
}

function HighlightCard({ h }) {
  const [open, setOpen] = useState(false)
  const effortCls = EFFORT_COLOR[h.effort_required] ?? EFFORT_COLOR.medium
  return (
    <div className="bg-parchment-card rounded-xl border border-line shadow-sm overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full text-left p-4 flex items-start gap-3">
        <div className={`shrink-0 w-8 h-8 rounded-full text-night text-sm font-extrabold flex items-center justify-center ${h.rank === 1 ? 'bg-primary-dark' : 'bg-primary'}`}>
          {h.rank === 1 ? '★' : h.rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-ink text-sm">{h.title}</span>
            {h.category && <span className="text-xs text-ink-muted bg-night/10 px-2 py-0.5 rounded-full">{h.category}</span>}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${effortCls}`}>{h.effort_required} effort</span>
          </div>
          {h.timeline && <p className="text-xs text-ink-faint mt-0.5">{h.timeline}</p>}
        </div>
        <span className={`text-ink-faint text-xs mt-1 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-line space-y-3">
          {h.reason && (
            <div>
              <p className="text-xs font-semibold text-primary-dark uppercase tracking-wide mb-1">Why this fits your chart</p>
              <p className="text-xs text-ink-muted leading-relaxed">{h.reason}</p>
            </div>
          )}
          {h.key_planets?.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {h.key_planets.map(p => (
                <span key={p} className="text-xs bg-primary-light text-primary-dark px-2 py-0.5 rounded-full">{p}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function TopicReportTab({ topic, input }) {
  const { t, i18n } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [status, setStatus] = useState('idle')
  const [report, setReport] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('unmarried')

  const cfg = TOPIC_CONFIG[topic]

  // Auto-reveal for signed-in visitors — see ChartReading.jsx for the
  // reasoning. Deliberately excluded for topics needing marital status
  // first (relationship): that idle screen isn't a "do you want to see
  // this" gate, it's a required input, so it stays even for signed-in
  // users regardless of this flag. Declared before the `!cfg` early
  // return below (hooks can't follow a conditional return), with `cfg?.`
  // guards since cfg is briefly undefined for an invalid topic prop.
  const autoRevealedRef = useRef(false)
  useEffect(() => {
    if (isAuthenticated && cfg && !cfg.requiresMaritalStatus && status === 'idle' && !autoRevealedRef.current) {
      autoRevealedRef.current = true
      generate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, topic])

  if (!cfg) return null

  const maritalStatusOptions = [
    { id: 'unmarried',        label: t('relationship_marital_status_unmarried') },
    { id: 'married',          label: t('relationship_marital_status_married') },
    { id: 'divorced_widowed', label: t('relationship_marital_status_divorced_widowed') },
  ]

  async function generate() {
    setStatus('loading')
    setReport(null)
    setErrorMsg('')
    const language = i18n.language?.startsWith('hi') ? 'hi' : 'en'
    try {
      const resp = await fetch(`${API_BASE}${cfg.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: input.date, time: input.time, place: input.place, language,
          ...(cfg.requiresMaritalStatus ? { marital_status: maritalStatus } : {}),
        }),
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.detail ?? t('topic_report_error_generic'))
      }
      setReport(await resp.json())
      setStatus('done')
    } catch (e) {
      setErrorMsg(e.message || t('topic_report_error_generic'))
      setStatus('error')
    }
  }

  const skipIdleScreen = isAuthenticated && !cfg.requiresMaritalStatus

  if (status === 'idle' && !skipIdleScreen) return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">{cfg.icon}</div>
      <h2 className="text-xl font-bold text-ink mb-2">{t(`topic_report_${topic}_idle_heading`)}</h2>
      <p className="text-ink-muted text-sm mb-6 max-w-sm">{t(`topic_report_${topic}_idle_body`)}</p>
      {cfg.requiresMaritalStatus && (
        <div className="mb-6">
          <p className="text-xs font-medium text-ink-muted mb-2">{t('relationship_marital_status_question')}</p>
          <SegmentedToggle
            options={maritalStatusOptions}
            active={maritalStatus}
            onChange={setMaritalStatus}
            className="justify-center"
          />
        </div>
      )}
      <button
        onClick={generate}
        className="px-8 py-3 bg-primary hover:bg-primary-dark text-night font-semibold rounded-full transition shadow-md"
      >
        {t(`topic_report_${topic}_generate_button`)}
      </button>
      <p className="text-xs text-ink-faint mt-3">{t('reading_powered_by_generic')} · {t('topic_report_takes_seconds')}</p>
    </div>
  )

  // Also covers the one render where a signed-in visitor (on a topic that
  // doesn't need marital-status input first) is still technically 'idle'
  // before the auto-reveal effect above fires.
  if (status === 'loading' || (status === 'idle' && skipIdleScreen)) return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-4xl mb-4 animate-spin">⏳</div>
      <p className="text-primary-dark font-semibold">{t(`topic_report_${topic}_loading_text`)}</p>
      <p className="text-xs text-ink-faint mt-1">{cfg.loadingSubtext}</p>
      <div className="mt-5 w-52 h-1.5 bg-night/10 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-pulse w-3/4" />
      </div>
    </div>
  )

  if (status === 'error') return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <p className="text-red-600 font-medium mb-4">{errorMsg}</p>
      <button
        onClick={() => setStatus('idle')}
        className="px-6 py-2 bg-primary hover:bg-primary-dark text-night rounded-full text-sm transition"
      >
        {t('topic_report_try_again')}
      </button>
    </div>
  )

  const hasHighlights = report?.highlights?.length > 0

  return (
    <div className="max-w-2xl mx-auto py-2 space-y-4">
      {hasHighlights && (
        <div className="bg-parchment-card rounded-xl border border-line shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎯</span>
            <h3 className="font-bold text-ink text-base">{t(`topic_report_${topic}_highlights_heading`)}</h3>
            <span className="text-xs text-ink-faint ml-1">· {t('topic_report_tap_to_expand')}</span>
          </div>
          <div className="space-y-2">
            {report.highlights.map(h => <HighlightCard key={h.rank} h={h} />)}
          </div>
        </div>
      )}

      {cfg.sections.map(({ key, icon, style }) =>
        report?.sections?.[key]?.content
          ? <SectionCard key={key} icon={icon} section={report.sections[key]} style={style} />
          : null
      )}

      <div className="text-center mt-6 pb-2">
        <button
          onClick={() => setStatus('idle')}
          className="text-sm text-primary hover:text-primary-dark transition font-medium"
        >
          ↺ {t('topic_report_regenerate')}
        </button>
      </div>

      {report?.llm_provider && (
        <p className="text-center text-[11px] text-ink-faint pb-1">
          {t('reading_powered_by', { provider: report.llm_provider })}
        </p>
      )}
      <p className="text-center text-[11px] text-ink-faint leading-relaxed px-4 pb-4">{t('disclaimer')}</p>
    </div>
  )
}
