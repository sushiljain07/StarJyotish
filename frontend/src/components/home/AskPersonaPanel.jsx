// frontend/src/components/home/AskPersonaPanel.jsx
//
// Reuses the same backend endpoint AskChart.jsx already calls
// (/api/kundli/ask) and the scope constraint already built into
// services/ai.py's ask_chart() prompt — this panel does NOT re-implement
// "only answer kundli questions" on its own, by design, so there is
// exactly one place that rule lives.
//
// Daily quota (5/day, resets at local midnight) is tracked client-side in
// localStorage since there's no backend quota table for this yet — same
// trade-off AskChart.jsx already makes with its own session-only counter,
// just persisted across page loads instead of resetting on remount. This
// is trivially bypassed by clearing storage; treat it as a UX nudge, not
// an abuse control, until a real backend quota exists.
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { API_BASE } from '../../api/config'
import JyotiAvatar from './JyotiAvatar'

const MAX_QUESTIONS = 5
const MAX_CHARS = 500
const PERSONA_NAME = 'Jyoti' // matches the existing "Ask Jyoti" voice used elsewhere on this page

function quotaKey(userId) {
  return `sj_ask_jyoti_quota_v1:${userId ?? 'anon'}`
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function loadQuota(userId) {
  try {
    const raw = localStorage.getItem(quotaKey(userId))
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed?.date === todayStr()) return parsed.count
    return 0
  } catch {
    return 0
  }
}

function saveQuota(userId, count) {
  try {
    localStorage.setItem(quotaKey(userId), JSON.stringify({ date: todayStr(), count }))
  } catch {
    // best-effort — a failed write just means the quota resets next reload
  }
}

export default function AskPersonaPanel({ userId, input }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [count, setCount] = useState(() => loadQuota(userId))
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const sessionIdRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ReflectionLoop (and any future card) can open this panel with a
  // pre-filled draft via a window event — keeps the panel decoupled from
  // its openers without prop-drilling through PersonalHome.
  useEffect(() => {
    function onOpen(e) {
      setOpen(true)
      if (e.detail?.prefill) setValue(e.detail.prefill)
    }
    window.addEventListener('sj:open-jyoti', onOpen)
    return () => window.removeEventListener('sj:open-jyoti', onOpen)
  }, [])

  const remaining = MAX_QUESTIONS - count
  const limitReached = remaining <= 0

  async function send() {
    const question = value.trim()
    if (!question || loading || limitReached || !input) return

    const lang = i18n.language.startsWith('hi') ? 'hi' : 'en'
    setMessages(prev => [...prev, { role: 'user', text: question }])
    setValue('')
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/api/kundli/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, question, language: lang, session_id: sessionIdRef.current }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || t('ask_error'))
      }
      const data = await res.json()
      if (data.session_id) sessionIdRef.current = data.session_id
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer }])
      const next = count + 1
      setCount(next)
      saveQuota(userId, next)
    } catch (e) {
      setError(e.message || t('ask_error'))
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 md:bottom-28 right-5 z-40 flex items-center gap-2.5 bg-night-light border border-primary/35 rounded-full pl-2 pr-4 py-2 shadow-xl hover:-translate-y-0.5 transition"
      >
        <span className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-1 ring-primary/40">
          <JyotiAvatar />
        </span>
        <span className="text-left">
          <span className="block text-xs font-bold text-parchment">Ask {PERSONA_NAME}</span>
          <span className="block text-[10px] text-sage">● your chart, on call</span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-[55]" onClick={() => setOpen(false)} />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] z-[60] bg-parchment border-l border-line flex flex-col shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-line bg-night">
          <span className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-1 ring-primary/40">
            <JyotiAvatar />
          </span>
          <div>
            <h3 className="font-serif font-semibold text-[16.5px] text-primary-light">{PERSONA_NAME}</h3>
            <p className="text-[11px] text-ink-onnight/50">Your personal chart guide</p>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto text-ink-onnight/50 hover:text-ink-onnight text-lg">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3.5">
          {messages.length === 0 && (
            <div className="max-w-[92%] bg-parchment-card border border-line rounded-2xl rounded-bl-sm px-4 py-2.5 text-[13px] leading-relaxed text-ink-muted">
              Namaste 🙏 I only know your birth chart and today&apos;s transits — ask me anything about your career,
              relationships, health, or timing. I can&apos;t answer outside your kundli.
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                m.role === 'user'
                  ? 'self-end bg-primary text-night rounded-br-sm font-medium'
                  : 'self-start bg-parchment-card border border-line text-ink-muted rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="self-start bg-parchment-card border border-line rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-ink-faint rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-ink-faint rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-ink-faint rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
          {error && <p className="text-xs text-vermillion text-center">{error}</p>}
          <div ref={bottomRef} />
        </div>

        <div className="px-5 pt-3 border-t border-line bg-parchment-card" style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom,0px))" }}>
          <p className="text-[11px] text-ink-faint mb-2">
            {limitReached
              ? t('ask_limit_reached', { count: MAX_QUESTIONS })
              : t('ask_questions_remaining', { count: remaining })}
          </p>
          <div className="flex gap-2 items-end">
            <textarea
              value={value}
              onChange={e => setValue(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleKeyDown}
              disabled={limitReached || loading}
              maxLength={MAX_CHARS}
              rows={1}
              placeholder={t('ask_placeholder')}
              className="flex-1 resize-none bg-parchment-card border border-line rounded-xl px-3 py-2.5 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={!value.trim() || limitReached || loading}
              className="w-11 h-11 rounded-xl bg-primary disabled:bg-line disabled:text-ink-faint text-night font-bold shrink-0"
            >
              ↑
            </button>
          </div>
          <p className="text-[10px] text-ink-faint text-right mt-1">{value.length} / {MAX_CHARS}</p>
        </div>
      </div>
    </>
  )
}
