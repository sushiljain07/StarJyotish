// frontend/src/components/home/ReportsStrip.jsx  v2 (Home reimagined)
//
// Reports as a Personal Library — the most relevant report is featured
// full-width, the rest sit below as compact tiles. This version folds in
// LifeAreaGrid's weekly signal (computeLifeAreas' output, passed in as the
// new `lifeAreas` prop) so "your reports" and "this week, by life area"
// are one beat instead of two: every card now also shows that area's
// trend chip and a thin score bar, sourced from the same real house-lord
// math LifeAreaGrid used — LifeAreaGrid.jsx itself is retired from the
// home page (kept on disk, just unused here) rather than duplicated.
//
// Cover art is now subtle token tints on the shared night-card surface
// (from-{accent}/20 → night → night-deep) instead of per-report gradient
// hex, and emoji icons are replaced with the house-number glyph that
// actually drives each area (10th = career, 2nd/11th = wealth, 7th =
// marriage, 6th = wellbeing) — the same bhava numbers DoAvoidCards and
// ChartSpotlight already teach elsewhere on this page.
import { useTranslation } from 'react-i18next'

const REPORTS = [
  {
    id: 'career',
    houseGlyph: '10',
    labelKey: 'report_career_label',
    noteKey: 'report_career_note',
    bullets: ['report_career_b1', 'report_career_b2'],
    accent: 'primary',
  },
  {
    id: 'finance',
    houseGlyph: '2·11',
    labelKey: 'report_finance_label',
    noteKey: 'report_finance_note',
    bullets: ['report_finance_b1', 'report_finance_b2'],
    accent: 'sage',
  },
  {
    id: 'relationship',
    houseGlyph: '7',
    labelKey: 'report_relationship_label',
    noteKey: 'report_relationship_note',
    bullets: ['report_relationship_b1', 'report_relationship_b2'],
    accent: 'mauve',
  },
  {
    id: 'health',
    houseGlyph: '6',
    labelKey: 'report_health_label',
    noteKey: 'report_health_note',
    bullets: ['report_health_b1', 'report_health_b2'],
    accent: 'vermillion',
  },
]

// Token accents only — subtle tints on the shared night surface, not
// saturated per-report blocks.
const ACCENT = {
  primary:    { bgFrom: 'from-primary/20',    text: 'text-primary-glow', bar: 'bg-primary',    chip: 'text-primary' },
  sage:       { bgFrom: 'from-sage/20',       text: 'text-sage',         bar: 'bg-sage',       chip: 'text-sage' },
  mauve:      { bgFrom: 'from-mauve/20',      text: 'text-mauve',        bar: 'bg-mauve',      chip: 'text-mauve' },
  vermillion: { bgFrom: 'from-vermillion/20', text: 'text-vermillion',   bar: 'bg-vermillion', chip: 'text-vermillion' },
}

const TREND_LABEL = { up: '▲ Up', down: '▼ Down', flat: '— Steady' }

function TrendChip({ trend, accent, t }) {
  if (!trend) return null
  return (
    <span className={`text-3xs font-bold ${accent.chip}`}>
      {t(`life_trend_${trend}`, TREND_LABEL[trend] ?? TREND_LABEL.flat)}
    </span>
  )
}

function ScoreBar({ pct, accent }) {
  if (pct == null) return null
  return (
    <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden w-full mt-2.5">
      <div className={`h-full rounded-full ${accent.bar}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function FeaturedReport({ report, area, onOpen, t }) {
  const accent = ACCENT[report.accent]
  return (
    <button
      onClick={() => onOpen(report.id)}
      className={`w-full text-left rounded-card overflow-hidden group transition hover:opacity-95 bg-gradient-to-br ${accent.bgFrom} via-night to-night-deep border border-white/[0.08]`}
    >
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className={`w-9 h-9 rounded-lg flex items-center justify-center font-serif font-semibold text-sm bg-white/10 ${accent.text}`}>
            {report.houseGlyph}
          </span>
          <div className="flex items-center gap-2.5">
            <TrendChip trend={area?.trend} accent={accent} t={t} />
            <span className="text-3xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/[0.1] text-ink-onnight/70">
              {t('report_full_tag')}
            </span>
          </div>
        </div>
        <h4 className="font-serif font-semibold text-lg text-primary-light mb-1 leading-snug group-hover:opacity-90">
          {t(report.labelKey)}
        </h4>
        <p className="text-2xs mb-1 text-ink-onnight/55">
          {t(report.noteKey)}
        </p>
        <ScoreBar pct={area?.pct} accent={accent} />
        <div className="flex flex-col gap-1 mt-3.5 mb-4">
          {report.bullets.map(bk => (
            <span key={bk} className={`flex items-start gap-2 text-2xs ${accent.text}`}>
              <span className={`mt-1 w-1 h-1 rounded-full shrink-0 inline-block ${accent.bar}`} />
              {t(bk)}
            </span>
          ))}
        </div>
        <span className={`text-[13px] font-bold ${accent.text}`}>
          {t('report_open')} →
        </span>
      </div>
    </button>
  )
}

function SmallReport({ report, area, onOpen, t }) {
  const accent = ACCENT[report.accent]
  return (
    <button
      onClick={() => onOpen(report.id)}
      className={`w-full text-left rounded-card overflow-hidden group transition hover:opacity-95 flex flex-col bg-gradient-to-br ${accent.bgFrom} via-night to-night-deep border border-white/[0.08]`}
    >
      <div className="px-2.5 py-3 sm:px-3.5 sm:py-3.5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-1 mb-2">
          <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center font-serif font-semibold text-3xs sm:text-2xs bg-white/10 ${accent.text} shrink-0`}>
            {report.houseGlyph}
          </span>
          <TrendChip trend={area?.trend} accent={accent} t={t} />
        </div>
        <h4 className={`font-serif font-semibold text-[11px] sm:text-[13px] text-primary-light mb-0.5 leading-snug group-hover:opacity-90 line-clamp-2`}>
          {t(report.labelKey)}
        </h4>
        <ScoreBar pct={area?.pct} accent={accent} />
        <p className={`text-3xs sm:text-2xs mt-auto pt-2 font-semibold ${accent.text}`}>
          {t('report_open')} →
        </p>
      </div>
    </button>
  )
}

export default function ReportsStrip({ onOpenReport, featuredId, lifeAreas }) {
  const { t } = useTranslation()
  const featuredIdx = REPORTS.findIndex(r => r.id === featuredId)
  const featured = REPORTS[featuredIdx >= 0 ? featuredIdx : 0]
  const rest = REPORTS.filter(r => r.id !== featured.id)

  const areaFor = (reportId) => lifeAreas?.find(a => a.topicId === reportId)

  return (
    <div className="space-y-2.5">
      <FeaturedReport report={featured} area={areaFor(featured.id)} onOpen={onOpenReport} t={t} />
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {rest.map(r => (
          <SmallReport key={r.id} report={r} area={areaFor(r.id)} onOpen={onOpenReport} t={t} />
        ))}
      </div>
    </div>
  )
}
