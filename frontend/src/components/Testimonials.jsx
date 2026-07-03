// frontend/src/components/Testimonials.jsx
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Reveal from './Reveal'

const ACCENT_RING = ['ring-primary/30','ring-sage/30','ring-mauve/30','ring-primary/30']
const AVATAR_BG   = ['bg-primary-light text-primary-dark','bg-sage-light text-sage','bg-mauve-light text-mauve','bg-primary-light text-primary-dark']
const MARKS = ['✦','✧','✦','✧']

export default function Testimonials({ onCtaClick }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <section className="px-4 py-12 sm:py-16" aria-label="User testimonials">
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-10">
          <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{t('testimonials_subhead')}</p>
          <h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink">{t('testimonials_heading')}</h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {[1,2,3,4].map((n, i) => (
            <Reveal key={n} delay={i * 90}>
              <figure className="bg-parchment-card rounded-2xl border border-line p-5 sm:p-6 h-full flex flex-col">
                <div className="font-serif text-4xl leading-none text-primary/30 mb-1 select-none" aria-hidden="true">"</div>
                <blockquote className="text-ink text-sm leading-relaxed flex-1">{t(`testimonial_${n}_text`)}</blockquote>
                <div className="mt-4 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary-dark bg-primary-light px-2.5 py-1 rounded-full">
                    <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="2.5"/></svg>
                    {t(`testimonial_${n}_detail`)}
                  </span>
                </div>
                <figcaption className="flex items-center gap-3 pt-4 border-t border-line">
                  <div className={`w-9 h-9 rounded-full ring-2 ${ACCENT_RING[i]} flex items-center justify-center text-sm font-bold flex-shrink-0 ${AVATAR_BG[i]}`} aria-hidden="true">
                    {MARKS[i]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink">{t(`testimonial_${n}_name`)}</div>
                    <div className="text-xs text-ink-faint">{t(`testimonial_${n}_location`)}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="text-center mt-10">
          <button onClick={() => onCtaClick ? onCtaClick() : navigate('/generate')}
            className="bg-primary hover:bg-primary-dark text-night font-semibold text-sm px-7 py-3 rounded-full shadow-md hover:shadow-lg transition">
            {t('testimonial_cta_label')} →
          </button>
          <p className="text-ink-faint text-xs mt-2">{t('landing_footer_note')}</p>
        </Reveal>
      </div>
    </section>
  )
}
