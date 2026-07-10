// frontend/src/components/home/DoAvoidCards.jsx
//
// Today's personalized guidance cards, elevated to match the premium
// dashboard language while keeping the same do/avoid data.
import { useTranslation } from 'react-i18next'

function GuidanceList({ title, items, accent, tone, symbol }) {
  return (
    <div className={`rounded-[28px] border p-5 shadow-[0_18px_50px_rgba(53,37,16,0.08)] ${tone}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold ${accent}`}>
          {symbol}
        </span>
        <h3 className="font-serif text-lg font-semibold text-ink">{title}</h3>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 rounded-2xl border border-black/5 bg-white/65 px-4 py-3 text-sm leading-relaxed text-ink-muted">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-current opacity-70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function DoAvoidCards({ doItems, avoidItems }) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-4 2xl:grid-cols-2">
      <GuidanceList
        title={t('do_today_heading')}
        items={doItems}
        symbol="✓"
        accent="bg-sage-light text-sage"
        tone="border-sage/15 bg-[linear-gradient(180deg,rgba(159,199,162,0.18)_0%,rgba(255,255,255,0.96)_48%,rgba(255,255,255,1)_100%)]"
      />
      <GuidanceList
        title={t('avoid_today_heading')}
        items={avoidItems}
        symbol="!"
        accent="bg-vermillion-light text-vermillion"
        tone="border-vermillion/15 bg-[linear-gradient(180deg,rgba(224,144,144,0.16)_0%,rgba(255,255,255,0.96)_48%,rgba(255,255,255,1)_100%)]"
      />
    </div>
  )
}
