// frontend/src/components/home/SuggestedQuestions.jsx
// Styled like a Knowledge Center section — eyebrow heading, grid of
// interactive cards using the ArticleCard hover pattern.
import HomeIcon from './HomeIcons'
import { SUGGESTED_QUESTIONS } from '../../config/homeData'

export default function SuggestedQuestions({ t, onAsk }) {
  return (
    <section>
      <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">
        Ask Jyoti
      </p>
      <h2 className="font-serif font-semibold text-2xl text-ink mb-1">
        {t('home_questions_title')}
      </h2>
      <p className="text-ink-muted text-sm mb-5">
        Questions based on your actual birth chart — tap one to begin a real conversation.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SUGGESTED_QUESTIONS.map((q) => {
          const question = t(`home_question_${q.id}`)
          return (
            <button
              key={q.id}
              onClick={() => onAsk(question)}
              className="group flex items-start gap-3 text-left bg-parchment-card hover:bg-primary-light/40 border border-line hover:border-primary/40 rounded-xl px-4 py-4 transition hover:shadow-sm"
            >
              <span className="w-8 h-8 rounded-full bg-night flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary transition">
                <HomeIcon id="ask" className="w-3.5 h-3.5 text-primary group-hover:text-night transition" />
              </span>
              <span>
                <span className="block text-ink text-sm leading-snug font-medium">{question}</span>
                <span className="block text-ink-faint text-[11px] mt-1 group-hover:text-primary-dark transition">
                  Ask your AI Astrologer →
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
