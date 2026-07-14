// frontend/src/pages/Disclaimer.jsx
import { useTranslation } from 'react-i18next'
import Seo from '../components/Seo'
import StaticPageLayout from '../components/StaticPageLayout'

const sections = [
  {
    heading: '1. Purpose of Our Services',
    body: [
      'Star Jyotish provides personalized astrological insights, birth chart analysis, horoscope interpretations, compatibility reports, educational content, and AI-assisted explanations based on principles of Vedic astrology.',
      'Our services are intended to help users better understand traditional astrological concepts and explore personal perspectives. They are designed for informational, educational, and self-reflection purposes only.',
      'Astrology is an interpretative discipline, and different practitioners may arrive at different conclusions using the same birth details.',
    ],
  },
  {
    heading: '2. No Guarantees or Predictions of Certain Outcomes',
    body: [
      'While we strive to provide meaningful and accurate astrological interpretations, we do not guarantee that any prediction, recommendation, timing, or interpretation will occur exactly as described.',
      'Future events depend on numerous personal, social, environmental, and unforeseen factors beyond astrology.',
      'Nothing provided on the Platform should be interpreted as a promise, guarantee, warranty, or assurance of any future event or outcome.',
    ],
  },
  {
    heading: '3. AI-Assisted Content',
    body: [
      'Some content available on Star Jyotish is generated or enhanced using Artificial Intelligence (AI) alongside traditional astrological calculations and proprietary interpretation systems.',
      'Although we continuously improve our AI models, AI-generated explanations may occasionally contain inaccuracies, omissions, or interpretations that differ from those of professional astrologers.',
      'Users should exercise their own judgment when relying on AI-generated content.',
    ],
  },
  {
    heading: '4. Personal Responsibility',
    body: [
      'You remain solely responsible for your personal decisions and actions.',
      'Any choices you make based on information provided by Star Jyotish are entirely at your own discretion and risk.',
      'The Company shall not be liable for any direct, indirect, incidental, consequential, financial, emotional, or other losses arising from the use of our Platform or reliance on its content.',
    ],
  },
  {
    heading: '5. Not Professional Advice',
    body: [
      'The information provided through Star Jyotish is not intended to replace professional advice.',
      'Our Platform should not be relied upon as legal, financial, medical, psychological, psychiatric, investment, tax, educational, employment, or relationship counseling.',
      'If you require assistance in these areas, please consult an appropriately qualified professional.',
      'If you are experiencing a medical or mental health emergency, please contact the appropriate healthcare provider or emergency services immediately.',
    ],
  },
  {
    heading: '6. Accuracy of Birth Information',
    body: [
      'Astrological interpretations depend on the accuracy of the birth details provided by the user.',
      'Incorrect birth date, time, location, or other information may significantly affect the generated charts and interpretations.',
      'Star Jyotish cannot be held responsible for inaccurate reports resulting from incorrect user-provided information.',
    ],
  },
  {
    heading: '7. Individual Experiences May Differ',
    body: [
      'Astrology represents one perspective for understanding life experiences.',
      "Each individual's circumstances, decisions, free will, personal effort, and external influences contribute to life outcomes.",
      'Results and experiences may therefore vary significantly from person to person.',
    ],
  },
  {
    heading: '8. Availability of Services',
    body: [
      'We continuously improve Star Jyotish and may add, modify, suspend, or discontinue features, reports, pricing, or services at any time without prior notice.',
      'We do not guarantee uninterrupted, error-free, or continuous availability of the Platform.',
    ],
  },
  {
    heading: '9. Third-Party Services',
    body: [
      'Our Platform may contain links or integrations with third-party websites, payment providers, communication services, analytics tools, or external resources.',
      'We do not control or endorse these third-party services and are not responsible for their content, privacy practices, availability, or performance.',
      'Your use of such services is governed by their respective terms and policies.',
    ],
  },
  {
    heading: '10. Eligibility',
    body: [
      'You must be at least 18 years of age to independently use our paid services.',
      'If you are below the age of 18, you may access the Platform only with the consent and supervision of a parent or legal guardian.',
    ],
  },
  {
    heading: '11. User Feedback',
    body: [
      'We welcome feedback, feature requests, and suggestions from our users.',
      'Unless otherwise agreed in writing, any suggestions voluntarily submitted may be used by the Company to improve our products and services without any obligation or compensation.',
    ],
  },
  {
    heading: '12. Changes to This Disclaimer',
    body: [
      'We may revise this Disclaimer periodically to reflect legal, operational, or product changes.',
      'The updated version will become effective once published on the Platform. Continued use of Star Jyotish after such updates constitutes acceptance of the revised Disclaimer.',
    ],
  },
  {
    heading: '13. Acceptance of This Disclaimer',
    bullets: [
      'You understand the nature of astrological services.',
      'You accept that astrology is interpretative and cannot guarantee future outcomes.',
      'You understand that some content may be AI-assisted.',
      'You agree to use the Platform responsibly and at your own discretion.',
      'You agree to this Disclaimer and our Terms of Service and Privacy Policy.',
    ],
    intro: 'By accessing or using Star Jyotish, you acknowledge that:',
  },
  {
    heading: '14. Contact Us',
    body: [
      'If you have any questions regarding this Disclaimer or our services, please contact us.',
    ],
    contact: true,
  },
]

export default function Disclaimer() {
  const { t } = useTranslation()

  return (
    <>
      <Seo
        title={t('disclaimer_page_heading')}
        description="Star Jyotish Disclaimer — AI-powered Vedic astrology readings are for informational and self-reflection purposes only. Not a substitute for professional medical, legal, financial, or psychological advice."
        path="/disclaimer"
      />
      <StaticPageLayout title={t('disclaimer_page_heading')}>
        {/* Plain-language summary */}
        <div className="bg-primary-light border border-primary/30 rounded-xl px-4 py-4 mb-6 not-prose">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-dark mb-2">In plain language</p>
          <ul className="space-y-1.5 text-sm text-ink">
            <li>✦ Readings are for guidance and self-reflection — not medical, legal, or financial advice.</li>
            <li>✦ Astrology is a cultural and philosophical tradition, not a verified science.</li>
            <li>✦ You're in charge of your decisions. We help you reflect; we don't decide for you.</li>
          </ul>
        </div>

        <p className="text-xs text-ink-muted mb-6">
          <strong>Effective Date:</strong> July 5, 2026
        </p>

        <p className="mb-6">
          Welcome to <strong>Star Jyotish</strong>, an AI-powered Vedic astrology platform owned and operated by{' '}
          <strong>[Your Company Name] Private Limited</strong> ("Company", "we", "our", or "us").
        </p>
        <p className="mb-6">
          This Disclaimer applies to all products and services offered through the Star Jyotish website, mobile
          applications, APIs, emails, and any other digital platforms or communication channels operated by us
          (collectively referred to as the "Platform").
        </p>
        <p className="mb-8">
          By accessing or using Star Jyotish, you acknowledge that you have read, understood, and agreed to this
          Disclaimer.
        </p>

        <hr className="border-ink-muted/20 mb-8" />

        {sections.map((section) => (
          <div key={section.heading} className="mb-8">
            <h2 className="font-serif font-semibold text-base text-ink mb-3">{section.heading}</h2>

            {section.intro && <p className="mb-2">{section.intro}</p>}

            {section.bullets && (
              <ul className="list-disc list-inside space-y-1 mb-2">
                {section.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}

            {section.body &&
              section.body.map((para) => (
                <p key={para} className="mb-2">
                  {para}
                </p>
              ))}

            {section.contact && (
              <div className="mt-3 space-y-1">
                <p className="font-semibold text-ink">Star Jyotish</p>
                <p>
                  Email:{' '}
                  <a href="mailto:support@starjyotish.com" className="text-primary underline">
                    support@starjyotish.com
                  </a>
                </p>
                <p>
                  Website:{' '}
                  <a href="https://www.starjyotish.com" className="text-primary underline">
                    www.starjyotish.com
                  </a>
                </p>
              </div>
            )}
          </div>
        ))}

        <hr className="border-ink-muted/20 mt-2 mb-4" />
        <p className="text-xs text-ink-muted">Last Updated: July 5, 2026</p>
      </StaticPageLayout>
    </>
  )
}
