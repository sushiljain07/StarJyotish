// frontend/src/components/auth/PhoneOtpForm.jsx
//
// Accepts phone number (+91 / bare 10-digit) or email address.
// Backend detects format and routes to SMS or Resend email accordingly.
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sendOtp } from '../../api/auth'
import { useAuth } from '../../contexts/AuthContext'

const inputCls = 'w-full border border-line rounded-lg px-3 py-2 bg-parchment text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary'
const buttonCls = 'w-full bg-primary hover:bg-primary-dark disabled:bg-primary/40 text-night font-semibold py-2.5 rounded-full transition'

const RESEND_COOLDOWN_SECONDS = 30

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

// eslint-disable-next-line react/prop-types
export default function PhoneOtpForm({ onSuccess }) {
  const { t } = useTranslation()
  const { loginWithPhone } = useAuth()

  const [step,       setStep]       = useState('input')
  const [identifier, setIdentifier] = useState('')
  const [code,       setCode]       = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [cooldown,   setCooldown]   = useState(0)
  const codeInputRef = useRef(null)

  const emailMode = isEmail(identifier)

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  useEffect(() => {
    if (step === 'code') codeInputRef.current?.focus()
  }, [step])

  async function handleSendCode(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await sendOtp(identifier.trim())
      setStep('code')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0) return
    setError('')
    try {
      await sendOtp(identifier.trim())
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await loginWithPhone(identifier.trim(), code)
      onSuccess?.(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'input') {
    return (
      <form onSubmit={handleSendCode} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            {t('login_phone_label')}
          </label>
          <input
            type="text"
            inputMode={emailMode ? 'email' : 'tel'}
            required autoFocus
            placeholder={emailMode ? t('login_email_hint') : t('login_phone_hint')}
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            className={inputCls}
          />
          {identifier.trim().length > 3 && (
            <p className="text-xs text-ink-faint mt-1.5">
              {emailMode
                ? 'We will email a code to this address'
                : 'We will send a code via SMS'}
            </p>
          )}
        </div>
        {error && <p className="text-vermillion text-sm">{error}</p>}
        <button type="submit" disabled={loading || identifier.trim().length < 4} className={buttonCls}>
          {loading ? t('login_sending') : t('login_send_code')}
        </button>
        <p className="text-ink-faint text-xs text-center">{t('login_disclaimer')}</p>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          {t('login_code_label')}
        </label>
        <p className="text-xs text-ink-muted mb-2">
          {emailMode ? t('login_code_sent_email') : t('login_code_sent_phone')}{' '}
          <span className="font-medium text-ink">{identifier}</span>
        </p>
        <input
          ref={codeInputRef}
          type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required
          placeholder="••••••"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className={`${inputCls} tracking-[0.5em] text-center text-lg`}
        />
      </div>
      {error && <p className="text-vermillion text-sm">{error}</p>}
      <button type="submit" disabled={loading || code.length !== 6} className={buttonCls}>
        {loading ? t('login_verifying') : t('login_verify')}
      </button>
      <div className="flex items-center justify-between text-sm">
        <button type="button"
          onClick={() => { setStep('input'); setCode(''); setError('') }}
          className="text-ink-muted hover:text-ink transition">
          {t('login_change_number')}
        </button>
        <button type="button" onClick={handleResend} disabled={cooldown > 0}
          className="text-primary-dark hover:underline disabled:text-ink-faint disabled:no-underline transition">
          {cooldown > 0 ? t('login_resend_in', { seconds: cooldown }) : t('login_resend_code')}
        </button>
      </div>
    </form>
  )
}
