import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const SECTION_ORDER = [
  'Chart Overview',
  'Personality & Appearance',
  'Career & Wealth',
  'Relationships & Marriage',
  'Health',
  'Spiritual Inclination',
  'Current Period (Dasha)',
]

export default function ChartReading({ input }) {
  const { t, i18n } = useTranslation()
  const [status, setStatus]   = useState('idle')
  const [sections, setSections] = useState([])
  const [errorMsg, setErrorMsg] = useState('')

  async function generate() {
    setStatus('loading')
    setSections([])
    setErrorMsg('')
    try {
      const lang = i18n.language.startsWith('hi') ? 'hi' : 'en'
      const res = await fetch('/api/kundli/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, language: lang }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || t('reading_error'))
      }
      const data = await res.json()
      const sorted = SECTION_ORDER.map(
        title => data.sections.find(s => s.title === title) || { title, icon: '', content: '' }
      )
      setSections(sorted)
      setStatus('done')
    } catch (e) {
      setErrorMsg(e.message || t('reading_error'))
      setStatus('error')
    }
  }

  if (status === 'idle') return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">🔮</div>
      <h2 className="text-xl font-bold text-amber-900 mb-2">Vedic Chart Reading</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-sm">{t('reading_desc')}</p>
      <button onClick={generate}
        className="px-8 py-3 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-full transition shadow-md">
        {t('reading_generate_btn')}
      </button>
      <p className="text-xs text-gray-400 mt-3">{t('reading_powered_by')}</p>
    </div>
  )

  if (status === 'loading') return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-4xl mb-4 animate-spin">⏳</div>
      <p className="text-amber-800 font-medium">{t('reading_generating')}</p>
      <div className="mt-4 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-purple-500 rounded-full animate-pulse w-3/4" />
      </div>
    </div>
  )

  if (status === 'error') return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <p className="text-red-600 font-medium mb-4">{errorMsg}</p>
      <button onClick={() => setStatus('idle')}
        className="px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-full text-sm transition">
        {t('reading_regenerate')}
      </button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto py-4 px-2">
      <h2 className="text-xl font-bold text-amber-900 mb-6 text-center">{t('reading_heading')}</h2>
      <div className="space-y-4">
        {sections.map(section => (
          section.title === 'Chart Overview'
            ? (
              <div key={section.title} className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{section.icon}</span>
                  <h3 className="font-bold text-amber-800 text-base">{section.title}</h3>
                </div>
                <p className="text-amber-900 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {section.content || <span className="text-gray-400 italic">—</span>}
                </p>
              </div>
            )
            : (
              <div key={section.title} className="bg-white border border-amber-100 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{section.icon}</span>
                  <h3 className="font-bold text-purple-700">{section.title}</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {section.content || <span className="text-gray-400 italic">—</span>}
                </p>
              </div>
            )
        ))}
      </div>
      <div className="text-center mt-6">
        <button onClick={() => setStatus('idle')}
          className="text-sm text-purple-600 hover:text-purple-800 transition">
          {t('reading_regenerate')}
        </button>
      </div>
    </div>
  )
}
