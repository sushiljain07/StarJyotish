// frontend/src/components/home/SuggestedQuestions.jsx
//
// Thoughtful starter prompts in place of an empty AI input box — tapping
// one carries the question into the real Ask flow via /generate, the same
// {landToAsk, presetQuestion} handoff AskPersonaCard.jsx uses on the
// landing page (see Home.jsx → Result.jsx → AskChart.jsx for the full
// chain). Distinct from that landing-page component: no canned demo
// answer here, since a signed-in visitor is meant to get a real one.
import HomeIcon from './HomeIcons'
import { SUGGESTED_QUESTIONS } from '../../config/homeData'

export default function SuggestedQuestions({ t, onAsk }) {
  return (
    <section>
      <h2 className="font-serif font-semibold text-lg text-ink mb-3">{t('home_questions_title')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SUGGESTED_QUESTIONS.map(q => {
          const question = t(`home_question_${q.id}`)
          return (
            <button
              key={q.id}
              onClick={() => onAsk(question)}
              className="flex items-center gap-2.5 text-left bg-parchment-card hover:bg-primary-light/50 border border-line hover:border-primary/40 rounded-xl px-4 py-3 transition"
            >
              <HomeIcon id="ask" className="w-4 h-4 text-primary-dark shrink-0" />
              <span className="text-ink text-sm">{question}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
