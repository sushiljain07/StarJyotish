// frontend/src/components/auth/MobileNumberField.jsx
//
// The Profile page's mobile-number field needs more than a text input:
// the phone number is this account's login identity, so changing it has
// to go through the same OTP-verification step adding one for the first
// time does — see routers/account.py's send_phone_link_otp /
// verify_phone_link_otp for why that's a distinct pair of endpoints from
// the login ones. This component owns that whole mini state machine
// (view → entering a number → entering a code → back to view) so
// Profile.jsx doesn't have to.
//
// Fully self-contained — reads the current user and the two link
// functions straight from AuthContext rather than taking them as props,
// the same pattern AccountMenu.jsx uses.
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'

const inputCls = 'w-full border border-line rounded-lg px-3 py-2 bg-parchment text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary'
const RESEND_COOLDOWN_SECONDS = 30

export default function MobileNumberField() {
  const { t } = useTranslation()
  const { user, sendPhoneLinkOtp, verifyPhoneLinkOtp } = useAuth()

  // 'view' | 'phone' | 'code'
  const [step, setStep] = useState('view')
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

  function startFlow() {
    setError('')
    setPhone('')
    setCode('')
    setStep('phone')
  }

  function cancel() {
    setError('')
    setStep('view')
  }

  async function handleSendCode(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await sendPhoneLinkOtp(phone)
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
      await sendPhoneLinkOtp(phone)
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
      await verifyPhoneLinkOtp(phone, code)
      setStep('view')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'phone') {
    return (
      <form onSubmit={handleSendCode} className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="tel" inputMode="tel" required autoFocus
            placeholder="+91 98765 43210"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className={inputCls}
          />
          <button type="submit" disabled={loading}
                  className="bg-primary hover:bg-primary-dark disabled:bg-primary/40 text-night text-sm font-semibold px-4 py-2 rounded-lg transition whitespace-nowrap">
            {loading ? t('login_sending') : t('login_send_code')}
          </button>
          <button type="button" onClick={cancel} className="text-ink-muted hover:text-ink text-sm shrink-0">
            {t('profile_cancel')}
          </button>
        </div>
        {error && <p className="text-vermillion text-sm">{error}</p>}
      </form>
    )
  }

  if (step === 'code') {
    return (
      <form onSubmit={handleVerify} className="space-y-2">
        <p className="text-ink-muted text-xs">{t('profile_code_sent_to', { phone })}</p>
        <div className="flex items-center gap-2">
          <input
            ref={codeInputRef}
            type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required autoFocus
            placeholder="••••••"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className={`${inputCls} tracking-[0.4em] text-center`}
          />
          <button type="submit" disabled={loading || code.length !== 6}
                  className="bg-primary hover:bg-primary-dark disabled:bg-primary/40 text-night text-sm font-semibold px-4 py-2 rounded-lg transition whitespace-nowrap">
            {loading ? t('login_verifying') : t('login_verify')}
          </button>
          <button type="button" onClick={cancel} className="text-ink-muted hover:text-ink text-sm shrink-0">
            {t('profile_cancel')}
          </button>
        </div>
        {error && <p className="text-vermillion text-sm">{error}</p>}
        <button type="button" onClick={handleResend} disabled={cooldown > 0}
                className="text-primary-dark hover:underline disabled:text-ink-faint disabled:no-underline text-xs transition">
          {cooldown > 0 ? t('login_resend_in', { seconds: cooldown }) : t('login_resend_code')}
        </button>
      </form>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input type="text" value={user?.phone_number || t('profile_not_set')} disabled
             className={`${inputCls} bg-parchment/60 text-ink-muted cursor-not-allowed`} />
      {user?.phone_number ? (
        <>
          <span className="text-sage text-xs font-medium whitespace-nowrap">{t('profile_verified')}</span>
          <button type="button" onClick={startFlow} className="text-primary-dark hover:underline text-sm whitespace-nowrap">
            {t('profile_change_number')}
          </button>
        </>
      ) : (
        <button type="button" onClick={startFlow}
                className="bg-primary hover:bg-primary-dark text-night text-sm font-semibold px-4 py-2 rounded-lg transition whitespace-nowrap">
          {t('profile_add_number')}
        </button>
      )}
    </div>
  )
}
