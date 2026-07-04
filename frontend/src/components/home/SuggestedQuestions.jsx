// frontend/src/components/home/SuggestedQuestions.jsx
// Starter prompts for the Ask AI flow.
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
              className="flex items-center gap-3 text-left bg-parchment-card hover:bg-primary-light/60 border border-line hover:border-primary/50 rounded-xl px-4 py-3.5 transition group shadow-sm"
            >
              <span className="w-7 h-7 rounded-full bg-night flex items-center justify-center shrink-0 group-hover:bg-primary transition">
                <HomeIcon id="ask" className="w-3.5 h-3.5 text-primary group-hover:text-night transition" />
              </span>
              <span className="text-ink text-sm leading-snug">{question}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
