// frontend/src/pages/Profile.jsx
//
// Mounted at /account, behind <ProtectedRoute> (see App.jsx). Reachable
// from AccountMenu's "My Profile" link.
//
// Deliberately account-only: name, email, mobile, avatar, language,
// timezone. An earlier version of this page also captured gender and
// date/time/place of birth — removed on purpose. Those are astrology-
// adjacent details that belong to a *chart* (BirthProfile, generated for
// self or anyone else), not to the account record itself; conflating the
// two would mean "editing your profile" silently overwrites data tied to
// a specific reading, which isn't what either feature is for.
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Seo from '../components/Seo'
import SiteHeader from '../components/SiteHeader'
import MobileNumberField from '../components/auth/MobileNumberField'
import AvatarUpload from '../components/auth/AvatarUpload'
import { useAuth } from '../contexts/AuthContext'

const inputCls = 'w-full border border-line rounded-lg px-3 py-2 bg-parchment text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary'
const labelCls = 'block text-sm font-medium text-ink mb-1'

// A short, curated list rather than every IANA zone — this product's
// audience is overwhelmingly India-first, so Asia/Kolkata leads, with
// enough common global zones alongside it to not strand the rest. Swap
// for the browser's full Intl.supportedValuesOf('timeZone') list later if
// a fuller picker is ever needed; that API isn't reliably available
// across browsers yet (notably older Safari), so a static list is the
// safer default today.
const TIMEZONES = [
  'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo',
  'Europe/London', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles',
  'Australia/Sydney',
]

function initialFor(user) {
  const source = user?.name || user?.email || user?.phone_number || '?'
  const firstMeaningfulChar = source.replace(/^\+/, '').trim()[0] || '?'
  return firstMeaningfulChar.toUpperCase()
}

export default function Profile() {
  const { t, i18n } = useTranslation()
  const { user, updateMyProfile, logout } = useAuth()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || '',
    preferred_language: user?.preferred_language || 'en',
    timezone: user?.timezone || '',
  })
  const [avatarError, setAvatarError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState(null)

  function setField(field, value) {
    if (field === 'avatar_url') setAvatarError(false)
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        name: form.name || null,
        email: form.email || null,
        avatar_url: form.avatar_url || null,
        preferred_language: form.preferred_language,
        timezone: form.timezone || null,
      }
      const updated = await updateMyProfile(payload)
      if (updated.preferred_language !== i18n.language) i18n.changeLanguage(updated.preferred_language)
      setSavedAt(Date.now())
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(i18n.language.startsWith('hi') ? 'hi-IN' : 'en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  const showAvatarImage = form.avatar_url && !avatarError

  return (
    <div className="min-h-screen bg-parchment">
      <Seo title={t('profile_title')} path="/account" noindex />
      <SiteHeader scrolled />

      <div className="max-w-2xl mx-auto px-4 pt-20 sm:pt-24 pb-16">
        {/* Identity header */}
        <div className="flex items-center gap-4 mb-8">
          {showAvatarImage ? (
            <img
              src={form.avatar_url}
              alt=""
              onError={() => setAvatarError(true)}
              className="w-16 h-16 rounded-full object-cover shrink-0 border border-line"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary text-night font-serif font-semibold text-2xl flex items-center justify-center shrink-0">
              {initialFor(user)}
            </div>
          )}
          <div>
            <h1 className="font-serif font-semibold text-2xl text-ink">{user?.name || t('profile_unnamed')}</h1>
            {memberSince && <p className="text-ink-muted text-sm mt-0.5">{t('profile_member_since', { date: memberSince })}</p>}
          </div>
        </div>

        {/* Edit Profile */}
        <form onSubmit={handleSave} className="bg-parchment-card rounded-2xl shadow-sm border border-line p-5 sm:p-6 space-y-5">
          <h2 className="font-serif font-semibold text-lg text-ink">{t('profile_edit_heading')}</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t('profile_full_name')}</label>
              <input type="text" value={form.name} onChange={e => setField('name', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t('profile_email')}</label>
              <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Mobile number isn't a plain text field — it's this account's
              login identity, so adding or changing it goes through real
              OTP verification (MobileNumberField owns that whole flow),
              not a free-text edit that silently changes how you log in. */}
          <div>
            <label className={labelCls}>{t('profile_mobile_number')}</label>
            <MobileNumberField />
          </div>

          <div>
            <label className={labelCls}>{t('profile_photo')} <span className="text-ink-faint font-normal">({t('profile_optional')})</span></label>
            <AvatarUpload value={form.avatar_url} onChange={dataUrl => setField('avatar_url', dataUrl)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t('profile_preferred_language')}</label>
              <select value={form.preferred_language} onChange={e => setField('preferred_language', e.target.value)} className={inputCls}>
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>{t('profile_timezone')} <span className="text-ink-faint font-normal">({t('profile_optional')})</span></label>
              <select value={form.timezone} onChange={e => setField('timezone', e.target.value)} className={inputCls}>
                <option value="">{t('profile_not_set')}</option>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-vermillion text-sm">{error}</p>}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving}
                    className="bg-primary hover:bg-primary-dark disabled:bg-primary/40 text-night font-semibold text-sm px-5 py-2.5 rounded-full transition">
              {saving ? t('profile_saving') : t('profile_save')}
            </button>
            {savedAt && <span className="text-sage text-sm">{t('profile_saved')}</span>}
          </div>
        </form>

        {/* Subscription / membership — no billing system exists yet
            (pre-revenue, see README's Roadmap), so this is an honest
            placeholder rather than a fake "Free Plan" card implying a
            paid tier already exists. */}
        <div className="bg-parchment-card rounded-2xl shadow-sm border border-line p-5 sm:p-6 mt-6">
          <h2 className="font-serif font-semibold text-lg text-ink mb-1">{t('profile_membership_heading')}</h2>
          <p className="text-ink-muted text-sm">{t('profile_membership_body')}</p>
        </div>

        {/* Privacy & account settings */}
        <div className="bg-parchment-card rounded-2xl shadow-sm border border-line p-5 sm:p-6 mt-6 space-y-3">
          <h2 className="font-serif font-semibold text-lg text-ink mb-1">{t('profile_privacy_heading')}</h2>
          <a href="/privacy" className="block text-primary-dark hover:underline text-sm">{t('profile_privacy_link')}</a>
          {/* No account-deletion endpoint exists yet — this is a real,
              working contact path, not a dead button pretending to
              delete anything. */}
          <a href="mailto:contact@starjyotish.com?subject=Account%20deletion%20request"
             className="block text-primary-dark hover:underline text-sm">
            {t('profile_delete_account_link')}
          </a>
        </div>

        <button onClick={() => logout()} className="mt-6 text-vermillion hover:underline text-sm font-medium">
          {t('nav_logout')}
        </button>
      </div>
    </div>
  )
}
