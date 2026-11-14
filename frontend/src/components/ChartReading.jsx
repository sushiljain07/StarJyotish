import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { fetchReport, readingBody } from '../api/reportCache'
import { useLatestRequest } from '../hooks/useLatestRequest'
import { Button } from './ui'
import { errorMessage } from '../api/errors'
import { currentLanguage } from '../i18n/languages'

// Faint kundli wheel SVG watermark
function KundliWheelBg() {
  const spokes = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180
    return {
      x1: 150 + 45 * Math.cos(a), y1: 150 + 45 * Math.sin(a),
      x2: 150 + 140 * Math.cos(a), y2: 150 + 140 * Math.sin(a),
    }
  })
  return (
    <svg width="320" height="320" viewBox="0 0 300 300"
         className="absolute inset-0 m-auto pointer-events-none select-none"
         style={{ opacity: 0.05, color: '#D4AF37' }}>
      <circle cx="150" cy="150" r="140" stroke="currentColor" fill="none" strokeWidth="1" />
      <circle cx="150" cy="150" r="90"  stroke="currentColor" fill="none" strokeWidth="0.8" />
      <circle cx="150" cy="150" r="45"  stroke="currentColor" fill="none" strokeWidth="0.8" />
      {spokes.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
              stroke="currentColor" strokeWidth="0.5" />
      ))}
    </svg>
  )
}

// Section display config — ordered as they appear in the prediction.
// Titles are the reading_section_<key> locale keys.
const SECTION_CONFIG = [
  { key: 'identity',       icon: '🌟' },
  { key: 'strengths',      icon: '💪' },
  { key: 'currentperiod',  icon: '⏳' },
  { key: 'prediction',     icon: '🔮' },
  { key: 'health',         icon: '💚' },
  { key: 'relationships',  icon: '💫' },
]

export default function ChartReading({ input, topic, onOpenRajyogas, active = true }) {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  const [status, setStatus]           = useState('idle')
  const [predSections, setPredSections] = useState({})
  const [activeYogas, setActiveYogas] = useState([])
  const [errorMsg, setErrorMsg]       = useState('')
  const [provider, setProvider]       = useState(null)

  // Staggered visibility per section
  const [visible, setVisible]         = useState([])


  const lang = currentLanguage()
  const beginRequest = useLatestRequest()

  // Section fade-in timers, cleared on a new request and on unmount.
  const timersRef = useRef([])
  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }
  useEffect(() => clearTimers, [])

  // Cached per chart + language for the session (api/reportCache.js);
  // Regenerate passes force to reach the server again.
  async function generate({ force = false } = {}) {
    const { isCurrent } = beginRequest()
    clearTimers()
    setStatus('loading')
    setPredSections({})
    setVisible([])
    setErrorMsg('')

    try {
      const data = await fetchReport('/api/kundli/reading', readingBody(input, lang),
        { force, fallback: 'Error generating prediction' })
      if (!isCurrent()) return

      const secs = data.prediction_sections || {}
      setPredSections(secs)
      setActiveYogas(data.active_yogas || [])
      setProvider(data.llm_provider || null)
      setStatus('done')

      // Stagger each section's fade-in, 380ms apart
      SECTION_CONFIG.forEach((c, i) => {
        if (secs[c.key]) {
          timersRef.current.push(setTimeout(() => setVisible(prev => [...prev, c.key]), i * 380))
        }
      })
    } catch (e) {
      if (!isCurrent()) return
      setErrorMsg(errorMessage(e, t('error_something_wrong')))
      setStatus('error')
    }
  }

  // A finished reading follows the language toggle (the other language is
  // fetched once, then cached).
  const shownLangRef = useRef(lang)
  useEffect(() => {
    // Hidden (kept-mounted) panels in /insights wait: the ref keeps the
    // language last shown, so the switch happens once, on becoming active.
    if (!active || shownLangRef.current === lang) return
    shownLangRef.current = lang
    // While loading, the new request makes the old one stale (its reply
    // is still cached).
    if (status === 'done' || status === 'loading') generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, active])

  // Auto-reveal for signed-in visitors — the "Reveal My Prediction" click
  // gate exists for the anonymous funnel (it's a deliberate curiosity/
  // conversion moment for someone who just typed in a birth chart with no
  // account), but a signed-in person coming from their own home page
  // already made that decision by opening the tab. Making them click
  // again to see their own reading is friction with no purpose. Guarded
  // by a ref (not just `status === 'idle'`) so this fires exactly once
  // per mount, not every time status happens to cycle back through idle.
  const autoRevealedRef = useRef(false)
  useEffect(() => {
    if (isAuthenticated && status === 'idle' && !autoRevealedRef.current) {
      autoRevealedRef.current = true
      generate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])


  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (status === 'idle' && !isAuthenticated) return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">🔮</div>
      <h2 className="text-xl font-bold text-ink mb-2">{t('reading_idle_heading')}</h2>
      <p className="text-ink-muted text-sm mb-6 max-w-sm">
        {t('reading_idle_body')}
      </p>
      <Button size="lg" onClick={() => generate()}>
        {t('reading_reveal_btn')}
      </Button>
      <p className="text-xs text-ink-muted mt-3">{t('reading_powered_by_generic')}</p>
    </div>
  )

  // ── LOADING ───────────────────────────────────────────────────────────────
  // Also covers the one render where an authenticated visitor is still
  // technically 'idle' before the auto-reveal effect above fires — without
  // this, that single frame would flash the "Reveal My Prediction" button
  // pointlessly before immediately replacing it with this same screen.
  if (status === 'loading' || (status === 'idle' && isAuthenticated)) return (
    <div role="status" className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div aria-hidden="true" className="text-4xl mb-4 motion-safe:animate-spin">⏳</div>
      <p className="font-medium text-primary-ink">{t('reading_loading_text')}</p>
      <div className="mt-4 w-48 h-1.5 bg-night/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full motion-safe:animate-pulse"
             style={{ width: '75%', background: 'linear-gradient(90deg,#2D1B69,#D4AF37)' }} />
      </div>
      <p className="text-xs text-ink-muted mt-3">{t('reading_loading_sub')}</p>
    </div>
  )

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (status === 'error') return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <p className="text-vermillion font-medium mb-4">{errorMsg}</p>
      <Button onClick={() => generate()}>
        {t('topic_report_try_again')}
      </Button>
    </div>
  )

  // ── DONE ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto py-4 px-2 space-y-4">

      {/* ── PREDICTION SECTIONS ─────────────────────────────────────────────── */}
      {SECTION_CONFIG.map(({ key, icon }) => {
        const title = t(`reading_section_${key}`)
        const content = predSections[key]
        if (!content) return null
        const isVisible = visible.includes(key)
        const isHealth        = key === 'health'
        const isRelationships = key === 'relationships'

        if (isHealth) return (
          <div key={key}
               className={`rounded-xl overflow-hidden shadow-sm border border-good/30
                          transition-all duration-700
                          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="bg-gradient-to-r from-good to-good/80 px-5 py-3 flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              <h3 className="font-bold text-white text-base">{title}</h3>
            </div>
            <div className="bg-parchment-card px-5 py-4">
              <p className="text-ink text-sm leading-relaxed max-w-prose" style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
            </div>
          </div>
        )

        if (isRelationships) return (
          <div key={key}
               className={`rounded-xl overflow-hidden shadow-sm border border-bad/30
                          transition-all duration-700
                          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="bg-gradient-to-r from-bad to-bad/80 px-5 py-3 flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              <h3 className="font-bold text-white text-base">{title}</h3>
            </div>
            <div className="bg-parchment-card px-5 py-4">
              <p className="text-ink text-sm leading-relaxed max-w-prose" style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
            </div>
          </div>
        )

        // Default section style
        return (
          <div key={key}
               className={`rounded-xl p-5 bg-parchment-card border border-primary/30 shadow-sm
                          transition-all duration-700
                          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{icon}</span>
              <h3 className="font-bold text-primary-ink text-base">{title}</h3>
            </div>
            <p className="text-ink text-sm leading-relaxed max-w-prose"
               style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
          </div>
        )
      })}

      {/* ── RAJ YOGA TEASER — deterministic, links to the Rajyogas tab which is
          the single source of truth for the full breakdown (career topic only,
          since only career has a Rajyogas tab to send people to). ──────────── */}
      {topic === 'career' && activeYogas.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl p-6"
             style={{
               background: '#1A0A3B',
               border: '2px solid #D4AF37',
               boxShadow: '0 0 28px rgba(212,175,55,0.18)',
             }}>
          <KundliWheelBg />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👑</span>
              <h3 className="font-extrabold text-lg" style={{ color: '#D4AF37' }}>
                {t('reading_yogas_title', { count: activeYogas.length })}
              </h3>
            </div>
            <p className="text-white text-sm leading-relaxed font-medium mb-4">
              {t(activeYogas.length > 2 ? 'reading_yogas_body_more' : 'reading_yogas_body',
                { names: activeYogas.slice(0, 2).map(y => y.name).join(t('reading_list_and')) })}
            </p>
            <button onClick={onOpenRajyogas}
              className="px-4 py-2 rounded-lg font-semibold text-sm"
              style={{ background: '#D4AF37', color: '#1A0A3B' }}>
              {t('reading_see_yogas')}
            </button>
          </div>
        </div>
      )}

      <div className="text-center pb-4">
        <button onClick={() => generate({ force: true })}
          className="text-sm text-primary-ink hover:text-ink transition">
          {t('reading_regenerate_btn')}
        </button>
      </div>

      {/* ── DISCLAIMER ───────────────────────────────────────────────────── */}
      {provider && (
        <p className="text-center text-[11px] text-ink-muted pb-1">
          {t('reading_powered_by', { provider })}
        </p>
      )}
      <p className="text-center text-[11px] text-ink-muted leading-relaxed px-4 pb-2">
        {t('disclaimer')}
      </p>
    </div>
  )
}
