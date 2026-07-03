// frontend/src/components/knowledge/FAQ.jsx
//
// Knowledge Center wrapper around the FAQAccordion + FaqSchema components
// that already exist in components/ (built for the standalone FAQ page).
// Deliberately does not reimplement the accordion — this just adds the
// heading block and the JSON-LD emission on top, so a guide page can drop
// in one <FAQ items={...} /> instead of wiring three pieces together.
import FAQAccordion from '../FAQAccordion'
import FaqSchema from '../FaqSchema'

export default function FAQ({ title = 'Frequently Asked Questions', items, maxWidth = 'max-w-2xl' }) {
  if (!items || items.length === 0) return null

  return (
    <div className={`${maxWidth} mx-auto`}>
      <FaqSchema items={items} />
      {title && (
        <h2 className="font-serif font-semibold text-xl sm:text-2xl text-ink mb-5">{title}</h2>
      )}
      <FAQAccordion items={items} />
    </div>
  )
}
