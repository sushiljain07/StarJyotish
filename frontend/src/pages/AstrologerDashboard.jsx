// frontend/src/pages/AstrologerDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import AccountMenu from '../components/AccountMenu'
import CompactFooter from '../components/CompactFooter'
import {
  astrologerGetProfile,
  astrologerUpdateProfile,
  astrologerGetBookings,
  astrologerGetEarnings,
} from '../api/admin'

const TABS = [
  { id: 'overview',  label: 'Overview' },
  { id: 'bookings',  label: 'Bookings' },
  { id: 'profile',   label: 'My Profile' },
]

// ── Shared ─────────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-2xl animate-spin">🪐</div>
    </div>
  )
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-parchment-card rounded-xl border border-line p-5 ${className}`}>
      {children}
    </div>
  )
}

function StatBox({ label, value, sub }) {
  return (
    <Card>
      <div className="text-xs text-ink-faint mb-1">{label}</div>
      <div className="text-2xl font-bold text-ink">{value}</div>
      {sub && <div className="text-xs text-ink-muted mt-1">{sub}</div>}
    </Card>
  )
}

function KycBadge({ status }) {
  const map = {
    verified: { color: 'bg-sage-light text-sage', label: '✓ KYC Verified' },
    pending:  { color: 'bg-primary-light text-primary-dark', label: '⏳ KYC Pending' },
    rejected: { color: 'bg-vermillion-light text-vermillion', label: '✗ KYC Rejected' },
  }
  const s = map[status] ?? map.pending
  return <span className={`text-xs font-semibold px-3 py-1 rounded-full ${s.color}`}>{s.label}</span>
}

const STATUS_COLOR = {
  pending:   'bg-primary-light text-primary-dark',
  confirmed: 'bg-sage-light text-sage',
  completed: 'bg-parchment text-ink-muted',
  cancelled: 'bg-vermillion-light text-vermillion',
  refunded:  'bg-mauve-light text-mauve',
}

// ── Overview tab ───────────────────────────────────────────────────────────────

function OverviewTab({ token }) {
  const [profile,  setProfile]  = useState(null)
  const [earnings, setEarnings] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([astrologerGetProfile(token), astrologerGetEarnings(token)])
      .then(([p, e]) => { setProfile(p); setEarnings(e) })
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <Spinner />

  return (
    <div className="space-y-4">
      {/* KYC status banner */}
      {profile?.kyc_status !== 'verified' && (
        <Card className="border-primary/40 bg-primary-light/50">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <div className="font-semibold text-ink text-sm">
                {profile?.kyc_status === 'pending' ? 'KYC verification in progress' : 'KYC verification rejected'}
              </div>
              <div className="text-xs text-ink-muted mt-0.5">
                {profile?.kyc_status === 'pending'
                  ? 'You\'ll be notified once the admin reviews your profile. You can update your bio and specialties while you wait.'
                  : 'Please contact support for details on re-verification.'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Earnings stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="Total Earned" value={`₹${earnings?.total_earned?.toLocaleString('en-IN') ?? 0}`} />
        <StatBox label="Net Earnings" value={`₹${earnings?.net_earnings?.toLocaleString('en-IN') ?? 0}`}
          sub={`after ₹${earnings?.platform_commission?.toLocaleString('en-IN') ?? 0} platform fee`} />
        <StatBox label="Completed Sessions" value={earnings?.completed_sessions ?? 0} />
        <StatBox label="Upcoming Sessions" value={earnings?.pending_sessions ?? 0} />
      </div>

      {/* Profile summary */}
      {profile && (
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary-dark font-bold text-lg flex-shrink-0">
              {(profile.name || '?')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-ink">{profile.name || '—'}</div>
              <div className="text-xs text-ink-muted">{profile.phone_number}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                <KycBadge status={profile.kyc_status} />
                <span className="text-xs bg-parchment text-ink-muted px-2 py-0.5 rounded-full border border-line">
                  ⭐ {Number(profile.rating_avg).toFixed(1)} ({profile.rating_count} reviews)
                </span>
                <span className="text-xs bg-parchment text-ink-muted px-2 py-0.5 rounded-full border border-line">
                  ₹{profile.price_per_session}/session
                </span>
              </div>
              {profile.specialties?.length > 0 && (
                <div className="text-xs text-ink-faint mt-2">{profile.specialties.join(' · ')}</div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// ── Bookings tab ───────────────────────────────────────────────────────────────

function BookingsTab({ token }) {
  const [bookings, setBookings] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')

  useEffect(() => {
    astrologerGetBookings(token)
      .then(setBookings)
      .finally(() => setLoading(false))
  }, [token])

  const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled']
  const filtered = (bookings ?? []).filter(b => filter === 'all' || b.status === filter)

  if (loading) return <Spinner />

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-lg border transition ${
              filter === f
                ? 'bg-primary-dark text-night border-primary-dark shadow-sm'
                : 'bg-parchment-card border-line text-ink-muted hover:border-primary/50'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <p className="text-ink-faint text-sm text-center py-6">
            {filter === 'all' ? 'No bookings yet.' : `No ${filter} bookings.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <Card key={b.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-ink text-sm">{b.client_name || 'Anonymous'}</div>
                  {b.client_phone && <div className="text-xs text-ink-faint">{b.client_phone}</div>}
                  <div className="text-xs text-ink-muted mt-1">
                    {new Date(b.scheduled_at).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })} · {b.duration_minutes}min · {b.mode}
                  </div>
                  {b.notes && <div className="text-xs text-ink-muted mt-1 italic">"{b.notes}"</div>}
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[b.status] ?? 'bg-parchment text-ink-muted'}`}>
                    {b.status}
                  </span>
                  <span className="text-sm font-bold text-ink">₹{Number(b.price).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Profile tab ────────────────────────────────────────────────────────────────

function ProfileTab({ token }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [form,    setForm]    = useState(null)

  useEffect(() => {
    astrologerGetProfile(token)
      .then(p => { setProfile(p); setForm({ bio: p.bio || '', price_per_session: String(p.price_per_session), experience_years: String(p.experience_years), specialties: (p.specialties || []).join(', '), languages: (p.languages || []).join(', ') }) })
      .finally(() => setLoading(false))
  }, [token])

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setError(''); setSuccess(false)
    try {
      await astrologerUpdateProfile(token, {
        bio: form.bio || undefined,
        price_per_session: parseFloat(form.price_per_session) || undefined,
        experience_years: parseInt(form.experience_years) || undefined,
        specialties: form.specialties ? form.specialties.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        languages: form.languages ? form.languages.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  if (loading || !form) return <Spinner />

  return (
    <Card>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary-dark font-bold">
          {(profile?.name || '?')[0].toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-ink">{profile?.name}</div>
          <KycBadge status={profile?.kyc_status} />
        </div>
      </div>

      {error && <div className="bg-vermillion-light text-vermillion text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
      {success && <div className="bg-sage-light text-sage text-sm rounded-lg px-4 py-3 mb-4">✓ Profile updated</div>}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-xs text-ink-muted mb-1 block">Bio</label>
          <textarea rows={4} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            placeholder="Your background, approach, and areas of expertise…"
            className="w-full bg-parchment border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary-dark resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Price per session (₹)</label>
            <input type="number" value={form.price_per_session} onChange={e => setForm(p => ({ ...p, price_per_session: e.target.value }))}
              className="w-full bg-parchment border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-dark" />
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Experience (years)</label>
            <input type="number" value={form.experience_years} onChange={e => setForm(p => ({ ...p, experience_years: e.target.value }))}
              className="w-full bg-parchment border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-dark" />
          </div>
        </div>
        <div>
          <label className="text-xs text-ink-muted mb-1 block">Specialties (comma-separated)</label>
          <input value={form.specialties} onChange={e => setForm(p => ({ ...p, specialties: e.target.value }))}
            placeholder="career, marriage, KP, numerology"
            className="w-full bg-parchment border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-dark" />
        </div>
        <div>
          <label className="text-xs text-ink-muted mb-1 block">Languages (comma-separated)</label>
          <input value={form.languages} onChange={e => setForm(p => ({ ...p, languages: e.target.value }))}
            placeholder="Hindi, English"
            className="w-full bg-parchment border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-dark" />
        </div>
        <button type="submit" disabled={saving}
          className="w-full py-2.5 bg-primary-dark text-night text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </Card>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AstrologerDashboard() {
  const { user, accessToken } = useAuth()
  const [tab, setTab] = useState('overview')

  return (
    <div className="min-h-screen bg-parchment">
      <Seo title="Astrologer Dashboard — Star Jyotish" noindex />

      {/* Header */}
      <div className="bg-night text-primary-light">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/home" className="flex items-center gap-2 shrink-0 opacity-70 hover:opacity-100 transition">
              <img src="/starjyotish.svg" alt="" className="w-6 h-6" />
            </Link>
            <div>
              <div className="font-serif font-semibold text-lg">🔮 Astrologer Portal</div>
              <div className="text-xs text-ink-onnight">{user?.name || user?.phone_number}</div>
            </div>
          </div>
          <AccountMenu />
        </div>

        <div className="max-w-2xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-t-lg text-sm font-medium transition ${
                tab === t.id ? 'bg-parchment-card text-primary-dark' : 'text-ink-onnight hover:bg-white/10'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {tab === 'overview' && <OverviewTab token={accessToken} />}
        {tab === 'bookings' && <BookingsTab token={accessToken} />}
        {tab === 'profile'  && <ProfileTab  token={accessToken} />}
      </div>
      <CompactFooter />
    </div>
  )
}
