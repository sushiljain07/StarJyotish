// frontend/src/pages/ContactUs.jsx
//
// Sends via POST /api/contact (Resend, same provider already wired up for
// email OTP — see backend/services/contact_email.py) instead of the old
// mailto: link that opened the visitor's own mail app. That worked, but
// "opens a different application" isn't a great in-app experience, and
// now that Resend is already integrated for OTP, sending this one more
// email server-side is a small addition rather than new infrastructure.
import { useState } from 'react'
import Seo from '../components/Seo'
import StaticPageLayout from '../components/StaticPageLayout'
import SocialButtons from '../components/SocialButtons'
import { API_BASE } from '../api/config'

const CONTACT_EMAIL = 'contact@starjyotish.com'
const inputCls = 'w-full border border-line rounded-lg px-3 py-2 bg-parchment text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60'

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('')

  function update(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      const resp = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.detail?.[0]?.msg || err.detail || 'Could not send your message. Please try again.')
      }
      setStatus('sent')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  return (
    <>
      <Seo
        title="Contact Us"
        description="Get in touch with Star Jyotish — email us directly or send a message, and we'll get back to you."
        path="/contact"
      />
      <StaticPageLayout title="Contact Us" maxWidth="max-w-2xl">
        <p>
          Questions about a reading, a payment, or anything else? Email us directly, or use the form below —
          it&apos;s sent straight to our team.
        </p>

        <div className="bg-parchment-card border border-line rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-ink-faint mb-1">Email</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-dark font-semibold hover:underline break-all">
              {CONTACT_EMAIL}
            </a>
          </div>
          <button
            type="button"
            onClick={() => alert('WhatsApp support is coming soon — for now, please use email or the form below.')}
            className="bg-[#25D366]/10 text-[#1d9c4f] border border-[#25D366]/30 text-xs font-semibold px-3.5 py-2 rounded-full transition hover:bg-[#25D366]/20 shrink-0 self-start sm:self-auto"
          >
            💬 Chat on WhatsApp — coming soon
          </button>
        </div>

        {status === 'sent' ? (
          <div className="bg-sage-light border border-sage/30 rounded-2xl p-6 text-center">
            <p className="text-2xl mb-2">🙏</p>
            <p className="font-serif font-semibold text-ink text-lg mb-1">Message sent</p>
            <p className="text-ink-muted text-sm">Thanks for reaching out — we&apos;ll get back to you soon.</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 text-sm text-primary-dark hover:underline font-medium"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-parchment-card border border-line rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Your name</label>
                <input type="text" required disabled={status === 'sending'} value={form.name} onChange={update('name')} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Your email</label>
                <input type="email" required disabled={status === 'sending'} value={form.email} onChange={update('email')} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Subject</label>
              <input type="text" disabled={status === 'sending'} value={form.subject} onChange={update('subject')} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Message</label>
              <textarea required rows={5} disabled={status === 'sending'} value={form.message} onChange={update('message')} className={inputCls} />
            </div>
            {status === 'error' && <p className="text-vermillion text-sm">{errorMsg}</p>}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-night font-semibold text-sm px-6 py-2.5 rounded-full shadow transition w-full sm:w-auto"
            >
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <p className="text-xs font-semibold tracking-wide uppercase text-ink-faint mb-3">Follow along</p>
          <div className="flex justify-center">
            <SocialButtons dark={false} />
          </div>
          <p className="text-ink-faint text-xs mt-2">Links go live as soon as our channels do.</p>
        </div>
      </StaticPageLayout>
    </>
  )
}
