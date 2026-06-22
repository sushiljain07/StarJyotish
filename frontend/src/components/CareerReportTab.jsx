import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { API_BASE } from '../api/config'
import { hasPremiumAccess } from '../config/entitlements'
import PaywallCard from './PaywallCard'

// New v2 section order — warm, aspirational labels
const SECTIONS = [
  { key: 'career_destiny_brief', icon: '✨', style: 'gold'     },
  { key: 'natural_strengths',    icon: '💪', style: 'gradient' },
  { key: 'best_career_path',         icon: '🎯', style: 'verdict'  },
  { key: 'job_vs_business_verdict',  icon: '⚖️',  style: 'verdict'  },
  { key: 'career_rajyogas',          icon: '👑', style: 'tinted'   },
  { key: 'peak_career_window',   icon: '⏳', style: 'plain'    },
  { key: 'current_phase',        icon: '🚀', style: 'plain'    },
  { key: 'academic_path',        icon: '🎓', style: 'tinted'   },
  { key: 'gemstone_recommendation',  icon: '💎', style: 'gem'  },
  { key: 'rudraksha_recommendation', icon: '🔴', style: 'tinted' },
  { key: 'empowering_remedies',      icon: '🙏', style: 'plain'  },
  { key: 'closing_blessing',     icon: '🌟', style: 'gradient' },
  // Legacy section keys — shown if returned by older reports
  { key: 'lagna_personality',    icon: '🌟', style: 'gradient' },
  { key: 'job_vs_business',      icon: '⚖️',  style: 'verdict'  },
  { key: 'tenth_house_d1',       icon: '🏛️',  style: 'plain'   },
  { key: 'd10_analysis',         icon: '📊',  style: 'plain'   },
  { key: 'amatyakaraka',         icon: '💫',  style: 'tinted'  },
  { key: 'career_fields',        icon: '💼',  style: 'plain'   },
  { key: 'student_streams',      icon: '🎓',  style: 'tinted'  },
  { key: 'yogas_combinations',   icon: '✨',  style: 'plain'   },
  { key: 'dasha_predictions',    icon: '⏳',  style: 'plain'   },
  { key: 'transit_impact',       icon: '🌍',  style: 'tinted'  },
  { key: 'remedies',             icon: '🙏',  style: 'plain'   },
  { key: 'conclusion',           icon: '🔮',  style: 'gradient'},
]

const EFFORT_COLOR = {
  low:    'text-emerald-600 bg-emerald-50',
  medium: 'text-primary-dark bg-primary-light',
  high:   'text-vermillion bg-vermillion-light',
}

function SectionContent({ content, light = false }) {
  if (!content) return <span className="text-ink-faint italic">—</span>
  const bullets = content
    .split('\n')
    .map(l => l.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)
  const cls = light ? 'text-primary-light' : 'text-ink'
  if (bullets.length <= 1)
    return <p className={`text-sm leading-relaxed ${cls}`}>{content}</p>
  return (
    <ul className="space-y-2">
      {bullets.map((b, i) => (
        <li key={i} className={`flex gap-2 text-sm leading-relaxed ${cls}`}>
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
      <div className="px-5 py-4">
        <SectionContent content={section.content} />
      </div>
    </div>
  )

  if (style === 'gem') return (
    <div className="bg-parchment-card rounded-2xl shadow-md overflow-hidden border border-mauve/30">
      <div className="bg-gradient-to-r from-sage to-mauve px-5 py-3.5 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-extrabold text-white text-lg leading-tight">{section.title}</h3>
      </div>
      <div className="px-5 py-4">
        <SectionContent content={section.content} />
      </div>
    </div>
  )

  if (style === 'gradient') return (
    <div className="bg-parchment-card rounded-xl shadow-sm overflow-hidden border border-primary/30">
      <div className="bg-night px-5 py-3 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-primary-light text-base">{section.title}</h3>
      </div>
      <div className="px-5 py-4">
        <SectionContent content={section.content} />
      </div>
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

function CareerOptionCard({ opt }) {
  const [open, setOpen] = useState(false)
  const effortCls = EFFORT_COLOR[opt.effort_required] ?? EFFORT_COLOR.medium
  return (
    <div className="bg-parchment-card rounded-xl border border-line shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <div className={`shrink-0 w-8 h-8 rounded-full text-night text-sm font-extrabold flex items-center justify-center ${opt.rank === 1 ? 'bg-primary-dark' : 'bg-primary'}`}>
          {opt.rank === 1 ? '★' : opt.rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-ink text-sm">{opt.title}</span>
            <span className="text-xs text-ink-muted bg-night/10 px-2 py-0.5 rounded-full">{opt.field}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${effortCls}`}>
              {opt.effort_required} effort
            </span>
          </div>
          {opt.timeline && (
            <p className="text-xs text-ink-faint mt-0.5">{opt.timeline}</p>
          )}
        </div>
        <span className={`text-ink-faint text-xs mt-1 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-line space-y-3">
          {opt.reason && (
            <div>
              <p className="text-xs font-semibold text-primary-dark uppercase tracking-wide mb-1">Why this career?</p>
              <p className="text-xs text-ink-muted leading-relaxed">{opt.reason}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-4">
            {opt.key_planets?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-ink-muted mb-1">Key Planets</p>
                <div className="flex gap-1 flex-wrap">
                  {opt.key_planets.map(p => (
                    <span key={p} className="text-xs bg-primary-light text-primary-dark px-2 py-0.5 rounded-full">{p}</span>
                  ))}
                </div>
              </div>
            )}
            {opt.favorable_dasha && (
              <div>
                <p className="text-xs font-semibold text-ink-muted mb-1">Best Dasha</p>
                <span className="text-xs bg-primary-light text-primary-dark px-2 py-0.5 rounded-full">{opt.favorable_dasha}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CareerReportTab({ input }) {
  const { t, i18n } = useTranslation()
  const [status, setStatus] = useState('idle')
  const [report, setReport] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  if (!hasPremiumAccess()) {
    return (
      <PaywallCard
        icon="💼"
        title="Your Full Career Report"
        body="Your exact career field, whether your chart favors a job or business, your peak career window, and the precise activation protocol for every Raj Yoga in your chart — gemstone, mantra, timing, and ritual, calibrated to you."
        bullets={[
          'Your best career options, ranked for your specific chart',
          'Activation protocol for every Raj Yoga you carry',
          'Delivered as a report you can keep and revisit',
        ]}
      />
    )
  }

  async function generate() {
    setStatus('loading')
    setReport(null)
    setErrorMsg('')
    const language = i18n.language?.startsWith('hi') ? 'hi' : 'en'
    try {
      const resp = await fetch(`${API_BASE}/api/career-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: input.date, time: input.time, place: input.place, language }),
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.detail ?? 'Career analysis failed. Please try again.')
      }
      setReport(await resp.json())
      setStatus('done')
    } catch (e) {
      setErrorMsg(e.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'idle') return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">💼</div>
      <h2 className="text-xl font-bold text-ink mb-2">Vedic Career Report</h2>
      <p className="text-ink-muted text-sm mb-6 max-w-sm">
        Personalized career destiny reading using D1 + D10 charts, Amatyakaraka, career yogas,
        future dasha timing, and your top career paths — powered by your Vedic astrology skill files.
      </p>
      <button
        onClick={generate}
        className="px-8 py-3 bg-primary hover:bg-primary-dark text-night font-semibold rounded-full transition shadow-md"
      >
        Generate Career Report
      </button>
      <p className="text-xs text-ink-faint mt-3">{t('reading_powered_by_generic')} · takes ~20 seconds</p>
    </div>
  )

  if (status === 'loading') return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-4xl mb-4 animate-spin">⏳</div>
      <p className="text-primary-dark font-semibold">Reading your career destiny…</p>
      <p className="text-xs text-ink-faint mt-1">D1 + D10 · Amatyakaraka · Yogas · Future Dashas · Career Paths</p>
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
        Try Again
      </button>
    </div>
  )

  const hasOptions = report?.career_options?.length > 0

  return (
    <div className="max-w-2xl mx-auto py-2 space-y-4">

      {/* ── Career Options — prominently placed after destiny brief ── */}
      {hasOptions && (
        <div className="bg-parchment-card rounded-xl border border-line shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎯</span>
            <h3 className="font-bold text-ink text-base">Your Best Career Options</h3>
            <span className="text-xs text-ink-faint ml-1">· tap to expand</span>
          </div>
          <div className="space-y-2">
            {report.career_options.map(opt => (
              <CareerOptionCard key={opt.rank} opt={opt} />
            ))}
          </div>
        </div>
      )}

      {/* ── All narrative sections ── */}
      {SECTIONS.map(({ key, icon, style }) =>
        report[key]?.content
          ? <SectionCard key={key} icon={icon} section={report[key]} style={style} />
          : null
      )}

      <div className="text-center mt-6 pb-2">
        <button
          onClick={() => setStatus('idle')}
          className="text-sm text-primary hover:text-primary-dark transition font-medium"
        >
          ↺ Regenerate Report
        </button>
      </div>

      {/* ── DISCLAIMER ───────────────────────────────────────────────────── */}
      {report?.llm_provider && (
        <p className="text-center text-[11px] text-ink-faint pb-1">
          {t('reading_powered_by', { provider: report.llm_provider })}
        </p>
      )}
      <p className="text-center text-[11px] text-ink-faint leading-relaxed px-4 pb-4">
        {t('disclaimer')}
      </p>
    </div>
  )
}
