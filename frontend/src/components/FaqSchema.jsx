// frontend/src/components/FaqSchema.jsx
//
// Renders FAQPage JSON-LD for a list of visible Q&A items.
//
// Note (2026-06): Google retired FAQ rich results in Search entirely as of
// May 7, 2026 — there's no eligibility left at all, not even for the
// gov/health sites that briefly kept it after the August 2023 restriction.
// So this will not produce an expandable FAQ snippet in Google. It's kept
// anyway because it's essentially free, schema.org/FAQPage is still a valid
// type, and Bing and AI crawlers still parse it for grounding. `items` must
// exactly match what's visibly rendered on the page — don't pass questions
// the user can't actually see, since mismatched schema is what gets flagged.
import { Helmet } from 'react-helmet-async'

export default function FaqSchema({ items }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  )
}
