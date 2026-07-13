// frontend/src/components/ChartHighlight.jsx
//
// A reusable AI-powered highlight card shown beneath each chart in the
// Kundli experience. Lazy-fetches a 2-3 sentence insight from the backend
// once the user opens/selects a chart, so it never blocks the initial render.
//
// Visual language: dark night panel with amber text — identical to the
// Raj Yoga card in ChartReading.jsx so the two surfaces feel like one system.

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { API_BASE } from '../api/config'

// Faint wheel watermark — re-used from ChartReading, kept in sync
function WheelBg() {
  const spokes = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180
    return {
      x1: 80 + 24 * Math.cos(a), y1: 80 + 24 * Math.sin(a),
      x2: 80 + 72 * Math.cos(a), y2: 80 + 72 * Math.sin(a),
    }
  })
  return (
    <svg width="160" height="160" viewBox="0 0 160 160"
         className="absolute right-0 top-0 pointer-events-none select-none"
         style={{ opacity: 0.06 }}>
      <circle cx="80" cy="80" r="72" stroke="#D4AF37" fill="none" strokeWidth="1" />
      <circle cx="80" cy="80" r="46" stroke="#D4AF37" fill="none" strokeWidth="0.7" />
      <circle cx="80" cy="80" r="22" stroke="#D4AF37" fill="none" strokeWidth="0.7" />
      {spokes.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
              stroke="#D4AF37" strokeWidth="0.5" />
      ))}
    </svg>
  )
}

// Chart meta for display names + icons
const CHART_META = {
  D1:  { label: 'Lagna',         icon: '🌅', life: 'Personality & Life Path' },
  D2:  { label: 'Hora',          icon: '💰', life: 'Wealth & Finances' },
  D3:  { label: 'Drekkana',      icon: '⚔️',  life: 'Courage & Siblings' },
  D4:  { label: 'Chaturthamsha', icon: '🏠', life: 'Home & Fortune' },
  D6:  { label: 'Shashthamsha',  icon: '💚', life: 'Health & Service' },
  D7:  { label: 'Saptamsha',     icon: '👶', life: 'Children & Creativity' },
  D9:  { label: 'Navamsha',      icon: '💍', life: 'Marriage & Soul Purpose' },
  D10: { label: 'Dashamsha',     icon: '🏆', life: 'Career & Reputation' },
  D12: { label: 'Dwadashamsha',  icon: '🌳', life: 'Parents & Ancestry' },
  D16: { label: 'Shodashamsha',  icon: '🚗', life: 'Vehicles & Comforts' },
  D20: { label: 'Vimshamsha',    icon: '🕉️',  life: 'Spiritual Progress' },
  D24: { label: 'Siddhamsha',    icon: '📚', life: 'Education & Learning' },
  D27: { label: 'Nakshatramsha', icon: '💪', life: 'Strength & Vitality' },
  D30: { label: 'Trimshamsha',   icon: '🔮', life: 'Karmic Debts' },
  D40: { label: 'Khavedamsha',   icon: '✨', life: 'Auspicious Patterns' },
  D45: { label: 'Akshavedamsha', icon: '⚖️',  life: 'General Well-being' },
  D60: { label: 'Shashtiamsha',  icon: '♾️',  life: 'Past-life Karma' },
}

export default function ChartHighlight({ input, chartType = 'D1', autoLoad = false }) {
  const { i18n } = useTranslation()
  const [status, setStatus] = useState('idle')  // idle | loading | done | error
  const [text, setText] = useState('')
  const [provider, setProvider] = useState('')
  const fetchedRef = useRef(false)

  const meta = CHART_META[chartType] ?? { label: chartType, icon: '🪐', life: 'this area of life' }
  const lang = i18n.language.startsWith('hi') ? 'hi' : 'en'

  async function loadHighlight() {
    if (fetchedRef.current) return
    fetchedRef.current = true
    setStatus('loading')
    try {
      const res = await fetch(`${API_BASE}/api/kundli/chart-highlight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: input.date,
          time: input.time,
          place: input.place,
          chart_type: chartType,
          language: lang,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setText(data.highlight || '')
      setProvider(data.llm_provider || '')
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  // Auto-load (e.g. for birth chart which is always visible on mount)
  useEffect(() => {
    if (autoLoad) loadHighlight()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, chartType])

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (status === 'idle') return (
    <div className="mt-4 flex justify-center">
      <button
        onClick={loadHighlight}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
        style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37' }}
      >
        <span>{meta.icon}</span>
        <span>Get AI Insight for this Chart</span>
        <span style={{ opacity: 0.6 }}>✦</span>
      </button>
    </div>
  )

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (status === 'loading') return (
    <div className="mt-4 rounded-xl px-5 py-4 flex items-center gap-3"
         style={{ background: '#171B33', border: '1px solid rgba(212,175,55,0.25)' }}>
      <div className="text-xl animate-spin shrink-0">⏳</div>
      <div>
        <p className="text-sm font-medium" style={{ color: '#D4AF37' }}>
          Reading your {meta.label} chart…
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(212,175,55,0.5)' }}>
          Identifying key patterns in {meta.life}
        </p>
      </div>
    </div>
  )

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (status === 'error') return (
    <div className="mt-4 text-center">
      <button onClick={() => { fetchedRef.current = false; setStatus('idle') }}
        className="text-xs text-ink-faint hover:text-primary transition">
        ↺ Retry AI insight
      </button>
    </div>
  )

  // ── DONE ──────────────────────────────────────────────────────────────────
  return (
    <div className="mt-4 relative overflow-hidden rounded-xl px-5 py-4 transition-all duration-700 opacity-100"
         style={{ background: '#171B33', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 0 20px rgba(212,175,55,0.08)' }}>
      <WheelBg />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-lg">{meta.icon}</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider"
               style={{ color: 'rgba(212,175,55,0.6)' }}>
              AI Insight · {meta.label}
            </p>
            <p className="text-[11px]" style={{ color: 'rgba(212,175,55,0.4)' }}>{meta.life}</p>
          </div>
          <div className="ml-auto">
            <span className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(212,175,55,0.1)', color: 'rgba(212,175,55,0.5)' }}>
              ✦ Jyotish Guru
            </span>
          </div>
        </div>

        {/* Insight text */}
        <p className="text-sm leading-relaxed" style={{ color: '#E8DCC8' }}>
          {text}
        </p>

        {/* Footer */}
        {provider && (
          <p className="text-[10px] mt-3 text-right" style={{ color: 'rgba(212,175,55,0.3)' }}>
            Powered by {provider}
          </p>
        )}
      </div>
    </div>
  )
}
