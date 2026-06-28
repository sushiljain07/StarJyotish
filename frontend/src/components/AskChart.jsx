// frontend/src/components/AskChart.jsx
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { API_BASE } from '../api/config'

const MAX_QUESTIONS = 10

export default function AskChart({ input, initialQuestion = null }) {
  const { t, i18n } = useTranslation()
  const [messages, setMessages]     = useState([])
  const [questionCount, setCount]   = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading]       = useState(false)
  const [errorMsg, setErrorMsg]     = useState('')
  const [provider, setProvider]     = useState(null)
  const bottomRef = useRef(null)
  // Guards against StrictMode's double-mount in dev, and against any
  // re-render, sending the carried-over question from the landing page's
  // AI persona spotlight more than once.
  const autoSentRef = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (initialQuestion && !autoSentRef.current) {
      autoSentRef.current = true
      handleSend(initialQuestion)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion])

  const remaining = MAX_QUESTIONS - questionCount
  const limitReached = questionCount >= MAX_QUESTIONS

  async function handleSend(questionOverride) {
    const question = (questionOverride ?? inputValue).trim()
    if (!question || loading || limitReached) return

    const lang = i18n.language.startsWith('hi') ? 'hi' : 'en'
    setMessages(prev => [...prev, { role: 'user', text: question }])
    setInputValue('')
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch(`${API_BASE}/api/kundli/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, question, language: lang }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || t('ask_error'))
      }
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer }])
      setProvider(data.llm_provider || null)
      setCount(prev => prev + 1)
    } catch (e) {
      setErrorMsg(e.message || t('ask_error'))
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[60vh] min-h-[400px] bg-parchment-card rounded-xl shadow-sm border border-line overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-line flex items-center justify-between bg-night/[0.03]">
        <div>
          <div className="text-sm font-semibold text-ink">💬 {t('tab_ask')}</div>
          <div className="text-xs text-ink-faint">{t('ask_subtitle')}</div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          limitReached
            ? 'bg-red-50 text-red-500'
            : remaining === 1
            ? 'bg-vermillion-light text-vermillion'
            : 'bg-primary-light text-primary-dark'
        }`}>
          {limitReached ? t('ask_zero_left') : t('ask_questions_remaining', { count: remaining })}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="text-center py-8">
            <img src="/starjyotish.svg" alt="" className="w-8 h-8 mx-auto mb-2 opacity-60" />
            <p className="text-ink-faint text-sm">{t('ask_empty_heading', { count: MAX_QUESTIONS })}</p>
            <p className="text-ink-faint/70 text-xs mt-1">{t('ask_empty_example')}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary text-night rounded-br-sm'
                : 'bg-night/[0.04] text-ink rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-night/[0.04] rounded-2xl rounded-bl-sm px-4 py-2.5">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-ink-faint rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                <span className="w-1.5 h-1.5 bg-ink-faint rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                <span className="w-1.5 h-1.5 bg-ink-faint rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
              </div>
            </div>
          </div>
        )}
        {errorMsg && (
          <div className="text-xs text-red-500 text-center">{errorMsg}</div>
        )}
        {limitReached && (
          <div className="text-center py-3">
            <p className="text-xs text-ink-faint">{t('ask_limit_reached', { count: MAX_QUESTIONS })}</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-line bg-night/[0.03]">
        <div className="flex gap-2 items-end">
          <textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={limitReached || loading}
            placeholder={limitReached ? t('ask_limit_reached', { count: MAX_QUESTIONS }) : t('ask_placeholder')}
            rows={1}
            className="flex-1 resize-none border border-line rounded-xl px-3 py-2 text-sm bg-parchment-card focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-night/5 disabled:text-ink-faint"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || limitReached || loading}
            className="bg-primary hover:bg-primary-dark disabled:bg-night/10 text-night disabled:text-ink-faint rounded-xl px-4 py-2 text-sm font-semibold transition flex-shrink-0"
          >
            {t('ask_send')}
          </button>
        </div>
        <p className="text-[11px] text-ink-faint text-center mt-2">
          {provider ? t('reading_powered_by', { provider }) : t('reading_powered_by_generic')}
        </p>
      </div>
    </div>
  )
}
