// frontend/src/pages/ContactUs.jsx
//
// The form has no backend endpoint to submit to yet, so rather than ship a
// dead "Send" button, onSubmit builds a pre-filled mailto: link and opens
// the user's mail client — genuinely functional today, zero backend work,
// and a one-line swap for a real POST /api/contact once that exists (same
// "one function to change later" pattern as config/auth.js and
// config/entitlements.js elsewhere in this codebase).
import { useState } from 'react'
import Seo from '../components/Seo'
import StaticPageLayout from '../components/StaticPageLayout'
import SocialButtons from '../components/SocialButtons'

const CONTACT_EMAIL = 'contact@starjyotish.com'
const inputCls = 'w-full border border-line rounded-lg px-3 py-2 bg-parchment text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary'

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  function update(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const subject = encodeURIComponent(form.subject || 'Message from Star Jyotish contact page')
    const body = encodeURIComponent(
      `${form.message}\n\n—\n${form.name}\n${form.email}`
    )
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
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
          Questions about a reading, a payment, or anything else? Email us directly, or use the form below — it
          opens a pre-filled email in your mail app, so nothing gets lost.
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

        <form onSubmit={handleSubmit} className="bg-parchment-card border border-line rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Your name</label>
              <input type="text" required value={form.name} onChange={update('name')} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Your email</label>
              <input type="email" required value={form.email} onChange={update('email')} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Subject</label>
            <input type="text" value={form.subject} onChange={update('subject')} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Message</label>
            <textarea required rows={5} value={form.message} onChange={update('message')} className={inputCls} />
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-night font-semibold text-sm px-6 py-2.5 rounded-full shadow transition w-full sm:w-auto"
          >
            Send Message
          </button>
        </form>

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
