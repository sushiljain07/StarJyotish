// frontend/src/components/DivisionalCharts.jsx  v5
//
// All 17 backend-supported divisional charts (D1–D60) mapped to 6 life-domain
// groups: Life / Career / Relationships / Wealth / Health / Spiritual.
// D27 appears in Life + Career; D60 in Life + Spiritual (editorially correct).
// D3 appears only in Relationships (Siblings & Courage).
// D8 only in Health (Longevity).
// D40 and D45 only in Spiritual.
// Every division the backend computes is reachable from at least one group.

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import KundliChart from './KundliChart'
import ChartHighlight from './ChartHighlight'
import { API_BASE } from '../api/config'

// Backend supports: D1 D2 D3 D4 D6 D7 D8 D9 D10 D12 D16 D20 D24 D27 D30 D40 D45 D60
// Coverage check below — every D must appear at least once across all groups.

const GROUPS = [
  // ── Life ──────────────────────────────────────────────────────────────────
  {
    id: 'life',
    emoji: '🧑',
    charts: [
      { code: 'D1', d: 1 },
      { code: 'D27', d: 27 },
      { code: 'D30', d: 30 },
      { code: 'D60', d: 60 },
    ],
  },
  // ── Career ────────────────────────────────────────────────────────────────
  {
    id: 'career',
    emoji: '💼',
    charts: [
      { code: 'D10', d: 10 },
      { code: 'D24', d: 24 },
      { code: 'D27', d: 27 },
    ],
  },
  // ── Relationships ─────────────────────────────────────────────────────────
  {
    id: 'relationships',
    emoji: '❤️',
    charts: [
      { code: 'D9', d: 9 },
      { code: 'D7', d: 7 },
      { code: 'D12', d: 12 },
      { code: 'D3', d: 3 },
    ],
  },
  // ── Wealth ────────────────────────────────────────────────────────────────
  {
    id: 'wealth',
    emoji: '💰',
    charts: [
      { code: 'D2', d: 2 },
      { code: 'D4', d: 4 },
      { code: 'D16', d: 16 },
    ],
  },
  // ── Health ────────────────────────────────────────────────────────────────
  {
    id: 'health',
    emoji: '💚',
    charts: [
      { code: 'D6', d: 6 },
      { code: 'D8', d: 8 },
    ],
  },
  // ── Spiritual ─────────────────────────────────────────────────────────────
  {
    id: 'spiritual',
    emoji: '🙏',
    charts: [
      { code: 'D20', d: 20 },
      { code: 'D40', d: 40 },
      { code: 'D45', d: 45 },
      { code: 'D60', d: 60 },
    ],
  },
]

// Flat lookup for defaultDivision prop — first match wins
const ALL_CHARTS = GROUPS.flatMap(g => g.charts.map(c => ({ ...c, groupId: g.id })))

export default function DivisionalCharts({ input, defaultDivision }) {
  const { t } = useTranslation()
  const [selected, setSelected]   = useState(null)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  useEffect(() => {
    if (!defaultDivision) return
    const match = ALL_CHARTS.find(c => c.d === defaultDivision)
    if (match) openChart(match)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function openChart(chart) {
    setSelected(chart)
    setChartData(null)
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/kundli/divisional?division=${chart.d}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: input.date, time: input.time, place: input.place }),
      })
      if (!res.ok) throw new Error('Failed')
      setChartData(await res.json())
    } catch {
      setError('kundli_div_error')
    }
    setLoading(false)
  }

  function back() {
    setSelected(null)
    setChartData(null)
    setError(null)
  }

  // ── Gallery ───────────────────────────────────────────────────────────────
  if (!selected) {
    return (
      <div>
        {/* Header */}
        <div className="mb-6 pb-4" style={{ borderBottom: '2px solid #EAE1CC' }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#D9A441' }}>
            {t('kundli_div_header')}
          </p>
          <h2 className="font-serif font-bold text-xl text-ink mb-1">
            {t('kundli_div_title')}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {t('kundli_div_intro')}
          </p>
        </div>

        {/* Groups */}
        <div className="space-y-7">
          {GROUPS.map(group => (
            <div key={group.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{group.emoji}</span>
                <h3 className="font-serif font-bold text-base text-ink">{t(`kundli_div_group_${group.id}`)}</h3>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #EAE1CC' }}>
                {group.charts.map((chart, idx) => (
                  <button
                    key={`${group.id}-${chart.d}`}
                    onClick={() => openChart({ ...chart, groupId: group.id })}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-primary-light/40"
                    style={{ borderBottom: idx < group.charts.length - 1 ? '1px solid #EAE1CC' : 'none' }}
                  >
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-ink">{t(`kundli_div_${chart.code}_area`)}</span>
                      <span className="text-xs ml-2 text-ink-muted">
                        {t(`kundli_div_${chart.code}_chart`)} · {chart.code}
                      </span>
                    </div>
                    <span className="shrink-0 ml-3 text-xs font-semibold" style={{ color: '#D9A441' }}>
                      {t('kundli_div_view')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Chart detail ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <button
        onClick={back}
        className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink transition-colors"
      >
        {t('kundli_div_back')}
      </button>

      <div className="pb-4" style={{ borderBottom: '1px solid #EAE1CC' }}>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#D9A441' }}>
          {t(`kundli_div_group_${selected.groupId}`)}
        </p>
        <h2 className="font-serif font-bold text-xl text-ink leading-tight">{t(`kundli_div_${selected.code}_area`)}</h2>
        <p className="text-xs font-semibold mt-0.5 text-ink-muted">
          {t(`kundli_div_${selected.code}_chart`)} · {selected.code}
        </p>
      </div>

      <div className="rounded-xl px-4 py-3.5 bg-parchment-card" style={{ border: '1px solid #EAE1CC' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#D9A441' }}>
          {t('kundli_div_governs_label')}
        </p>
        <p className="text-sm leading-relaxed text-ink">{t(`kundli_div_${selected.code}_governs`)}</p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-14">
          <div className="text-3xl animate-spin mb-3">🪐</div>
          <p className="text-sm font-medium text-ink-muted">{t('kundli_div_calculating', { code: selected.code })}</p>
          <div className="mt-3 w-40 h-1 rounded-full overflow-hidden bg-line">
            <div className="h-full rounded-full animate-pulse bg-primary w-3/4" />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-4 text-sm bg-vermillion-light border border-vermillion/30 text-vermillion">
          ⚠️ {t(error)}
          <button onClick={() => openChart(selected)} className="ml-3 underline text-xs">{t('kundli_div_retry')}</button>
        </div>
      )}

      {!loading && chartData && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-full sm:w-[480px]">
              <KundliChart
                planets={chartData.planets}
                ascendant={chartData.ascendant}
                title={`${selected.code} — ${t(`kundli_div_${selected.code}_chart`)}`}
              />
            </div>
          </div>
          <ChartHighlight input={input} chartType={selected.code} />
        </div>
      )}
    </div>
  )
}
