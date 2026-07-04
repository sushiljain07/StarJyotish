// frontend/src/components/AskPersonaCard.jsx
//
// The landing page's signature interactive element. Previously opened with
// a question already pre-selected — functionally fine, but it read as an
// FAQ widget (visitor lands on an answer before they've asked anything).
// SJ-007 reframes this as the astrologer speaking first: a proactive
// opening line, then the visitor picks a question to see the conversation
// continue — closer to how a first session with a real astrologer starts.
//
// Still not a live call, and never should read as one — the greeting
// deliberately does NOT claim to have already "reviewed your chart" (no
// chart exists yet at this point), and the exchange itself stays labeled
// as an example (i18n key landing_ai_example_label). Honesty here matters
// more than the demo feeling slicker.
//
// Tapping a chip previews how that question gets answered; tapping
// "Begin" carries the question through to /generate, and once the real
// chart exists, Result.jsx lands the visitor straight on the Ask tab with
// that question already asked (see Home.jsx → Result.jsx → AskChart.jsx
// for the presetQuestion chain).
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AI_QUESTIONS } from '../config/aiQuestions'

export default function AskPersonaCard({ onAskQuestion, onAskOwn }) {
  const { t } = useTranslation()
  // No question is pre-selected — the card opens on the astrologer's
  // proactive greeting alone, and only grows into a Q&A exchange once the
  // visitor picks something themselves.
  const [activeId, setActiveId] = useState(null)
  const active = AI_QUESTIONS.find(q => q.id === activeId)

  return (
    <div className="max-w-lg mx-auto">
      {/* Chat demo bubble */}
      <div className="bg-parchment-card rounded-2xl shadow-md border border-line p-5">
        <div className="flex items-center gap-2 mb-4">
          <img src="/starjyotish.svg" alt="" className="w-6 h-6" />
          <span className="text-xs font-semibold text-ink-muted">{t('app_title')}</span>
        </div>

        {/* Proactive opening — the astrologer speaks first, unprompted */}
        <div className="flex justify-start mb-3">
          <div className="max-w-[92%] bg-night/5 text-ink rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed">
            {t('landing_ai_greeting')}
          </div>
        </div>

        {active && (
          <>
            <div className="flex justify-end mb-3">
              <div className="max-w-[85%] bg-primary text-night rounded-2xl rounded-br-sm px-4 py-2.5 text-sm">
                {t(`landing_ai_q_${active.id}_question`)}
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[90%] bg-night/5 text-ink rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed">
                {t(`landing_ai_q_${active.id}_answer`)}
              </div>
            </div>
          </>
        )}

        <p className="text-[11px] text-ink-faint text-center mt-4">{t('landing_ai_example_label')}</p>
      </div>

      {/* Question chips — tap to preview, not to commit */}
      <p className="text-center text-xs text-ink-faint mt-5 mb-2">{t('landing_ai_tap_hint')}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {AI_QUESTIONS.map(q => (
          <button
            key={q.id}
            onClick={() => setActiveId(q.id)}
            aria-pressed={activeId === q.id}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              activeId === q.id
                ? 'bg-primary-light border-primary text-primary font-semibold'
                : 'bg-parchment-card border-line text-ink-muted hover:border-primary'
            }`}
          >
            {t(`landing_ai_q_${q.id}_question`)}
          </button>
        ))}
      </div>

      {/* Commit action only appears once a question has actually been
          picked — before that there's nothing yet to "begin with". */}
      {active && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => onAskQuestion(t(`landing_ai_q_${active.id}_question`))}
            className="bg-primary hover:bg-primary-dark text-night text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition"
          >
            {t('landing_ai_cta_start')} →
          </button>
        </div>
      )}
      <div className="flex justify-center mt-2">
        <button onClick={onAskOwn} className="text-xs text-ink-faint underline hover:text-primary-dark">
          {t('landing_ai_cta_own')}
        </button>
      </div>
    </div>
  )
}

