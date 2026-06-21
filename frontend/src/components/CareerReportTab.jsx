import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { API_BASE } from '../api/config'

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
  medium: 'text-amber-600 bg-amber-50',
  high:   'text-rose-600 bg-rose-50',
}

function SectionContent({ content, light = false }) {
  if (!content) return <span className="text-gray-400 italic">—</span>
  const bullets = content
    .split('\n')
    .map(l => l.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)
  const cls = light ? 'text-indigo-100' : 'text-gray-700'
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
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-amber-200">
      <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-5 py-3.5 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-extrabold text-white text-lg leading-tight">{section.title}</h3>
      </div>
      <div className="px-5 py-4">
        <SectionContent content={section.content} />
      </div>
    </div>
  )

  if (style === 'gem') return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-teal-200">
      <div className="bg-gradient-to-r from-teal-500 to-blue-500 px-5 py-3.5 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-extrabold text-white text-lg leading-tight">{section.title}</h3>
      </div>
      <div className="px-5 py-4">
        <SectionContent content={section.content} />
      </div>
    </div>
  )

  if (style === 'gradient') return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-indigo-100">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-500 px-5 py-3 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-white text-base">{section.title}</h3>
      </div>
      <div className="px-5 py-4">
        <SectionContent content={section.content} />
      </div>
    </div>
  )

  if (style === 'verdict') return (
    <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-amber-400 border border-amber-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-amber-700 text-base">{section.title}</h3>
      </div>
      <SectionContent content={section.content} />
    </div>
  )

  if (style === 'tinted') return (
    <div className="bg-indigo-50 rounded-xl p-5 shadow-sm border border-indigo-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-indigo-700 text-base">{section.title}</h3>
      </div>
      <SectionContent content={section.content} />
    </div>
  )

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <div className={`shrink-0 w-8 h-8 rounded-full text-white text-sm font-extrabold flex items-center justify-center ${opt.rank === 1 ? 'bg-amber-500' : 'bg-indigo-600'}`}>
          {opt.rank === 1 ? '★' : opt.rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-800 text-sm">{opt.title}</span>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{opt.field}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${effortCls}`}>
              {opt.effort_required} effort
            </span>
          </div>
          {opt.timeline && (
            <p className="text-xs text-slate-400 mt-0.5">{opt.timeline}</p>
          )}
        </div>
        <span className={`text-slate-400 text-xs mt-1 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100 space-y-3">
          {opt.reason && (
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Why this career?</p>
              <p className="text-xs text-slate-600 leading-relaxed">{opt.reason}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-4">
            {opt.key_planets?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Key Planets</p>
                <div className="flex gap-1 flex-wrap">
                  {opt.key_planets.map(p => (
                    <span key={p} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{p}</span>
                  ))}
                </div>
              </div>
            )}
            {opt.favorable_dasha && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Best Dasha</p>
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{opt.favorable_dasha}</span>
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
      <h2 className="text-xl font-bold text-slate-800 mb-2">Vedic Career Report</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-sm">
        Personalized career destiny reading using D1 + D10 charts, Amatyakaraka, career yogas,
        future dasha timing, and your top career paths — powered by your Vedic astrology skill files.
      </p>
      <button
        onClick={generate}
        className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition shadow-md"
      >
        Generate Career Report
      </button>
      <p className="text-xs text-gray-400 mt-3">Powered by AI · takes ~20 seconds</p>
    </div>
  )

  if (status === 'loading') return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-4xl mb-4 animate-spin">⏳</div>
      <p className="text-indigo-700 font-semibold">Reading your career destiny…</p>
      <p className="text-xs text-slate-400 mt-1">D1 + D10 · Amatyakaraka · Yogas · Future Dashas · Career Paths</p>
      <div className="mt-5 w-52 h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
        className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm transition"
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
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎯</span>
            <h3 className="font-bold text-slate-800 text-base">Your Best Career Options</h3>
            <span className="text-xs text-slate-400 ml-1">· tap to expand</span>
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
      <p className="text-center text-[11px] text-slate-400 leading-relaxed px-4 pb-4">
        {t('disclaimer')}
      </p>
    </div>
  )
}
