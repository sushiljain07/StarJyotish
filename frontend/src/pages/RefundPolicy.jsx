// frontend/src/pages/RefundPolicy.jsx
//
// See PrivacyPolicy.jsx's header comment for the bracketed-placeholder and
// English-first rationale — same applies here. This policy is written for
// the two payment flows the audit identified as planned (one-time AI
// reports, and later pay-per-minute/wallet consultations) rather than
// generic e-commerce boilerplate that doesn't match how this app actually
// charges people.
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import StaticPageLayout from '../components/StaticPageLayout'

const h2 = 'font-serif font-semibold text-lg text-ink mt-7 mb-2 scroll-mt-20'
const ul = 'list-disc pl-5 space-y-1.5'

export default function RefundPolicy() {
  return (
    <>
      <Seo
        title="Refund & Cancellation Policy"
        description="When Star Jyotish refunds a payment — failed charges, duplicate transactions, and how to request one — for AI astrology reports and consultations."
        path="/refund-policy"
      />
      <StaticPageLayout title="Refund & Cancellation Policy" maxWidth="max-w-3xl">
        <p className="text-ink-faint text-xs">Last updated: 29 June 2026</p>

        <p className="bg-sage-light border border-sage/30 rounded-xl px-4 py-3 text-ink text-xs leading-relaxed">
          ℹ️ At the time of writing, the free Kundli, AI reading, and topic reports on Star Jyotish are available
          at no charge during our early-access phase. This policy describes how refunds will work once paid
          features (premium reports, and later live astrologer consultations) go live, so it's ready in advance
          and won't need to be rewritten under pressure later. Any priced item will always show its price clearly
          before you pay.
        </p>

        <h2 className={h2}>1. Digital reports (one-time purchases)</h2>
        <p>Premium AI-generated reports (such as a detailed Career, Relationship, or Wealth report) are digital
          goods delivered instantly upon successful payment. Because the content is generated and shown to you
          immediately, <strong className="text-ink">these purchases are non-refundable once the report has been
          successfully generated and displayed to you</strong> — this is standard practice for instantly-delivered
          digital content and mirrors how Apple, Google, and most digital platforms in India handle one-time
          digital purchases.</p>
        <p>You <strong className="text-ink">are entitled to a full refund</strong> if any of the following happens:</p>
        <ul className={ul}>
          <li>You were charged but the report failed to generate due to a technical error on our end</li>
          <li>You were charged more than once for the same report (duplicate transaction)</li>
          <li>You can show the payment was unauthorized or fraudulent (subject to your bank/payment provider's
            own verification process)</li>
        </ul>

        <h2 className={h2}>2. Live astrologer consultations (chat/call) — once available</h2>
        <p>For paid one-on-one sessions with an astrologer on the marketplace (not yet live):</p>
        <ul className={ul}>
          <li><strong className="text-ink">Before the session starts:</strong> you may cancel for a full refund if
            the astrologer has not yet joined the session</li>
          <li><strong className="text-ink">Astrologer no-show:</strong> if the astrologer fails to join within a
            reasonable waiting period, you'll receive a full refund or credit, at your choice</li>
          <li><strong className="text-ink">Technical failure on our platform</strong> (e.g. call/chat infrastructure
            outage) during a session entitles you to a refund or credit for the affected, unused portion</li>
          <li><strong className="text-ink">Once a session has meaningfully started</strong> and proceeded normally,
            it is non-refundable — you are paying for the astrologer's time, which has been delivered</li>
        </ul>

        <h2 className={h2}>3. Wallet balance — once available</h2>
        <p>If we introduce a prepaid wallet for consultations, any unused balance will remain available for
          future use and will not expire arbitrarily. Wallet balances are intended to be spent within the
          Platform on consultations and reports; cash withdrawal/refund of an unused wallet balance, where
          offered, will be processed back to your original payment method, less any non-recoverable payment
          gateway fees, in line with RBI guidelines applicable to prepaid instruments at that time.</p>

        <h2 className={h2}>4. How to request a refund</h2>
        <p>Email <a href="mailto:info.starjyotish@gmail.com" className="text-primary-dark hover:underline">info.starjyotish@gmail.com</a>{' '}
          with your payment receipt/transaction ID and a short description of the issue. We aim to:</p>
        <ul className={ul}>
          <li>Acknowledge your request within <strong className="text-ink">2 business days</strong></li>
          <li>Resolve straightforward cases (duplicate charge, failed generation) within{' '}
            <strong className="text-ink">5–7 business days</strong></li>
          <li>Process approved refunds to your original payment method within{' '}
            <strong className="text-ink">5–10 business days</strong>, depending on your bank or payment provider's
            own processing timelines once it leaves our system</li>
        </ul>

        <h2 className={h2}>5. Grievance redressal</h2>
        <p>If you're unsatisfied with how a refund request was handled, you can escalate it to our Grievance
          Officer at the same email above. See our <Link to="/terms" className="text-primary-dark hover:underline">Terms
          of Use</Link> and <Link to="/privacy" className="text-primary-dark hover:underline">Privacy Policy</Link> for
          related terms.</p>

        <h2 className={h2}>6. Changes to this policy</h2>
        <p>We'll update this page as new payment features launch, and will update the "Last updated" date above
          whenever we do. The version shown to you at the time of your purchase governs that transaction.</p>
      </StaticPageLayout>
    </>
  )
}
