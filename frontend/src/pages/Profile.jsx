// frontend/src/pages/Profile.jsx
//
// Mounted at /account, behind <ProtectedRoute> (see App.jsx). Reachable
// from AccountMenu's "My Profile" link.
//
// Account fields (name, email, mobile, avatar, language, timezone) and the
// astrology profile (birth date/time/place + current location) are two
// separate cards below, but both live on this one page now — this account
// has exactly one astrology profile (see migration 0009's unique
// constraint on birth_profiles.user_id), so "manage your profile" no
// longer means picking from a list; it means editing the one you have.
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import SiteHeader from '../components/SiteHeader'
import CompactFooter from '../components/CompactFooter'
import MobileNumberField from '../components/auth/MobileNumberField'
import AvatarUpload from '../components/auth/AvatarUpload'
import { useAuth } from '../contexts/AuthContext'
import { getPrimaryProfile, deleteProfile, createProfile, UNKNOWN_BIRTH_TIME_DEFAULT } from '../services/astrologyProfiles'
import { usePlaceSuggestions } from '../hooks/usePlaceSuggestions'
import { usePlaceMatches } from '../hooks/usePlaceMatches'
import { requestBrowserLocation } from '../services/currentLocation'
import { fetchReverseGeocode } from '../api/astro'

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
  const { user, accessToken, updateMyProfile } = useAuth()

  const [avatarError, setAvatarError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState(null)
  // Local state (not just getPrimaryProfile(user) read fresh in render) so
  // saving an edit or deleting updates the page immediately without a
  // full reload.
  const [profileState, setProfileState] = useState(() => getPrimaryProfile(user))

  const [editingAstro, setEditingAstro] = useState(false)
  const [astroForm, setAstroForm] = useState(null) // populated when Edit is opened
  const [astroSaving, setAstroSaving] = useState(false)
  const [astroError, setAstroError] = useState('')
  const [astroPlaceQuery, setAstroPlaceQuery] = useState('')
  const [showAstroPlaceSuggestions, setShowAstroPlaceSuggestions] = useState(false)
  const astroPlaceSuggestions = usePlaceSuggestions(astroPlaceQuery)
  const [astroLocationStatus, setAstroLocationStatus] = useState('idle') // idle | requesting | denied
  const [astroManualLocationQuery, setAstroManualLocationQuery] = useState('')
  const astroManualLocationMatches = usePlaceMatches(astroManualLocationQuery)

  function startEditingAstro() {
    setAstroForm({
      birthDate: profileState?.birth_date || '',
      birthTime: profileState?.birth_time || '',
      birthTimeAccuracy: profileState?.birth_time_accuracy || 'exact',
      place: profileState?.place || '',
      currentLat: profileState?.current_lat ?? null,
      currentLon: profileState?.current_lon ?? null,
      currentLocationLabel: profileState?.current_location_label || '',
    })
    setAstroError('')
    setEditingAstro(true)
  }

  async function useMyLocationForAstro() {
    setAstroLocationStatus('requesting')
    try {
      const { lat, lon } = await requestBrowserLocation()
      const label = await fetchReverseGeocode(lat, lon)
      setAstroForm(f => ({ ...f, currentLat: lat, currentLon: lon, currentLocationLabel: label || f.currentLocationLabel }))
      setAstroLocationStatus('idle')
    } catch {
      setAstroLocationStatus('denied')
    }
  }

  function chooseManualLocationForAstro(match) {
    setAstroForm(f => ({ ...f, currentLat: match.lat, currentLon: match.lon, currentLocationLabel: match.display_name }))
    setAstroManualLocationQuery('')
  }

  async function saveAstroForm(e) {
    e.preventDefault()
    setAstroError('')
    setAstroSaving(true)
    try {
      const updated = await createProfile(user, accessToken, {
        relation: 'self',
        label: profileState?.label || 'Self',
        birthDate: astroForm.birthDate,
        birthTime: astroForm.birthTimeAccuracy === 'unknown' ? UNKNOWN_BIRTH_TIME_DEFAULT : astroForm.birthTime,
        birthTimeAccuracy: astroForm.birthTimeAccuracy,
        place: astroForm.place,
        currentLat: astroForm.currentLat,
        currentLon: astroForm.currentLon,
        currentLocationLabel: astroForm.currentLocationLabel || null,
      })
      setProfileState(updated)
      setEditingAstro(false)
    } catch (err) {
      setAstroError(err.message || t('error_generic'))
    } finally {
      setAstroSaving(false)
    }
  }

  async function handleDeleteAstro() {
    if (!profileState) return
    if (!window.confirm(t('profile_astro_delete_confirm'))) return
    await deleteProfile(user, accessToken, profileState.id)
    setProfileState(null)
  }

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || '',
    preferred_language: user?.preferred_language || 'en',
    timezone: user?.timezone || '',
  })

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
      <SiteHeader />

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

        {/* Your astrology profile — exactly one per account (migration
            0009). View mode shows birth details + current location;
            Edit mode reuses the same upsert-in-place save path Onboarding
            uses (services/astrologyProfiles.js's createProfile), so this
            never creates a second row. */}
        {profileState && (
          <div className="bg-parchment-card rounded-2xl shadow-sm border border-line p-5 sm:p-6 mt-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-serif font-semibold text-lg text-ink">{t('profile_astro_heading')}</h2>
              {!editingAstro && (
                <button type="button" onClick={startEditingAstro} className="text-xs text-primary-dark hover:underline font-medium">
                  {t('profile_astro_edit')}
                </button>
              )}
            </div>

            {!editingAstro ? (
              <>
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-ink">
                    {profileState.birth_date ? profileState.birth_date.split('-').reverse().join('-') : ''}
                    {profileState.birth_time ? ` · ${profileState.birth_time}` : ''}
                  </p>
                  <p className="text-sm text-ink-muted">{profileState.place}</p>
                  {profileState.current_location_label && (
                    <p className="text-sm text-ink-muted">📍 {profileState.current_location_label}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-4">
                  {profileState.chart && (
                    <Link
                      to="/kundli"
                      state={{ data: profileState.chart, input: { name: profileState.label, date: profileState.birth_date, time: profileState.birth_time, place: profileState.place } }}
                      className="text-xs text-primary-dark hover:underline font-medium"
                    >
                      {t('profile_astro_view')}
                    </Link>
                  )}
                  <button type="button" onClick={handleDeleteAstro} className="text-xs text-vermillion hover:underline font-medium">
                    {t('profile_astro_delete')}
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={saveAstroForm} className="mt-3 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>{t('profile_astro_birth_date')}</label>
                    <input type="date" value={astroForm.birthDate}
                           onChange={e => setAstroForm(f => ({ ...f, birthDate: e.target.value }))}
                           className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>{t('profile_astro_birth_time')}</label>
                    <input type="time" value={astroForm.birthTime}
                           disabled={astroForm.birthTimeAccuracy === 'unknown'}
                           onChange={e => setAstroForm(f => ({ ...f, birthTime: e.target.value }))}
                           className={`${inputCls} disabled:opacity-50`} required={astroForm.birthTimeAccuracy !== 'unknown'} />
                  </div>
                </div>

                <div className="relative">
                  <label className={labelCls}>{t('profile_astro_birth_place')}</label>
                  <input
                    type="text"
                    value={astroForm.place}
                    onChange={e => { setAstroForm(f => ({ ...f, place: e.target.value })); setAstroPlaceQuery(e.target.value); setShowAstroPlaceSuggestions(true) }}
                    onBlur={() => setTimeout(() => setShowAstroPlaceSuggestions(false), 200)}
                    className={inputCls}
                    required
                  />
                  {showAstroPlaceSuggestions && astroPlaceSuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-parchment-card border border-line rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto text-left">
                      {astroPlaceSuggestions.map((s, i) => (
                        <li key={i} onMouseDown={() => { setAstroForm(f => ({ ...f, place: s })); setShowAstroPlaceSuggestions(false) }}
                            className="px-4 py-2.5 text-sm text-ink hover:bg-primary-light cursor-pointer border-b border-line last:border-0">
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label className={labelCls}>
                    {t('profile_current_location')} <span className="text-ink-faint font-normal">({t('profile_optional')})</span>
                  </label>
                  {astroForm.currentLocationLabel && (
                    <div className="flex items-center justify-between gap-3 border border-line rounded-lg px-3 py-2 mb-2 bg-parchment">
                      <span className="text-sm text-ink truncate">📍 {astroForm.currentLocationLabel}</span>
                      <button
                        type="button"
                        onClick={() => setAstroForm(f => ({ ...f, currentLat: null, currentLon: null, currentLocationLabel: '' }))}
                        className="text-xs text-ink-muted underline shrink-0"
                      >
                        {t('profile_current_location_clear')}
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2 items-start flex-wrap">
                    <button
                      type="button"
                      onClick={useMyLocationForAstro}
                      disabled={astroLocationStatus === 'requesting'}
                      className="text-xs font-semibold border border-primary rounded-full px-3.5 py-2 text-primary-dark hover:bg-primary-light/40 transition disabled:opacity-50"
                    >
                      {astroLocationStatus === 'requesting' ? t('profile_current_location_requesting') : t('profile_current_location_use_gps')}
                    </button>
                    <div className="relative flex-1 min-w-[180px]">
                      <input
                        type="text"
                        value={astroManualLocationQuery}
                        onChange={e => setAstroManualLocationQuery(e.target.value)}
                        placeholder={t('profile_current_location_search_placeholder')}
                        className={inputCls}
                      />
                      {astroManualLocationMatches.length > 0 && (
                        <ul className="absolute z-10 w-full bg-parchment-card border border-line rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto text-left">
                          {astroManualLocationMatches.map((m, i) => (
                            <li key={i} onMouseDown={() => chooseManualLocationForAstro(m)}
                                className="px-4 py-2.5 text-sm text-ink hover:bg-primary-light cursor-pointer border-b border-line last:border-0">
                              {m.display_name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  {astroLocationStatus === 'denied' && (
                    <p className="text-xs text-vermillion mt-1.5">{t('profile_current_location_denied')}</p>
                  )}
                </div>

                {astroError && <p className="text-vermillion text-sm">{astroError}</p>}

                <div className="flex items-center gap-3">
                  <button type="submit" disabled={astroSaving}
                          className="bg-primary hover:bg-primary-dark disabled:bg-primary/40 text-night font-semibold text-sm px-5 py-2.5 rounded-full transition">
                    {astroSaving ? t('profile_saving') : t('profile_save')}
                  </button>
                  <button type="button" onClick={() => setEditingAstro(false)} className="text-sm text-ink-muted hover:underline">
                    {t('profile_astro_cancel')}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {!profileState && (
          <div className="bg-parchment-card rounded-2xl shadow-sm border border-line p-5 sm:p-6 mt-6 text-center">
            <p className="text-ink-muted text-sm mb-3">{t('profile_astro_none')}</p>
            <Link to="/onboarding" className="inline-block bg-primary hover:bg-primary-dark text-night font-semibold text-sm px-5 py-2.5 rounded-full transition">
              {t('profile_astro_create')}
            </Link>
          </div>
        )}

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

      </div>

      <CompactFooter />
    </div>
  )
}
