// frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import AccountMenu from '../components/AccountMenu'
import {
  adminListUsers, adminUserReports,
  adminListSettings, adminUpsertSetting,
  adminAuditLogs,
  adminListAstrologers, adminOnboardAstrologer, adminSetKyc,
} from '../api/admin'
import { API_BASE } from '../api/config'

// Testimonials admin API — direct fetch since these aren't in the admin.js client yet
async function adminListTestimonials(token) {
  const r = await fetch(`${API_BASE}/api/admin/testimonials`, {
    headers: { Authorization: `Bearer ${token}` }, credentials: 'include',
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.detail ?? 'Error')
  return data
}
async function adminSetTestimonialStatus(token, id, status, notes) {
  const r = await fetch(`${API_BASE}/api/admin/testimonials/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    credentials: 'include',
    body: JSON.stringify({ status, admin_notes: notes }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.detail ?? 'Error')
  return data
}

const TABS = [
  { id: 'users',       label: 'Users' },
  { id: 'astrologers', label: 'Astrologers' },
  { id: 'settings',    label: 'Feature Flags' },
  { id: 'pricing',     label: 'Pricing Plans' },
  { id: 'blog',          label: 'Blog' },
  { id: 'testimonials',  label: 'Testimonials' },
  { id: 'audit',       label: 'Audit Log' },
]

// ── Tiny shared components ─────────────────────────────────────────────────────

function Badge({ color, children }) {
  const colors = {
    green:  'bg-sage-light text-sage',
    red:    'bg-vermillion-light text-vermillion',
    yellow: 'bg-primary-light text-primary-dark',
    gray:   'bg-parchment text-ink-muted',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[color] ?? colors.gray}`}>
      {children}
    </span>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16 text-ink-faint">
      <div className="text-2xl animate-spin">🪐</div>
    </div>
  )
}

function ErrorBanner({ msg }) {
  return msg ? (
    <div className="bg-vermillion-light text-vermillion text-sm rounded-lg px-4 py-3 mb-4">{msg}</div>
  ) : null
}

function SectionCard({ children }) {
  return <div className="bg-parchment-card rounded-xl border border-line p-5">{children}</div>
}

// ── Users tab ──────────────────────────────────────────────────────────────────

function UsersTab({ token }) {
  const [data,      setData]      = useState(null)
  const [q,         setQ]         = useState('')
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [selected,  setSelected]  = useState(null)  // {user, reports}
  const [reports,   setReports]   = useState(null)
  const [repLoad,   setRepLoad]   = useState(false)

  const load = useCallback(async (search = q) => {
    setLoading(true); setError('')
    try { setData(await adminListUsers(token, { q: search, limit: 50 })) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [token, q])

  useEffect(() => { load('') }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  async function openUser(user) {
    setSelected(user); setRepLoad(true); setReports(null)
    try { setReports(await adminUserReports(token, user.id)) }
    catch { setReports([]) }
    finally { setRepLoad(false) }
  }

  if (selected) return (
    <div>
      <button onClick={() => setSelected(null)}
        className="text-primary-dark text-sm font-medium mb-4 hover:underline">
        ← Back to users
      </button>
      <SectionCard>
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary-dark font-bold">
            {(selected.name || selected.phone_number || '?')[0].toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-ink">{selected.name || '—'}</div>
            <div className="text-xs text-ink-muted">{selected.phone_number || selected.email || '—'}</div>
            <div className="flex gap-2 mt-1">
              <Badge color={selected.role === 'admin' ? 'red' : selected.role === 'astrologer' ? 'yellow' : 'gray'}>
                {selected.role}
              </Badge>
              {!selected.is_active && <Badge color="red">inactive</Badge>}
            </div>
          </div>
        </div>
        <div className="text-xs text-ink-faint mb-4">
          Joined {new Date(selected.created_at).toLocaleDateString('en-IN')}
        </div>
        <div className="font-semibold text-sm text-ink mb-3">Reports ({repLoad ? '…' : reports?.length ?? 0})</div>
        {repLoad ? <Spinner /> : (reports || []).length === 0 ? (
          <p className="text-ink-faint text-sm">No reports yet.</p>
        ) : (
          <div className="space-y-2">
            {reports.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                <div>
                  <span className="text-xs font-semibold text-primary-dark capitalize">{r.report_type}</span>
                  {r.question && <span className="text-xs text-ink-muted ml-2">"{r.question.slice(0, 60)}…"</span>}
                </div>
                <span className="text-xs text-ink-faint">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load(q)}
          placeholder="Search name, phone, email…"
          className="flex-1 bg-parchment-card border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary-dark"
        />
        <button onClick={() => load(q)}
          className="px-4 py-2 bg-primary-dark text-night text-sm font-semibold rounded-lg hover:opacity-90 transition">
          Search
        </button>
      </div>
      <ErrorBanner msg={error} />
      {loading ? <Spinner /> : (
        <SectionCard>
          <div className="text-xs text-ink-faint mb-3">{data?.total ?? 0} total users</div>
          <div className="divide-y divide-line">
            {(data?.users ?? []).map(u => (
              <button key={u.id} onClick={() => openUser(u)}
                className="w-full text-left flex items-center gap-3 py-3 hover:bg-parchment rounded-lg px-2 transition">
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary-dark text-xs font-bold flex-shrink-0">
                  {(u.name || u.phone_number || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-ink truncate">{u.name || u.phone_number || u.email || '—'}</div>
                  <div className="text-xs text-ink-faint">{u.phone_number}</div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Badge color={u.role === 'admin' ? 'red' : u.role === 'astrologer' ? 'yellow' : 'gray'}>
                    {u.role}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}

// ── Astrologers tab ────────────────────────────────────────────────────────────

function AstrologersTab({ token }) {
  const [astrologers, setAstrologers] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [showForm,    setShowForm]    = useState(false)
  const [form,        setForm]        = useState({ phone_number: '', name: '', price_per_session: '500', experience_years: '0', specialties: '', languages: 'Hindi,English' })
  const [saving,      setSaving]      = useState(false)
  const [kycLoad,     setKycLoad]     = useState({})

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setAstrologers(await adminListAstrologers(token)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { load() }, [load])

  async function handleKyc(profileId, status) {
    setKycLoad(p => ({ ...p, [profileId]: true }))
    try {
      await adminSetKyc(token, profileId, status)
      await load()
    } catch (e) { setError(e.message) }
    finally { setKycLoad(p => ({ ...p, [profileId]: false })) }
  }

  async function handleOnboard(e) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await adminOnboardAstrologer(token, {
        phone_number: form.phone_number,
        name: form.name || undefined,
        price_per_session: parseFloat(form.price_per_session) || 500,
        experience_years: parseInt(form.experience_years) || 0,
        specialties: form.specialties ? form.specialties.split(',').map(s => s.trim()) : [],
        languages: form.languages ? form.languages.split(',').map(s => s.trim()) : ['Hindi', 'English'],
      })
      setShowForm(false)
      setForm({ phone_number: '', name: '', price_per_session: '500', experience_years: '0', specialties: '', languages: 'Hindi,English' })
      await load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const kycColor = { pending: 'yellow', verified: 'green', rejected: 'red' }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-ink-muted">{astrologers?.length ?? 0} astrologers</span>
        <button onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 bg-primary-dark text-night text-sm font-semibold rounded-lg hover:opacity-90 transition">
          {showForm ? 'Cancel' : '+ Onboard Astrologer'}
        </button>
      </div>

      {showForm && (
        <SectionCard>
          <div className="font-semibold text-sm text-ink mb-4">New Astrologer</div>
          <form onSubmit={handleOnboard} className="space-y-3">
            {[
              ['Phone number *', 'phone_number', 'tel', '+919876543210'],
              ['Name', 'name', 'text', 'e.g. Pandit Ramesh Sharma'],
              ['Price per session (₹)', 'price_per_session', 'number', '500'],
              ['Experience (years)', 'experience_years', 'number', '5'],
              ['Specialties (comma-separated)', 'specialties', 'text', 'career,marriage,KP'],
              ['Languages (comma-separated)', 'languages', 'text', 'Hindi,English'],
            ].map(([label, key, type, placeholder]) => (
              <div key={key}>
                <label className="text-xs text-ink-muted mb-1 block">{label}</label>
                <input
                  type={type} required={key === 'phone_number'}
                  value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-parchment border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary-dark"
                />
              </div>
            ))}
            <button type="submit" disabled={saving}
              className="w-full py-2.5 bg-primary-dark text-night text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
              {saving ? 'Creating…' : 'Create Astrologer'}
            </button>
          </form>
        </SectionCard>
      )}

      <ErrorBanner msg={error} />
      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {(astrologers ?? []).map(a => (
            <SectionCard key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-ink text-sm">{a.name || '—'}</div>
                  <div className="text-xs text-ink-faint">{a.phone_number}</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge color={kycColor[a.kyc_status] ?? 'gray'}>{a.kyc_status}</Badge>
                    <Badge color="gray">⭐ {Number(a.rating_avg).toFixed(1)} ({a.rating_count})</Badge>
                    <Badge color="gray">₹{a.price_per_session}/session</Badge>
                    <Badge color="gray">{a.experience_years}yr exp</Badge>
                  </div>
                  {a.specialties?.length > 0 && (
                    <div className="text-xs text-ink-muted mt-1">{a.specialties.join(' · ')}</div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {a.kyc_status !== 'verified' && (
                    <button onClick={() => handleKyc(a.id, 'verified')} disabled={kycLoad[a.id]}
                      className="px-3 py-1.5 bg-sage text-white text-xs font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
                      {kycLoad[a.id] ? '…' : 'Approve'}
                    </button>
                  )}
                  {a.kyc_status !== 'rejected' && (
                    <button onClick={() => handleKyc(a.id, 'rejected')} disabled={kycLoad[a.id]}
                      className="px-3 py-1.5 bg-vermillion text-white text-xs font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
                      {kycLoad[a.id] ? '…' : 'Reject'}
                    </button>
                  )}
                </div>
              </div>
            </SectionCard>
          ))}
          {(astrologers ?? []).length === 0 && (
            <p className="text-ink-faint text-sm text-center py-8">No astrologers yet. Click "+ Onboard Astrologer" to add one.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Settings tab ───────────────────────────────────────────────────────────────

function SettingsTab({ token }) {
  const [settings, setSettings] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [saving,   setSaving]   = useState({})
  const [newKey,   setNewKey]   = useState({ key: '', value: '', description: '', is_public: false })
  const [showNew,  setShowNew]  = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setSettings(await adminListSettings(token)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { load() }, [load])

  async function toggle(setting) {
    if (typeof setting.value !== 'boolean') return
    setSaving(p => ({ ...p, [setting.key]: true }))
    try {
      await adminUpsertSetting(token, setting.key, { value: !setting.value, description: setting.description, is_public: setting.is_public })
      await load()
    } catch (e) { setError(e.message) }
    finally { setSaving(p => ({ ...p, [setting.key]: false })) }
  }

  async function addNew(e) {
    e.preventDefault()
    setSaving(p => ({ ...p, _new: true }))
    try {
      let val
      try { val = JSON.parse(newKey.value) } catch { val = newKey.value }
      await adminUpsertSetting(token, newKey.key, { value: val, description: newKey.description, is_public: newKey.is_public })
      setShowNew(false)
      setNewKey({ key: '', value: '', description: '', is_public: false })
      await load()
    } catch (e) { setError(e.message) }
    finally { setSaving(p => ({ ...p, _new: false })) }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-ink-muted">Runtime feature flags</span>
        <button onClick={() => setShowNew(v => !v)}
          className="px-4 py-2 bg-primary-dark text-night text-sm font-semibold rounded-lg hover:opacity-90 transition">
          {showNew ? 'Cancel' : '+ New Flag'}
        </button>
      </div>

      {showNew && (
        <SectionCard>
          <form onSubmit={addNew} className="space-y-3 mb-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Key *</label>
                <input required value={newKey.key} onChange={e => setNewKey(p => ({ ...p, key: e.target.value }))}
                  placeholder="paywall_enabled"
                  className="w-full bg-parchment border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-dark" />
              </div>
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Value (JSON) *</label>
                <input required value={newKey.value} onChange={e => setNewKey(p => ({ ...p, value: e.target.value }))}
                  placeholder='true or "text" or 499'
                  className="w-full bg-parchment border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-dark" />
              </div>
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Description</label>
              <input value={newKey.description} onChange={e => setNewKey(p => ({ ...p, description: e.target.value }))}
                placeholder="What this flag controls"
                className="w-full bg-parchment border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-dark" />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input type="checkbox" checked={newKey.is_public}
                onChange={e => setNewKey(p => ({ ...p, is_public: e.target.checked }))}
                className="accent-primary-dark" />
              Public (readable by unauthenticated frontend)
            </label>
            <button type="submit" disabled={saving._new}
              className="px-4 py-2 bg-primary-dark text-night text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
              {saving._new ? 'Saving…' : 'Save Flag'}
            </button>
          </form>
        </SectionCard>
      )}

      <ErrorBanner msg={error} />
      {loading ? <Spinner /> : (
        <div className="space-y-2">
          {(settings ?? []).map(s => (
            <SectionCard key={s.key}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-primary-dark font-semibold">{s.key}</div>
                  {s.description && <div className="text-xs text-ink-muted mt-0.5">{s.description}</div>}
                  <div className="flex gap-2 mt-1.5">
                    {s.is_public && <Badge color="green">public</Badge>}
                    <span className="text-xs text-ink-faint">Updated {new Date(s.updated_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-3">
                  {typeof s.value === 'boolean' ? (
                    <button onClick={() => toggle(s)} disabled={saving[s.key]}
                      className={`relative w-10 h-5 rounded-full transition-colors ${s.value ? 'bg-sage' : 'bg-line'} disabled:opacity-50`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${s.value ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`} />
                    </button>
                  ) : (
                    <span className="font-mono text-xs bg-parchment px-2 py-1 rounded border border-line text-ink">
                      {JSON.stringify(s.value)}
                    </span>
                  )}
                  <Badge color={typeof s.value === 'boolean' ? (s.value ? 'green' : 'gray') : 'gray'}>
                    {JSON.stringify(s.value)}
                  </Badge>
                </div>
              </div>
            </SectionCard>
          ))}
          {(settings ?? []).length === 0 && (
            <p className="text-ink-faint text-sm text-center py-8">No flags yet. Create one above.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Pricing plans tab ──────────────────────────────────────────────────────────

function PricingTab({ token }) {
  const [raw,     setRaw]     = useState(null)
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    import('../api/admin').then(({ adminListSettings: ls }) => {
      ls(token)
        .then(settings => {
          const s = settings.find(x => x.key === 'pricing_plans')
          const str = s ? JSON.stringify(s.value, null, 2) : JSON.stringify([
            { id: 'free',      name: 'Free',      price_monthly: 0,   highlight: false, badge: null,           accent: 'border-line',    features: ['Full Kundli (all 16 charts)','Dasha timeline','One AI reading','3 Ask questions'],            cta: 'Generate Free Kundli',  tagline: 'Your real Kundli, always free.' },
            { id: 'seeker',    name: 'Seeker',    price_monthly: 99,  highlight: false, badge: null,           accent: 'border-primary', features: ['Everything in Free','Unlimited charts','Unlimited Ask','All topic reports','Priority AI'],          cta: 'Start Seeker Plan',     tagline: 'For the curious.' },
            { id: 'jyotishi',  name: 'Jyotishi',  price_monthly: 299, highlight: true,  badge: 'Most Popular', accent: 'border-sage',    features: ['Everything in Seeker','Synastry charts','Transit alerts','PDF downloads'],                        cta: 'Start Jyotishi Plan',   tagline: 'For serious practitioners.' },
            { id: 'sampoorna', name: 'Sampoorna', price_monthly: 499, highlight: false, badge: 'Coming soon',  accent: 'border-mauve',   features: ['Everything in Jyotishi','1 live consultation/month'],                                            cta: 'Start Sampoorna Plan',  tagline: 'When you want a human astrologer too.' },
          ], null, 2)
          setRaw(str); setCurrent(str)
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    })
  }, [token])

  async function handleSave() {
    setSaving(true); setError(''); setSuccess(false)
    try { JSON.parse(raw) } catch { setError('Invalid JSON'); setSaving(false); return }
    try {
      const { adminUpsertSetting: us } = await import('../api/admin')
      await us(token, 'pricing_plans', { value: JSON.parse(raw), description: 'Pricing page plan definitions', is_public: true })
      setCurrent(raw); setSuccess(true); setTimeout(() => setSuccess(false), 3000)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <p className="text-sm text-ink-muted mb-2">
        Edit the <code className="text-xs bg-parchment px-1.5 py-0.5 rounded border border-line">pricing_plans</code> setting
        that the <a href="/pricing" target="_blank" rel="noreferrer" className="text-primary-dark underline">Pricing page</a> reads.
        Changes live immediately.
      </p>
      <p className="text-xs text-ink-faint mb-4">Fields: <code>id</code> <code>name</code> <code>price_monthly</code> <code>features[]</code> <code>cta</code> <code>tagline</code> <code>highlight</code> <code>badge</code> <code>accent</code>. Hindi: <code>name_hi</code> <code>tagline_hi</code> <code>cta_hi</code></p>
      {error && <div className="bg-vermillion-light text-vermillion text-sm rounded-lg px-4 py-3 mb-3">{error}</div>}
      {success && <div className="bg-sage-light text-sage text-sm rounded-lg px-4 py-3 mb-3">Saved</div>}
      {loading ? <div className="flex justify-center py-12 text-2xl animate-spin">🪐</div> : (
        <SectionCard>
          <textarea value={raw ?? ''} onChange={e => setRaw(e.target.value)} rows={24}
            className="w-full font-mono text-xs bg-parchment border border-line rounded-lg px-3 py-3 text-ink focus:outline-none focus:border-primary-dark resize-y" spellCheck={false} />
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving || raw === current}
              className="px-5 py-2.5 bg-primary-dark text-night text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-40">
              {saving ? 'Saving…' : 'Save Plans'}
            </button>
            {raw !== current && (
              <button onClick={() => setRaw(current)} className="px-5 py-2.5 border border-line text-ink-muted text-sm rounded-lg hover:bg-parchment transition">Reset</button>
            )}
            <a href="/pricing" target="_blank" rel="noreferrer" className="ml-auto px-4 py-2.5 text-sm text-primary-dark underline self-center">Preview →</a>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

// ── Blog management tab ──────────────────────────────────────────────────────────────────────────────

const BLOG_ARTICLE_TEMPLATE = {
  title: 'New Article Title',
  excerpt: 'A one or two sentence description shown in article cards.',
  category: 'Basics',
  readMin: 5,
  tags: ['Tag1', 'Tag2'],
  date: new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }),
  featured: false,
  status: 'draft',
  relatedSlugs: [],
  content: [
    { type: 'intro', content: 'Opening paragraph that hooks the reader.' },
    { type: 'h2', content: 'First Section Heading' },
    { type: 'body', content: 'Paragraph text here.' },
    { type: 'callout', content: 'Key insight or tip.' },
    { type: 'list', content: ['First point', 'Second point', 'Third point'] },
  ],
}

const STATUS_COLOR = { published: 'bg-sage-light text-sage', draft: 'bg-primary-light text-primary-dark', archived: 'bg-parchment text-ink-faint' }

function BlogTab({ token }) {
  const [settings, setSettings] = useState({})
  const [index,    setIndex]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(null)
  const [editRaw,  setEditRaw]  = useState('')
  const [newSlug,  setNewSlug]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { adminListSettings: ls } = await import('../api/admin')
      const all = await ls(token)
      const map = {}
      all.forEach(s => { map[s.key] = s.value })
      setSettings(map)
      setIndex(Array.isArray(map.blog_index) ? map.blog_index : [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { load() }, [load])

  async function saveIndex(newIndex) {
    const { adminUpsertSetting: us } = await import('../api/admin')
    await us(token, 'blog_index', { value: newIndex, description: 'Ordered list of blog article slugs', is_public: true })
    setIndex(newIndex)
  }

  async function saveArticle() {
    setSaving(true); setError('')
    let parsed
    try { parsed = JSON.parse(editRaw) } catch { setError('Invalid JSON'); setSaving(false); return }
    try {
      const { adminUpsertSetting: us } = await import('../api/admin')
      const isPublic = parsed.status === 'published'
      await us(token, `blog_article_${editing}`, { value: parsed, description: `Blog: ${parsed.title}`, is_public: isPublic })
      if (isPublic && !index.includes(editing)) await saveIndex([editing, ...index])
      setSuccess(`Saved: ${parsed.title}`)
      setTimeout(() => setSuccess(''), 3000)
      setEditing(null)
      await load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function archiveArticle(slug) {
    const art = settings[`blog_article_${slug}`]
    if (!art) return
    const { adminUpsertSetting: us } = await import('../api/admin')
    await us(token, `blog_article_${slug}`, { value: { ...art, status: 'archived' }, description: `Blog: ${art.title}`, is_public: false })
    await saveIndex(index.filter(s => s !== slug))
    await load()
  }

  async function publishArticle(slug) {
    const art = settings[`blog_article_${slug}`]
    if (!art) return
    const { adminUpsertSetting: us } = await import('../api/admin')
    await us(token, `blog_article_${slug}`, { value: { ...art, status: 'published' }, description: `Blog: ${art.title}`, is_public: true })
    if (!index.includes(slug)) await saveIndex([slug, ...index])
    await load()
  }

  async function moveUp(slug) {
    const i = index.indexOf(slug)
    if (i <= 0) return
    const ni = [...index]; [ni[i-1], ni[i]] = [ni[i], ni[i-1]]
    await saveIndex(ni)
  }

  async function moveDown(slug) {
    const i = index.indexOf(slug)
    if (i < 0 || i >= index.length - 1) return
    const ni = [...index]; [ni[i], ni[i+1]] = [ni[i+1], ni[i]]
    await saveIndex(ni)
  }

  async function createArticle() {
    if (!newSlug.trim()) { setError('Enter a slug first'); return }
    const slug = newSlug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (settings[`blog_article_${slug}`]) { setError(`Slug "${slug}" already exists`); return }
    setEditing(slug)
    setEditRaw(JSON.stringify({ ...BLOG_ARTICLE_TEMPLATE }, null, 2))
    setNewSlug('')
  }

  const allSlugs = [...new Set([...index, ...Object.keys(settings).filter(k => k.startsWith('blog_article_')).map(k => k.replace('blog_article_',''))])]

  if (editing !== null) {
    return (
      <div>
        <button onClick={() => setEditing(null)} className="text-primary-dark text-sm font-medium mb-4 hover:underline">← Back to articles</button>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-semibold text-ink text-sm">{settings[`blog_article_${editing}`] ? 'Editing' : 'New article'}: <code className="text-xs bg-parchment px-1.5 py-0.5 rounded border border-line">{editing}</code></div>
            <div className="text-xs text-ink-muted mt-0.5">Set <code>status</code> to <code>"published"</code> to make it live on /blog.</div>
          </div>
          <a href={`/blog/${editing}`} target="_blank" rel="noreferrer" className="text-xs text-primary-dark underline">Preview →</a>
        </div>
        {error && <div className="bg-vermillion-light text-vermillion text-sm rounded-lg px-4 py-3 mb-3">{error}</div>}
        <SectionCard>
          <textarea value={editRaw} onChange={e => setEditRaw(e.target.value)} rows={30}
            className="w-full font-mono text-xs bg-parchment border border-line rounded-lg px-3 py-3 text-ink focus:outline-none focus:border-primary-dark resize-y" spellCheck={false} />
          <div className="flex gap-3 mt-4">
            <button onClick={saveArticle} disabled={saving}
              className="px-5 py-2.5 bg-primary-dark text-night text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-40">
              {saving ? 'Saving…' : 'Save Article'}
            </button>
            <button onClick={() => setEditing(null)} className="px-5 py-2.5 border border-line text-ink-muted text-sm rounded-lg hover:bg-parchment transition">Cancel</button>
          </div>
        </SectionCard>
      </div>
    )
  }

  return (
    <div>
      {success && <div className="bg-sage-light text-sage text-sm rounded-lg px-4 py-3 mb-4">✓ {success}</div>}
      {error   && <div className="bg-vermillion-light text-vermillion text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
      <div className="flex gap-2 mb-4">
        <input value={newSlug} onChange={e => setNewSlug(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && createArticle()}
          placeholder="new-article-slug (e.g. saturn-in-aries)"
          className="flex-1 bg-parchment-card border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary-dark" />
        <button onClick={createArticle} className="px-4 py-2 bg-primary-dark text-night text-sm font-semibold rounded-lg hover:opacity-90 transition">+ New Article</button>
      </div>
      <p className="text-xs text-ink-faint mb-4">Order controls /blog listing. Use ▲/▼ to reorder published articles. Archived articles are hidden from visitors.</p>
      {loading ? <div className="flex justify-center py-12 text-2xl animate-spin">🪐</div> : allSlugs.length === 0 ? (
        <p className="text-ink-faint text-sm text-center py-12">No articles yet. Create the first one above.</p>
      ) : (
        <div className="space-y-2">
          {allSlugs.map((slug) => {
            const art = settings[`blog_article_${slug}`] || {}
            const inIndex = index.includes(slug)
            const status = art.status || 'draft'
            return (
              <SectionCard key={slug}>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 flex-shrink-0 pt-0.5">
                    <button onClick={() => moveUp(slug)} disabled={!inIndex || index.indexOf(slug) === 0}
                      className="text-ink-faint hover:text-ink disabled:opacity-20 text-xs">▲</button>
                    <button onClick={() => moveDown(slug)} disabled={!inIndex || index.indexOf(slug) === index.length - 1}
                      className="text-ink-faint hover:text-ink disabled:opacity-20 text-xs">▼</button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[status] ?? STATUS_COLOR.draft}`}>{status}</span>
                      {art.category && <span className="text-xs text-ink-muted">{art.category}</span>}
                      {art.featured && <span className="text-xs text-primary font-medium">★ Featured</span>}
                      {inIndex && <span className="text-xs text-ink-faint">#{index.indexOf(slug)+1}</span>}
                    </div>
                    <div className="font-medium text-sm text-ink truncate">{art.title || slug}</div>
                    {art.excerpt && <div className="text-xs text-ink-muted mt-0.5 line-clamp-1">{art.excerpt}</div>}
                    <div className="text-xs text-ink-faint mt-1 font-mono">{slug}</div>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={() => { setEditing(slug); setEditRaw(JSON.stringify(art, null, 2)) }}
                      className="px-3 py-1.5 bg-parchment border border-line text-ink text-xs font-medium rounded-lg hover:bg-primary-light hover:border-primary/30 transition">Edit</button>
                    {status !== 'published' && (
                      <button onClick={() => publishArticle(slug)}
                        className="px-3 py-1.5 bg-sage-light text-sage text-xs font-semibold rounded-lg hover:opacity-90 transition">Publish</button>
                    )}
                    {status === 'published' && (
                      <button onClick={() => archiveArticle(slug)}
                        className="px-3 py-1.5 bg-parchment border border-line text-ink-muted text-xs rounded-lg hover:bg-vermillion-light hover:text-vermillion hover:border-vermillion/30 transition">Archive</button>
                    )}
                  </div>
                </div>
              </SectionCard>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Testimonials admin tab ─────────────────────────────────────────────────────

const STATUS_LABELS = {
  pending:  { label: 'Pending',  color: 'bg-primary-light text-primary-dark' },
  approved: { label: 'Approved', color: 'bg-sage-light text-sage' },
  featured: { label: 'Featured', color: 'bg-primary text-night' },
  rejected: { label: 'Rejected', color: 'bg-vermillion-light text-vermillion' },
}

function TestimonialsAdminTab({ token }) {
  const [items,   setItems]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [saving,  setSaving]  = useState({})

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setItems(await adminListTestimonials(token)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { load() }, [load])

  async function setStatus(id, status) {
    setSaving(p => ({...p, [id]: true}))
    try { await adminSetTestimonialStatus(token, id, status, null); await load() }
    catch (e) { setError(e.message) }
    finally { setSaving(p => ({...p, [id]: false})) }
  }

  const pending  = (items ?? []).filter(t => t.status === 'pending')
  const rest     = (items ?? []).filter(t => t.status !== 'pending')

  return (
    <div>
      {error && <div className="bg-vermillion-light text-vermillion text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
      <p className="text-xs text-ink-faint mb-4">
        <strong>Featured</strong> (max 4) — shown on the landing page. <strong>Approved</strong> — shown on /testimonials page only. <strong>Rejected</strong> — hidden everywhere.
        <a href="/testimonials" target="_blank" rel="noreferrer" className="ml-2 text-primary-dark underline">View /testimonials page →</a>
      </p>

      {loading ? <div className="flex justify-center py-12 text-2xl animate-spin">🪐</div> : (
        <div className="space-y-3">
          {pending.length > 0 && (
            <div className="font-semibold text-xs text-ink-muted uppercase tracking-wide mb-2">
              Awaiting review ({pending.length})
            </div>
          )}
          {[...pending, ...rest].map(t => {
            const s = STATUS_LABELS[t.status] ?? STATUS_LABELS.pending
            return (
              <SectionCard key={t.id}>
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                      <span className="text-xs font-semibold text-ink">{t.display_name}</span>
                      {t.location && <span className="text-xs text-ink-faint">{t.location}</span>}
                    </div>
                    <p className="text-sm text-ink leading-relaxed">{t.text}</p>
                    {t.detail && <p className="text-xs text-primary-dark mt-1">Used: {t.detail}</p>}
                    {t.admin_notes && <p className="text-xs text-ink-faint mt-1 italic">Note: {t.admin_notes}</p>}
                    <p className="text-xs text-ink-faint mt-1">{new Date(t.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {t.status !== 'featured' && (
                      <button onClick={() => setStatus(t.id, 'featured')} disabled={saving[t.id]}
                        className="px-3 py-1.5 bg-primary text-night text-xs font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap">
                        ★ Feature
                      </button>
                    )}
                    {t.status !== 'approved' && t.status !== 'featured' && (
                      <button onClick={() => setStatus(t.id, 'approved')} disabled={saving[t.id]}
                        className="px-3 py-1.5 bg-sage-light text-sage text-xs font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
                        Approve
                      </button>
                    )}
                    {t.status === 'featured' && (
                      <button onClick={() => setStatus(t.id, 'approved')} disabled={saving[t.id]}
                        className="px-3 py-1.5 bg-parchment border border-line text-ink-muted text-xs rounded-lg hover:bg-parchment-card transition disabled:opacity-50 whitespace-nowrap">
                        Un-feature
                      </button>
                    )}
                    {t.status !== 'rejected' && (
                      <button onClick={() => setStatus(t.id, 'rejected')} disabled={saving[t.id]}
                        className="px-3 py-1.5 bg-parchment border border-line text-ink-muted text-xs rounded-lg hover:bg-vermillion-light hover:text-vermillion hover:border-vermillion/30 transition disabled:opacity-50">
                        Reject
                      </button>
                    )}
                    {t.status === 'rejected' && (
                      <button onClick={() => setStatus(t.id, 'pending')} disabled={saving[t.id]}
                        className="px-3 py-1.5 bg-parchment border border-line text-ink-muted text-xs rounded-lg hover:bg-primary-light transition disabled:opacity-50">
                        Re-review
                      </button>
                    )}
                  </div>
                </div>
              </SectionCard>
            )
          })}
          {(items ?? []).length === 0 && (
            <p className="text-ink-faint text-sm text-center py-12">No testimonials submitted yet.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Audit log tab ──────────────────────────────────────────────────────────────

function AuditTab({ token }) {
  const [logs,    setLogs]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [filter,  setFilter]  = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setLogs(await adminAuditLogs(token, { entity_type: filter || undefined, limit: 100 })) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [token, filter])

  useEffect(() => { load() }, [load])

  const actionColor = { create: 'green', update: 'yellow', delete: 'red' }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input value={filter} onChange={e => setFilter(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
          placeholder="Filter by entity type (e.g. AstrologerProfile)"
          className="flex-1 bg-parchment-card border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary-dark"
        />
        <button onClick={load}
          className="px-4 py-2 bg-primary-dark text-night text-sm font-semibold rounded-lg hover:opacity-90 transition">
          Filter
        </button>
      </div>
      <ErrorBanner msg={error} />
      {loading ? <Spinner /> : (
        <SectionCard>
          {(logs ?? []).length === 0 ? (
            <p className="text-ink-faint text-sm text-center py-8">No audit entries.</p>
          ) : (
            <div className="divide-y divide-line">
              {logs.map(log => (
                <div key={log.id} className="py-3 flex items-start gap-3">
                  <Badge color={actionColor[log.action] ?? 'gray'}>{log.action}</Badge>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm text-ink font-medium">{log.entity_type}</span>
                    {log.entity_id && (
                      <span className="text-xs text-ink-faint ml-2 font-mono">{log.entity_id.slice(0, 8)}…</span>
                    )}
                    {log.meta && (
                      <div className="text-xs text-ink-muted mt-0.5">{JSON.stringify(log.meta)}</div>
                    )}
                    {log.actor_user_id && (
                      <div className="text-xs text-ink-faint mt-0.5">by {log.actor_user_id.slice(0, 8)}…</div>
                    )}
                  </div>
                  <span className="text-xs text-ink-faint flex-shrink-0">
                    {new Date(log.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, accessToken } = useAuth()
  const [tab, setTab] = useState('users')

  return (
    <div className="min-h-screen bg-parchment">
      <Seo title="Admin — Star Jyotish" noindex />

      {/* Header */}
      <div className="bg-night text-primary-light">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="font-serif font-semibold text-lg">⚙️ Admin Dashboard</div>
            <div className="text-xs text-ink-onnight">{user?.name || user?.phone_number}</div>
          </div>
          <AccountMenu />
        </div>

        {/* Tab bar */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto pb-0">
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {tab === 'users'       && <UsersTab       token={accessToken} />}
        {tab === 'astrologers' && <AstrologersTab token={accessToken} />}
        {tab === 'settings'    && <SettingsTab    token={accessToken} />}
        {tab === 'pricing'     && <PricingTab     token={accessToken} />}
        {tab === 'blog'         && <BlogTab         token={accessToken} />}
        {tab === 'testimonials' && <TestimonialsAdminTab token={accessToken} />}
        {tab === 'audit'        && <AuditTab        token={accessToken} />}
      </div>
    </div>
  )
}
