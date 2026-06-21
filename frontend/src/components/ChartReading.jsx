import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { API_BASE } from '../api/config'

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

// Section display config — ordered as they appear in the prediction
const SECTION_CONFIG = [
  { key: 'identity',       title: 'Your Cosmic Identity',          icon: '🌟' },
  { key: 'rajyogas',       title: 'The Raj Yogas in Your Chart',   icon: '👑' },
  { key: 'strengths',      title: 'Your Career Domain & Strengths',icon: '💪' },
  { key: 'currentperiod',  title: 'Your Current Life Period',       icon: '⏳' },
  { key: 'prediction',     title: 'Your Next 2–3 Years',           icon: '🔮' },
  { key: 'health',         title: 'Your Health & Vitality',        icon: '💚' },
  { key: 'relationships',  title: 'Your Love & Relationships',      icon: '💫' },
  { key: 'bridge',         title: 'What Your Full Report Reveals', icon: '🗝️'  },
]

const BENEFITS = [
  'Every Raj Yoga in your chart + exact activation procedure',
  'Your peak career window — the year, the duration, the action',
  'Job vs Business — what your chart actually favors',
  'Personalized gemstone or mantra for your specific chart',
  'Your ideal career field based on your cosmic blueprint',
]

export default function ChartReading({ input, onSwitchToCareer }) {
  const { t, i18n } = useTranslation()

  const [status, setStatus]           = useState('idle')
  const [predSections, setPredSections] = useState({})
  const [teasers, setTeasers]         = useState(null)
  const [errorMsg, setErrorMsg]       = useState('')

  // Staggered visibility per section
  const [visible, setVisible]         = useState([])
  const [showTeasers, setShowTeasers] = useState(false)
  const [showCta, setShowCta]         = useState(false)
  const [showWa, setShowWa]           = useState(false)

  // Exit intent
  const [showExitPopup, setShowExitPopup] = useState(false)
  const exitShown = useRef(false)

  // WhatsApp
  const [waNumber, setWaNumber]       = useState('')
  const [waSubmitted, setWaSubmitted] = useState(false)

  const ctaRef = useRef(null)

  async function generate() {
    setStatus('loading')
    setPredSections({})
    setTeasers(null)
    setVisible([])
    setShowTeasers(false)
    setShowCta(false)
    setShowWa(false)
    exitShown.current = false
    setShowExitPopup(false)
    setErrorMsg('')

    try {
      const lang = i18n.language.startsWith('hi') ? 'hi' : 'en'
      const res = await fetch(`${API_BASE}/api/kundli/reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, language: lang }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Error generating prediction')
      }
      const data = await res.json()

      const secs = data.prediction_sections || {}
      setPredSections(secs)
      setTeasers(data.teasers || null)
      setStatus('done')

      // Stagger each section's fade-in, 380ms apart
      const count = SECTION_CONFIG.filter(c => secs[c.key]).length
      SECTION_CONFIG.forEach((c, i) => {
        if (secs[c.key]) {
          setTimeout(() => setVisible(prev => [...prev, c.key]), i * 380)
        }
      })
      const base = count * 380 + 300
      setTimeout(() => setShowTeasers(true), base)
      setTimeout(() => setShowCta(true),     base + 900)
      setTimeout(() => setShowWa(true),      base + 1700)
    } catch (e) {
      setErrorMsg(e.message || 'Error generating prediction')
      setStatus('error')
    }
  }

  // Exit intent — fire once when mouse moves toward browser top
  useEffect(() => {
    if (status !== 'done') return
    function onMove(e) {
      if (!exitShown.current && e.clientY < 50) {
        exitShown.current = true
        setShowExitPopup(true)
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [status])

  function handleWaSubmit() {
    if (waNumber.trim()) {
      try {
        localStorage.setItem('astroguru_wa', JSON.stringify({
          number: waNumber.trim(), savedAt: new Date().toISOString(),
        }))
      } catch {}
      setWaSubmitted(true)
    }
  }

  function scrollToCta() {
    setShowExitPopup(false)
    setTimeout(() => ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80)
  }

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (status === 'idle') return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">🔮</div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Free Career Prediction</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-sm">
        Discover the Raj Yogas in your birth chart and what the next 2–3 years hold for your career — completely free.
      </p>
      <button onClick={generate}
        className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition shadow-md">
        Reveal My Prediction
      </button>
      <p className="text-xs text-gray-400 mt-3">Powered by Jyotish Guru AI</p>
    </div>
  )

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (status === 'loading') return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-4xl mb-4 animate-spin">⏳</div>
      <p className="font-medium" style={{ color: '#7C3AED' }}>Reading your birth chart…</p>
      <div className="mt-4 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full animate-pulse"
             style={{ width: '75%', background: 'linear-gradient(90deg,#2D1B69,#D4AF37)' }} />
      </div>
      <p className="text-xs text-gray-400 mt-3">Identifying Raj Yogas in your chart…</p>
    </div>
  )

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (status === 'error') return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <p className="text-red-600 font-medium mb-4">{errorMsg}</p>
      <button onClick={() => setStatus('idle')}
        className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm transition">
        Try Again
      </button>
    </div>
  )

  // ── DONE ──────────────────────────────────────────────────────────────────
  const teaser1 = teasers?.teaser1 || 'Activation Ritual for Your Raj Yogas'
  const teaser2 = teasers?.teaser2 || 'Your Peak Career Window'
  const teaser3 = teasers?.teaser3 || 'Job or Business? What Your Chart Actually Says'

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 space-y-4">

      {/* ── PREDICTION SECTIONS ─────────────────────────────────────────────── */}
      {SECTION_CONFIG.map(({ key, title, icon }) => {
        const content = predSections[key]
        if (!content) return null
        const isVisible = visible.includes(key)
        const isRajyoga       = key === 'rajyogas'
        const isBridge        = key === 'bridge'
        const isHealth        = key === 'health'
        const isRelationships = key === 'relationships'

        if (isRajyoga) return (
          <div key={key}
               className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-700
                          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
               style={{
                 background: '#1A0A3B',
                 border: '2px solid #D4AF37',
                 boxShadow: '0 0 28px rgba(212,175,55,0.18)',
               }}>
            <KundliWheelBg />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{icon}</span>
                <h3 className="font-extrabold text-lg" style={{ color: '#D4AF37' }}>{title}</h3>
              </div>
              <p className="text-white text-sm leading-relaxed font-medium"
                 style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
            </div>
          </div>
        )

        if (isBridge) return (
          <div key={key}
               className={`rounded-xl p-5 transition-all duration-700
                          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
               style={{
                 background: 'linear-gradient(135deg,#2D1B69,#1A0A3B)',
                 border: '1px solid rgba(212,175,55,0.4)',
               }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{icon}</span>
              <h3 className="font-bold text-base" style={{ color: '#D4AF37' }}>{title}</h3>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed"
               style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
          </div>
        )

        if (isHealth) return (
          <div key={key}
               className={`rounded-xl overflow-hidden shadow-sm border border-green-200
                          transition-all duration-700
                          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="bg-gradient-to-r from-green-500 to-emerald-400 px-5 py-3 flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              <h3 className="font-bold text-white text-base">{title}</h3>
            </div>
            <div className="bg-white px-5 py-4">
              <p className="text-gray-700 text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
            </div>
          </div>
        )

        if (isRelationships) return (
          <div key={key}
               className={`rounded-xl overflow-hidden shadow-sm border border-rose-200
                          transition-all duration-700
                          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="bg-gradient-to-r from-rose-500 to-pink-400 px-5 py-3 flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              <h3 className="font-bold text-white text-base">{title}</h3>
            </div>
            <div className="bg-white px-5 py-4">
              <p className="text-gray-700 text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
            </div>
          </div>
        )

        // Default section style
        return (
          <div key={key}
               className={`rounded-xl p-5 bg-white border border-amber-100 shadow-sm
                          transition-all duration-700
                          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{icon}</span>
              <h3 className="font-bold text-primary text-base">{title}</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed"
               style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
          </div>
        )
      })}

      {/* ── THREE LOCKED TEASER CARDS ─────────────────────────────────────── */}
      <div className={`transition-all duration-700
                      ${showTeasers ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {showTeasers && (
          <>
            <p className="text-center text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">
              Locked in Your Full Report
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[teaser1, teaser2, teaser3].map((title, i) => (
                <div key={i} className="rounded-xl p-4"
                     style={{ background: '#1A0A3B', border: '1px solid rgba(212,175,55,0.4)' }}>
                  <div className="flex items-start gap-2 mb-2">
                    <span className="shrink-0 text-lg mt-0.5" style={{ color: '#D4AF37' }}>🔒</span>
                    <p className="font-semibold text-sm leading-tight" style={{ color: '#D4AF37' }}>{title}</p>
                  </div>
                  <p className="text-white text-xs leading-relaxed"
                     style={{ filter: 'blur(4px)', userSelect: 'none' }}>
                    Revealed exclusively in your full Career Report
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── CONVERSION SECTION ────────────────────────────────────────────── */}
      <div className={`transition-all duration-700
                      ${showCta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
           ref={ctaRef}>
        {showCta && (
          <div className="rounded-2xl p-6 space-y-5"
               style={{ background: '#1A0A3B', border: '1px solid rgba(212,175,55,0.35)' }}>

            <h3 className="font-bold text-center text-lg" style={{ color: '#D4AF37' }}>
              🌟 Your Full CareerJyotish Report Includes:
            </h3>

            <ul className="space-y-2">
              {BENEFITS.map((b, i) => (
                <li key={i} className="flex gap-2 text-white text-sm">
                  <span className="shrink-0" style={{ color: '#D4AF37' }}>✦</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <div className="group relative">
              <button
                onClick={onSwitchToCareer}
                className="w-full py-4 font-bold text-base rounded-xl
                           transition-transform duration-200 group-hover:scale-[1.03]"
                style={{
                  background: 'linear-gradient(135deg,#C9A227,#F5D060,#C9A227)',
                  color: '#1A0A3B',
                }}>
                Unlock My Full Career Report →
              </button>
              <p className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-500
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                "Most people who ignore their Raj Yoga never discover what they were truly capable of."
              </p>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400 pt-6">
              <span>📱 WhatsApp Delivery</span>
              <span>⚡ Ready in 24 Hours</span>
              <span>🔒 Secure Payment</span>
            </div>

            <p className="text-center text-gray-300 text-sm">₹499 only — less than one counselling session</p>

            {/* Testimonial */}
            <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-gray-300 text-sm italic text-center leading-relaxed">
                "My free prediction showed me two Raj Yogas I never knew existed. I bought the full
                report to learn how to activate them. Best ₹499 I ever spent."
              </p>
              <p className="text-center text-xs mt-2" style={{ color: '#D4AF37' }}>
                — Divya M., Nagpur &nbsp;⭐⭐⭐⭐⭐
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── WHATSAPP LEAD CAPTURE ─────────────────────────────────────────── */}
      <div className={`transition-all duration-700
                      ${showWa ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {showWa && !waSubmitted && (
          <div className="rounded-xl p-4"
               style={{ border: '1px solid rgba(147,51,234,0.45)', background: 'rgba(45,27,105,0.35)' }}>
            <p className="text-white text-sm mb-3">
              📲 Want a reminder when your peak career window opens? Enter your WhatsApp number for a free timing alert.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="tel"
                value={waNumber}
                onChange={e => setWaNumber(e.target.value)}
                placeholder="WhatsApp number"
                className="flex-1 px-3 py-2 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none"
                style={{ background: 'rgba(30,10,60,0.8)', border: '1px solid rgba(147,51,234,0.6)' }}
              />
              <button
                onClick={handleWaSubmit}
                className="px-4 py-2 rounded-lg font-semibold text-sm shrink-0 w-full sm:w-auto"
                style={{ background: '#D4AF37', color: '#1A0A3B' }}>
                Notify Me →
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-2">No spam. Only your personal career timing updates.</p>
          </div>
        )}
        {waSubmitted && (
          <div className="rounded-xl p-4 text-center"
               style={{ background: 'rgba(4,120,87,0.15)', border: '1px solid rgba(16,185,129,0.4)' }}>
            <p className="text-emerald-400 text-sm">
              ✓ We'll notify you on WhatsApp when your peak career window opens.
            </p>
          </div>
        )}
      </div>

      <div className="text-center pb-4">
        <button onClick={() => setStatus('idle')}
          className="text-sm text-primary hover:text-primary-dark transition">
          ↺ Regenerate Prediction
        </button>
      </div>

      {/* ── DISCLAIMER ───────────────────────────────────────────────────── */}
      <p className="text-center text-[11px] text-slate-400 leading-relaxed px-4 pb-2">
        {t('disclaimer')}
      </p>

      {/* ── EXIT INTENT POPUP ─────────────────────────────────────────────── */}
      {showExitPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.82)' }}>
          <div className="max-w-sm w-full rounded-2xl p-6 text-center"
               style={{
                 background: '#2D1B69',
                 border: '2px solid #D4AF37',
                 boxShadow: '0 0 40px rgba(212,175,55,0.2)',
               }}>
            <div className="text-4xl mb-3">👑</div>
            <p className="text-white font-bold text-lg mb-3 leading-snug">
              Wait — your chart shows Raj Yogas that only rare charts carry.
            </p>
            <p className="text-gray-300 text-sm mb-5">
              Are you sure you want to leave without knowing how to activate them?
            </p>
            <button onClick={scrollToCta}
              className="w-full py-3 font-bold rounded-xl mb-3 text-base"
              style={{ background: 'linear-gradient(135deg,#C9A227,#F5D060,#C9A227)', color: '#1A0A3B' }}>
              Show Me How →
            </button>
            <button onClick={() => setShowExitPopup(false)}
              className="w-full py-2 text-gray-400 text-sm hover:text-white transition">
              I'll miss out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
