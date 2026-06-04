import { useState } from 'react'

const SECTIONS = [
  { key: 'lagna_personality',  icon: '🌟', style: 'gradient' },
  { key: 'job_vs_business',    icon: '⚖️',  style: 'verdict'  },
  { key: 'tenth_house_d1',     icon: '🏛️',  style: 'plain'   },
  { key: 'd10_analysis',       icon: '📊',  style: 'plain'   },
  { key: 'amatyakaraka',       icon: '💫',  style: 'tinted'  },
  { key: 'career_fields',      icon: '💼',  style: 'plain'   },
  { key: 'student_streams',   icon: '🎓',  style: 'tinted'  },
  { key: 'yogas_combinations', icon: '✨',  style: 'plain'   },
  { key: 'dasha_predictions',  icon: '⏳',  style: 'plain'   },
  { key: 'remedies',           icon: '🙏',  style: 'plain'   },
  { key: 'conclusion',         icon: '🔮',  style: 'gradient' },
]

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
  if (style === 'gradient') return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-5 shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-white text-base">{section.title}</h3>
      </div>
      <SectionContent content={section.content} light />
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
    <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-primary text-base">{section.title}</h3>
      </div>
      <SectionContent content={section.content} />
    </div>
  )
}

export default function CareerReportTab({ input }) {
  const [status, setStatus] = useState('idle')
  const [report, setReport] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function generate() {
    setStatus('loading')
    setReport(null)
    setErrorMsg('')
    try {
      const resp = await fetch('/api/career-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: input.date, time: input.time, place: input.place }),
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
        Deep analysis using D1 + D10 charts, Amatyakaraka, 12 career yogas,
        job vs business verdict, and Dasha timing.
      </p>
      <button
        onClick={generate}
        className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition shadow-md"
      >
        Generate Career Report
      </button>
      <p className="text-xs text-gray-400 mt-3">Powered by AI · takes ~15 seconds</p>
    </div>
  )

  if (status === 'loading') return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-4xl mb-4 animate-spin">⏳</div>
      <p className="text-indigo-700 font-semibold">Analysing your career chart…</p>
      <p className="text-xs text-slate-400 mt-1">D1 + D10 · Amatyakaraka · 12 yogas · AI report</p>
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

  return (
    <div className="max-w-2xl mx-auto py-2">
      <div className="space-y-4">
        {SECTIONS.map(({ key, icon, style }) => (
          <SectionCard
            key={key}
            icon={icon}
            section={report[key] ?? { title: key, content: '' }}
            style={style}
          />
        ))}
      </div>
      <div className="text-center mt-8">
        <button
          onClick={() => setStatus('idle')}
          className="text-sm text-primary hover:text-primary-dark transition font-medium"
        >
          ↺ Regenerate Report
        </button>
      </div>
    </div>
  )
}
