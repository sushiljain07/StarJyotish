import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import BirthForm from '../components/BirthForm'

// ── Section metadata ─────────────────────────────────────────────────────────
const SECTIONS = [
  // New v2 sections
  { key: 'career_destiny_brief', icon: '✨', style: 'gold'     },
  { key: 'natural_strengths',    icon: '💪', style: 'gradient' },
  { key: 'best_career_path',         icon: '🎯', style: 'verdict'  },
  { key: 'job_vs_business_verdict',  icon: '⚖️',  style: 'verdict'  },
  { key: 'career_rajyogas',          icon: '👑', style: 'tinted'   },
  { key: 'peak_career_window',   icon: '⏳', style: 'plain'    },
  { key: 'current_phase',        icon: '🚀', style: 'plain'    },
  { key: 'academic_path',        icon: '🎓', style: 'tinted'   },
  { key: 'gemstone_recommendation',  icon: '💎', style: 'gem'    },
  { key: 'rudraksha_recommendation', icon: '🔴', style: 'tinted' },
  { key: 'empowering_remedies',      icon: '🙏', style: 'plain'  },
  { key: 'closing_blessing',     icon: '🌟', style: 'gradient' },
  // Legacy section keys (shown only if returned by older reports)
  { key: 'lagna_personality',    icon: '🌟', style: 'gradient' },
  { key: 'job_vs_business',      icon: '⚖️',  style: 'verdict'  },
  { key: 'tenth_house_d1',       icon: '🏛️',  style: 'plain'   },
  { key: 'd10_analysis',         icon: '📊',  style: 'plain'   },
  { key: 'amatyakaraka',         icon: '💫',  style: 'tinted'  },
  { key: 'career_fields',        icon: '💼',  style: 'plain'   },
  { key: 'student_streams',      icon: '🎓',  style: 'tinted'  },
  { key: 'yogas_combinations',   icon: '✨',  style: 'plain'   },
  { key: 'dasha_predictions',    icon: '⏳',  style: 'plain'   },
  { key: 'remedies',             icon: '🙏',  style: 'plain'   },
  { key: 'conclusion',           icon: '🔮',  style: 'gradient'},
]

// ── Content renderer (mirrors ChartReading.jsx pattern) ───────────────────────
function SectionContent({ content, light = false }) {
  if (!content) return <span className="text-gray-400 italic">—</span>
  const bullets = content
    .split('\n')
    .map(line => line.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)
  if (bullets.length <= 1)
    return <p className={`text-sm leading-relaxed ${light ? 'text-indigo-100' : 'text-gray-700'}`}>{content}</p>
  return (
    <ul className="space-y-2">
      {bullets.map((b, i) => (
        <li key={i} className={`flex gap-2 text-sm leading-relaxed ${light ? 'text-indigo-100' : 'text-gray-700'}`}>
          <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-current opacity-50" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  )
}

// ── Section card ─────────────────────────────────────────────────────────────
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

  // plain (default)
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

// ── Loading state ─────────────────────────────────────────────────────────────
function LoadingCard() {
  const steps = [
    'Calculating D1 birth chart…',
    'Building D10 Dasamsa…',
    'Checking Amatyakaraka…',
    'Analysing career yogas…',
    'Generating AI report…',
  ]
  const [step] = useState(() => steps[Math.floor(Math.random() * steps.length)])
  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-md p-10 flex flex-col items-center text-center">
      <div className="text-4xl mb-4 animate-spin">⏳</div>
      <p className="text-indigo-700 font-semibold">Analysing your career chart…</p>
      <p className="text-xs text-slate-400 mt-1">{step}</p>
      <div className="mt-5 w-52 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-pulse w-3/4" />
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CareerReport() {
  const { i18n } = useTranslation()

  const [status, setStatus]             = useState('idle')   // idle | loading | done | error
  const [report, setReport]             = useState(null)
  const [submittedInput, setSubmittedInput] = useState(null)
  const [errorMsg, setErrorMsg]         = useState('')

  async function handleSubmit(input) {
    setStatus('loading')
    setReport(null)
    setErrorMsg('')
    setSubmittedInput(input)
    const language = i18n.language?.startsWith('hi') ? 'hi' : 'en'
    try {
      const resp = await fetch('/api/career-report', {
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

  function reset() {
    setStatus('idle')
    setReport(null)
    setErrorMsg('')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Hero header ── */}
      <div className="bg-primary px-6 pt-12 pb-8 text-center">
        <div className="text-4xl mb-3">💼</div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Career Report</h1>
        <p className="text-indigo-200 mt-1 text-sm">Vedic Career &amp; Vocation Analysis</p>
        <div className="mt-4 flex justify-center gap-2">
          {['en', 'hi'].map(lang => (
            <button
              key={lang}
              onClick={() => i18n.changeLanguage(lang)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                i18n.language.startsWith(lang)
                  ? 'bg-white text-primary'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {lang === 'en' ? 'EN' : 'हि'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 px-4 -mt-4 pb-12">

        {/* Form (idle + error) */}
        {(status === 'idle' || status === 'error') && (
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-md p-6 sm:p-8">
            <BirthForm onSubmit={handleSubmit} loading={false} />
            {status === 'error' && (
              <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {errorMsg}
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {status === 'loading' && <LoadingCard />}

        {/* Report */}
        {status === 'done' && report && (
          <div className="max-w-2xl mx-auto pt-2">

            {/* Info bar */}
            <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 mb-5 shadow-sm border border-slate-200">
              <div className="text-sm text-slate-600 truncate pr-4">
                {submittedInput?.name && (
                  <>
                    <span className="font-semibold text-slate-800">{submittedInput.name}</span>
                    <span className="mx-1.5 text-slate-300">·</span>
                  </>
                )}
                <span>{submittedInput?.place}</span>
                <span className="mx-1.5 text-slate-300">·</span>
                <span>{submittedInput?.date}</span>
              </div>
              <button
                onClick={reset}
                className="shrink-0 text-xs text-primary hover:text-primary-dark font-semibold transition"
              >
                ← New
              </button>
            </div>

            {/* Section cards */}
            <div className="space-y-4">
              {SECTIONS.map(({ key, icon, style }) =>
                report[key]?.content
                  ? <SectionCard key={key} icon={icon} section={report[key]} style={style} />
                  : null
              )}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-8">
              <button
                onClick={reset}
                className="px-8 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-semibold transition shadow-md"
              >
                Analyse Another Chart
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
