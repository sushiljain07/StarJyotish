// frontend/src/components/auth/VerifiedContactField.jsx
//
// A login identity on the Profile page — the mobile number or the email —
// is never a plain text edit. Adding or changing either one goes through a
// code sent to the new address first (routers/account.py's
// /account/phone/* and /account/email/* endpoints). Email especially:
// sign-in links accounts by verified email, so an unverified email edit
// would let someone claim another person's address.
//
// This component owns the whole mini state machine (view → entering the
// value → entering a code → back to view). It renders inside Profile's
// own <form>, and React submit events bubble through the component tree,
// so every inner submit stops propagation — otherwise it would also fire
// the outer Profile save.
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'

const inputCls = 'w-full border border-line rounded-lg px-3 py-2 bg-parchment text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary'
const RESEND_COOLDOWN_SECONDS = 30

export default function VerifiedContactField({ kind = 'phone' }) {
  const { t } = useTranslation()
  const auth = useAuth()
  const { user } = auth
  const isEmail = kind === 'email'
  const sendCode = isEmail ? auth.sendEmailLinkOtp : auth.sendPhoneLinkOtp
  const verifyCode = isEmail ? auth.verifyEmailLinkOtp : auth.verifyPhoneLinkOtp
  const currentValue = isEmail ? user?.email : user?.phone_number
  const isVerified = isEmail ? !!user?.email_verified_at : !!user?.phone_number

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
    e.stopPropagation()
    setError('')
    setLoading(true)
    try {
      await sendCode(phone)
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
      await sendCode(phone)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    e.stopPropagation()
    setError('')
    setLoading(true)
    try {
      await verifyCode(phone, code)
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
            type={isEmail ? 'email' : 'tel'} inputMode={isEmail ? 'email' : 'tel'} required autoFocus
            placeholder={isEmail ? 'you@example.com' : '+91 98765 43210'}
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
                className="text-primary-ink hover:underline disabled:text-ink-faint disabled:no-underline text-xs transition">
          {cooldown > 0 ? t('login_resend_in', { seconds: cooldown }) : t('login_resend_code')}
        </button>
      </form>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input type="text" value={currentValue || t('profile_not_set')} disabled
             className={`${inputCls} bg-parchment/60 text-ink-muted cursor-not-allowed`} />
      {currentValue ? (
        <>
          {isVerified
            ? <span className="text-sage text-xs font-medium whitespace-nowrap">{t('profile_verified')}</span>
            : <span className="text-ink-muted text-xs font-medium whitespace-nowrap">{t('profile_email_unverified')}</span>}
          <button type="button" onClick={startFlow} className="text-primary-ink hover:underline text-sm whitespace-nowrap">
            {isVerified ? t('profile_change_number') : t('profile_verify_email')}
          </button>
        </>
      ) : (
        <button type="button" onClick={startFlow}
                className="bg-primary hover:bg-primary-dark text-night text-sm font-semibold px-4 py-2 rounded-lg transition whitespace-nowrap">
          {isEmail ? t('profile_add_email') : t('profile_add_number')}
        </button>
      )}
    </div>
  )
}
