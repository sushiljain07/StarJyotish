// frontend/src/components/auth/PhoneOtpForm.jsx
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sendOtp } from '../../api/auth'
import { useAuth } from '../../contexts/AuthContext'

const inputCls = 'w-full border border-line rounded-lg px-3 py-2 bg-parchment text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary'
const buttonCls = 'w-full bg-primary hover:bg-primary-dark disabled:bg-primary/40 text-night font-semibold py-2.5 rounded-full transition'

// Mirrors backend/db/repositories/otp_repository.py's OTP_RESEND_COOLDOWN_SECONDS
// — purely a UX hint to grey out "Resend" for a moment; the backend is the
// real enforcement and returns its own wait time in a 429 if this drifts.
const RESEND_COOLDOWN_SECONDS = 30

export default function PhoneOtpForm({ onSuccess }) {
  const { t } = useTranslation()
  const { loginWithPhone } = useAuth()

  const [step, setStep] = useState('phone') // 'phone' | 'code'
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const codeInputRef = useRef(null)

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
      await sendOtp(phone)
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
      await sendOtp(phone)
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
      const user = await loginWithPhone(phone, code)
      onSuccess?.(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'phone') {
    return (
      <form onSubmit={handleSendCode} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">{t('login_phone_label')}</label>
          <input
            type="tel" inputMode="tel" required autoFocus
            placeholder="+91 98765 43210"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className={inputCls}
          />
        </div>
        {error && <p className="text-vermillion text-sm">{error}</p>}
        <button type="submit" disabled={loading} className={buttonCls}>
          {loading ? t('login_sending') : t('login_send_code')}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          {t('login_code_label')} <span className="text-ink-muted font-normal">({phone})</span>
        </label>
        <input
          ref={codeInputRef}
          type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required autoFocus
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
        <button type="button" onClick={() => { setStep('phone'); setCode(''); setError('') }}
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
