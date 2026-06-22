// frontend/src/components/AskPersonaCard.jsx
//
// The landing page's signature interactive element. Shows AstroGuru's Ask
// feature working *before* the visitor commits to entering birth details —
// tapping a chip previews how that question gets answered; tapping "Start"
// carries the question through to /generate, and once the real chart
// exists, Result.jsx lands the visitor straight on the Ask tab with that
// question already asked (see Home.jsx → Result.jsx → AskChart.jsx for the
// presetQuestion chain).
//
// The chat bubble is clearly labeled as an example (i18n key
// landing_ai_example_label) — it is not a live call, and should never read
// as one. Honesty here matters more than the demo feeling slicker.
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AI_QUESTIONS } from '../config/aiQuestions'

export default function AskPersonaCard({ onAskQuestion, onAskOwn }) {
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState(AI_QUESTIONS[0].id)
  const active = AI_QUESTIONS.find(q => q.id === activeId)

  return (
    <div className="max-w-lg mx-auto">
      {/* Chat demo bubble */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <img src="/astroguru.svg" alt="" className="w-6 h-6" />
          <span className="text-xs font-semibold text-slate-500">{t('app_title')}</span>
        </div>

        <div className="flex justify-end mb-3">
          <div className="max-w-[85%] bg-primary text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm">
            {t(`landing_ai_q_${active.id}_question`)}
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[90%] bg-slate-100 text-slate-700 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed">
            {t(`landing_ai_q_${active.id}_answer`)}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-4">{t('landing_ai_example_label')}</p>
      </div>

      {/* Question chips — tap to preview, not to commit */}
      <p className="text-center text-xs text-slate-400 mt-5 mb-2">{t('landing_ai_tap_hint')}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {AI_QUESTIONS.map(q => (
          <button
            key={q.id}
            onClick={() => setActiveId(q.id)}
            aria-pressed={activeId === q.id}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              activeId === q.id
                ? 'bg-primary-light border-primary text-primary font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:border-primary'
            }`}
          >
            {t(`landing_ai_q_${q.id}_question`)}
          </button>
        ))}
      </div>

      {/* Single, clear commit action — carries the *currently previewed* question through */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => onAskQuestion(t(`landing_ai_q_${active.id}_question`))}
          className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition"
        >
          {t('landing_ai_cta_start')} →
        </button>
      </div>
      <div className="flex justify-center mt-2">
        <button onClick={onAskOwn} className="text-xs text-slate-400 underline hover:text-primary">
          {t('landing_ai_cta_own')}
        </button>
      </div>
    </div>
  )
}
