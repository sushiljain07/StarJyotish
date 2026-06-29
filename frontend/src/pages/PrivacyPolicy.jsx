// frontend/src/pages/PrivacyPolicy.jsx
//
// Content is in English only for now — see the note rendered just below
// the heading for why, and Footer.jsx's "Cookie Policy" link, which points
// here (to #cookies) instead of a separate page, since cookie/local-storage
// disclosure is short enough to fold into Privacy rather than spin up a
// fourth legal page.
//
// Bracketed [placeholders] mark facts only Shriyansh can fill in once the
// business is incorporated (legal entity name, registered address,
// grievance officer name) — see the audit's Section 7 finding that no
// entity is registered yet. Everything else here reflects what the app
// actually does today, verified against the codebase (see PROGRESS notes
// in the audit), not generic boilerplate.
import Seo from '../components/Seo'
import StaticPageLayout from '../components/StaticPageLayout'

const h2 = 'font-serif font-semibold text-lg text-ink mt-7 mb-2 scroll-mt-20'
const ul = 'list-disc pl-5 space-y-1.5'

export default function PrivacyPolicy() {
  return (
    <>
      <Seo
        title="Privacy Policy"
        description="How Star Jyotish collects, uses, and protects your birth details and personal data when you generate a Vedic astrology chart or AI reading."
        path="/privacy"
      />
      <StaticPageLayout title="Privacy Policy" maxWidth="max-w-3xl">
        <p className="text-ink-faint text-xs">Last updated: 29 June 2026</p>

        <p>
          This Privacy Policy explains how Star Jyotish ("Star Jyotish", "we", "us", "our") collects, uses,
          shares, and protects information when you use starjyotish.com and related services (the "Platform").
          It is written to be specific to what this Platform actually does — not generic boilerplate — and will
          be updated as features like accounts and payments go live.
        </p>
        <p className="bg-primary-light border border-primary/30 rounded-xl px-4 py-3 text-ink text-xs leading-relaxed">
          📝 This policy is published in English. हिंदी (Hindi) is supported throughout the rest of the app, and
          a Hindi version of this policy will follow; until then, the English text governs in case of any
          difference in meaning.
        </p>

        <nav aria-label="Table of contents" className="bg-parchment-card border border-line rounded-xl p-4 text-sm">
          <p className="font-semibold text-ink mb-2">On this page</p>
          <ol className="list-decimal pl-5 space-y-1 text-primary-dark">
            <li><a href="#what-we-collect" className="hover:underline">Information we collect</a></li>
            <li><a href="#how-we-use" className="hover:underline">How we use your information</a></li>
            <li><a href="#ai-processing" className="hover:underline">AI processing disclosure</a></li>
            <li><a href="#sharing" className="hover:underline">Sharing & third parties</a></li>
            <li><a href="#retention" className="hover:underline">Data retention</a></li>
            <li><a href="#cookies" className="hover:underline">Cookies & local storage</a></li>
            <li><a href="#your-rights" className="hover:underline">Your rights</a></li>
            <li><a href="#children" className="hover:underline">Children's & family birth data</a></li>
            <li><a href="#security" className="hover:underline">Security</a></li>
            <li><a href="#transfers" className="hover:underline">International data transfers</a></li>
            <li><a href="#changes" className="hover:underline">Changes to this policy</a></li>
            <li><a href="#contact" className="hover:underline">Grievance officer & contact</a></li>
          </ol>
        </nav>

        <h2 id="what-we-collect" className={h2}>1. Information we collect</h2>
        <p><strong className="text-ink">Birth & astrological details.</strong> Your full name, date of birth, time of birth,
          and place of birth. This is the core input needed to calculate your chart using the Swiss Ephemeris
          astronomical engine — without it, we cannot generate a Kundli. We treat this as sensitive information,
          since date, time, and place of birth together can be enough to identify or narrow down a specific
          individual.</p>
        <p><strong className="text-ink">Questions you ask.</strong> Any follow-up questions you type into "Ask the Chart",
          and the topic you select (career, relationship, health, or finance), are sent along with your chart
          data to generate a response.</p>
        <p><strong className="text-ink">Account information (once accounts launch).</strong> If you register for an
          account — currently not required to use the Platform — we will collect a phone number and/or email for
          OTP login, and any saved charts/reports linked to that account.</p>
        <p><strong className="text-ink">Payment information (once payments launch).</strong> We do not, and will not,
          store your full card or UPI credentials ourselves — payments will be processed by a licensed payment
          gateway (e.g. Razorpay), and we only retain transaction references needed for receipts and support.</p>
        <p><strong className="text-ink">Technical & usage data.</strong> Your IP address (used to apply fair-use rate
          limits and prevent abuse of paid AI features), browser/device type, and which pages or report tabs you
          use. We do not currently run any third-party analytics or advertising trackers on the Platform.</p>
        <p><strong className="text-ink">WhatsApp number, if you choose to share one.</strong> Certain prompts on the
          Platform invite you to leave a WhatsApp number (for example, to receive your reading later). As of this
          policy's date, that number is saved only in your own browser's local storage on your device — it is not
          transmitted to or stored on our servers. This will change once WhatsApp delivery is fully wired up on
          our backend, at which point this policy will be updated accordingly.</p>

        <h2 id="how-we-use" className={h2}>2. How we use your information</h2>
        <ul className={ul}>
          <li>To calculate your birth chart, divisional charts, Dasha, and other astrological computations</li>
          <li>To generate AI-powered readings and answer your follow-up questions</li>
          <li>To apply rate limits that keep AI-backed features fairly available and financially sustainable for everyone</li>
          <li>To detect and prevent abuse, fraud, or misuse of the Platform</li>
          <li>To improve the accuracy and usefulness of our astrological content and AI prompts</li>
          <li>To communicate with you about your account, a purchase, or a support request (once these features exist)</li>
          <li>To comply with applicable law, including responding to lawful requests from authorities</li>
        </ul>
        <p>We do not sell your personal information to anyone, and we do not use your birth details for purposes
          unrelated to providing the astrology service you asked for.</p>

        <h2 id="ai-processing" className={h2}>3. AI processing disclosure</h2>
        <p>Your birth details and any question you ask are sent to large language model providers — currently
          Anthropic (Claude) and Groq, accessed directly or via OpenRouter — solely to generate your reading or
          answer. These providers process the request under their own standard commercial API terms, which (as
          of this policy's date) state that data submitted through their API is not used to train their general
          models, except in narrow cases such as investigating abuse of their own platform. We choose providers
          on this basis, but we encourage you to review each provider's own policy for the most current
          commitments, since those terms are set by the provider, not by us.</p>

        <h2 id="sharing" className={h2}>4. Sharing & third parties</h2>
        <p>We share information only with service providers who help us run the Platform, and only to the extent
          needed for them to do that job:</p>
        <ul className={ul}>
          <li><strong className="text-ink">AI providers</strong> — Anthropic, Groq, OpenRouter (Section 3)</li>
          <li><strong className="text-ink">Geocoding</strong> — OpenStreetMap Nominatim, to convert your place of birth into
            coordinates and a time zone for chart calculation</li>
          <li><strong className="text-ink">Hosting infrastructure</strong> — Vercel (frontend) and Railway (backend), who
            process data only as needed to serve the application</li>
          <li><strong className="text-ink">Payment processor</strong> — once payments launch, a licensed gateway such as
            Razorpay, for the sole purpose of processing your transaction</li>
        </ul>
        <p>We may also disclose information if required by law, court order, or governmental request, or to
          protect the rights, property, or safety of Star Jyotish, our users, or the public. If our business is
          ever acquired, merged, or its assets transferred, your information may transfer as part of that deal,
          subject to this policy (or one offering equivalent protection).</p>

        <h2 id="retention" className={h2}>5. Data retention</h2>
        <p>As of this policy's date, the Platform is largely <strong className="text-ink">stateless</strong>: birth
          details you enter are used to calculate your chart and reading in real time and are not saved in any
          database afterward. Once account-based features (saved charts, report history) launch, we will retain
          that data for as long as your account is active, or as needed to provide the service, and will offer a
          clear way to delete your account and associated data. This section will be updated with specific
          retention periods at that point.</p>

        <h2 id="cookies" className={h2}>6. Cookies & local storage</h2>
        <p>We do not currently use third-party advertising or analytics cookies. The Platform does use your
          browser's local storage (not cookies) for a small number of first-party purposes:</p>
        <ul className={ul}>
          <li>Remembering your language preference (English/Hindi)</li>
          <li>Remembering a WhatsApp number you've chosen to leave (stored on your device only — see Section 1)</li>
          <li>A developer-only flag used internally during testing, which has no effect on your data or privacy</li>
        </ul>
        <p>You can clear this at any time via your browser's settings; doing so simply resets your language
          preference and any saved WhatsApp number on that device.</p>

        <h2 id="your-rights" className={h2}>7. Your rights</h2>
        <p>Under India's Digital Personal Data Protection Act, 2023, and other applicable law, you have the right
          to:</p>
        <ul className={ul}>
          <li>Know what personal data we hold about you and how it is processed</li>
          <li>Request correction or completion of inaccurate or incomplete data</li>
          <li>Request erasure of your personal data, where applicable</li>
          <li>Withdraw consent you previously gave, at any time</li>
          <li>Lodge a grievance with our Grievance Officer (Section 12), and escalate to the Data Protection
            Board of India if unresolved</li>
          <li>Nominate another individual to exercise these rights on your behalf in the event of death or
            incapacity</li>
        </ul>
        <p>To exercise any of these rights today, email us at the address in Section 12 — since the Platform is
          currently stateless for most features, many requests can be resolved immediately by confirming we hold
          no stored record beyond what's described above.</p>

        <h2 id="children" className={h2}>8. Children's privacy & family birth data</h2>
        <p>The Platform is intended for use by individuals aged 18 and above, or by parents/guardians acting on
          behalf of a minor. We recognise that Vedic astrology is often used by parents to generate a child's
          birth chart — if you enter a child's birth details, you confirm you are that child's parent or legal
          guardian and are providing the information voluntarily for that purpose. We do not knowingly collect
          data directly from children, do not use a child's birth details for marketing, and do not build
          advertising profiles of minors.</p>

        <h2 id="security" className={h2}>9. Security</h2>
        <p>We use HTTPS encryption for all data in transit, and apply rate limiting on our backend to reduce the
          risk of automated abuse. We do not store payment card details on our own servers — that responsibility
          sits with our PCI-DSS-compliant payment partner once payments launch. No method of transmission or
          storage is 100% secure, and we cannot guarantee absolute security, but we take reasonable, industry-
          standard measures appropriate to the sensitivity of the data involved.</p>

        <h2 id="transfers" className={h2}>10. International data transfers</h2>
        <p>Some of our service providers (including AI and hosting providers named in Sections 3–4) may process
          data on servers located outside India, including in the United States. As of this policy's date, the
          Government of India has not notified a list of countries to which personal data transfers are
          restricted under the Digital Personal Data Protection Act, 2023; we will update this section if that
          changes.</p>

        <h2 id="changes" className={h2}>11. Changes to this policy</h2>
        <p>We may update this policy as the Platform evolves — particularly as accounts, payments, and the
          astrologer marketplace launch. We'll update the "Last updated" date above, and for material changes
          (such as new categories of data collected), we'll provide a more visible notice on the Platform.</p>

        <h2 id="contact" className={h2}>12. Grievance officer & contact</h2>
        <p>
          Grievance Officer: <em className="text-ink-faint">[Name to be appointed upon incorporation]</em><br />
          Operated by: <em className="text-ink-faint">[Legal entity name and registered address — to be added once
          Star Jyotish is formally incorporated]</em><br />
          Email: <a href="mailto:contact@starjyotish.com" className="text-primary-dark hover:underline">contact@starjyotish.com</a>
        </p>
        <p>We aim to acknowledge privacy-related requests within a reasonable time and resolve them as quickly as
          the nature of the request allows.</p>
      </StaticPageLayout>
    </>
  )
}
