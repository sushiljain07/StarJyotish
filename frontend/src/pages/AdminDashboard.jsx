// frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import {
  adminListUsers, adminUserReports,
  adminListSettings, adminUpsertSetting,
  adminAuditLogs,
  adminListAstrologers, adminOnboardAstrologer, adminSetKyc,
} from '../api/admin'

const TABS = [
  { id: 'users',       label: 'Users' },
  { id: 'astrologers', label: 'Astrologers' },
  { id: 'settings',    label: 'Feature Flags' },
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
          <a href="/" className="text-xs text-ink-onnight hover:text-primary-light transition">← App</a>
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
        {tab === 'audit'       && <AuditTab       token={accessToken} />}
      </div>
    </div>
  )
}
