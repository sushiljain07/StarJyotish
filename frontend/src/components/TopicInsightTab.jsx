// frontend/src/components/TopicInsightTab.jsx
//
// The dedicated page that sits beside Reading inside Insights when the
// user's focus is Health, Relationship, or Finance (Career instead gets
// Rajyogas + the Career Report — see Result.jsx). Distinct from Reading:
// Reading is the AI-generated narrative covering all areas; this is a
// short, topic-specific snapshot using facts already in the chart data,
// no extra API call needed.
//
// Honest about scope: this uses real chart facts (ascendant, Moon, Venus,
// Jupiter placements) already computed by the main /api/kundli call, but
// doesn't run the kind of dedicated yoga-checking analysis Rajyogas does.
// That's flagged to the user as "coming soon" rather than faked.

import { useTranslation } from 'react-i18next'

const TOPIC_META = {
  health:       { icon: '🌿', accent: 'emerald' },
  relationship: { icon: '💕', accent: 'rose' },
  finance:      { icon: '💰', accent: 'amber' },
}

export default function TopicInsightTab({ topic, data }) {
  const { t } = useTranslation()
  const meta = TOPIC_META[topic]
  if (!meta) return null

  const planet = name => data.planets.find(p => p.name === name)
  const moon = planet('Moon')
  const venus = planet('Venus')
  const jupiter = planet('Jupiter')
  const signOf = p => p ? t(`signs.${p.sign}`, p.sign) : '—'

  let body = null
  if (topic === 'health') {
    body = t('topic_health_body', {
      lagna: t(`signs.${data.ascendant.sign}`, data.ascendant.sign),
      moon: signOf(moon),
      nakshatra: moon?.nakshatra || '—',
    })
  } else if (topic === 'relationship') {
    body = t('topic_relationship_body', { moon: signOf(moon), venus: signOf(venus) })
  } else if (topic === 'finance') {
    body = t('topic_finance_body', { jupiter: signOf(jupiter) })
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="text-3xl mb-2">{meta.icon}</div>
      <h3 className="text-lg font-bold text-slate-800 mb-3">{t(`topic_${topic}_heading`)}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
      <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-400">
        {t('topic_coming_soon')}
      </div>
    </div>
  )
}
