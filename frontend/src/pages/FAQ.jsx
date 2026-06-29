// frontend/src/pages/FAQ.jsx
//
// Reuses FAQAccordion as-is (it was already written generically to support
// exactly this — see its own header comment) and reuses the 5 questions
// already live on the landing page (same i18n keys, so they only need to
// be translated/maintained in one place) plus 5 more that fit a full help
// page better than a landing-page teaser.
import { useTranslation } from 'react-i18next'
import Seo from '../components/Seo'
import StaticPageLayout from '../components/StaticPageLayout'
import FAQAccordion from '../components/FAQAccordion'

const LANDING_FAQ_IDS = [1, 2, 3, 4, 5]
const EXTRA_FAQ_IDS = [6, 7, 8, 9, 10]

export default function FAQ() {
  const { t } = useTranslation()

  const items = [
    ...LANDING_FAQ_IDS.map(n => ({ question: t(`landing_faq_q${n}`), answer: t(`landing_faq_a${n}`) })),
    ...EXTRA_FAQ_IDS.map(n => ({ question: t(`faq_page_q${n}`), answer: t(`faq_page_a${n}`) })),
  ]

  return (
    <>
      <Seo
        title="Frequently Asked Questions"
        description="Answers to common questions about Star Jyotish — pricing, accuracy, AI vs. human astrologers, data privacy, and how the platform works."
        path="/faq"
      />
      <StaticPageLayout title="Frequently Asked Questions" maxWidth="max-w-2xl">
        <FAQAccordion items={items} />
      </StaticPageLayout>
    </>
  )
}
