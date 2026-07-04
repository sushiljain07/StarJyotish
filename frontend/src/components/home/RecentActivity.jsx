// frontend/src/components/home/RecentActivity.jsx
//
// Timeline of the account's own actions — the one section on this page
// that's purely retrospective (everything else looks at the chart or
// ahead into learning). Built as a small reusable <ActivityRow> so a
// future real feed (see config/homeData.js's comment on
// ReportSummaryOut) only has to supply rows in the same {type, label,
// timestamp} shape.
import HomeIcon from './HomeIcons'

function relativeTime(t, isoTimestamp) {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime()
  const days = Math.floor(diffMs / 86400000)
  if (days <= 0) return t('home_activity_today')
  if (days === 1) return t('home_activity_yesterday')
  if (days < 7) return t('home_activity_days_ago', { count: days })
  const weeks = Math.floor(days / 7)
  return t('home_activity_weeks_ago', { count: weeks })
}

const ICON_BY_TYPE = { report: 'report', ask: 'ask', guide: 'guide', chart: 'chart' }

function ActivityRow({ t, entry, isLast }) {
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center shrink-0">
          <HomeIcon id={ICON_BY_TYPE[entry.type] ?? 'sparkle'} className="w-3.5 h-3.5 text-primary-dark" />
        </span>
        {!isLast && <span className="w-px flex-1 bg-line mt-1" />}
      </div>
      <div className="pb-4">
        <p className="text-ink text-sm">{entry.label}</p>
        <p className="text-ink-faint text-xs mt-0.5">{relativeTime(t, entry.timestamp)}</p>
      </div>
    </li>
  )
}

export default function RecentActivity({ t, activity }) {
  if (!activity || activity.length === 0) return null

  return (
    <section>
      <h2 className="font-serif font-semibold text-lg text-ink mb-3">{t('home_activity_title')}</h2>
      <div className="bg-parchment-card rounded-2xl border border-line p-5 sm:p-6">
        <ul>
          {activity.map((entry, i) => (
            <ActivityRow key={entry.id} t={t} entry={entry} isLast={i === activity.length - 1} />
          ))}
        </ul>
      </div>
    </section>
  )
}
