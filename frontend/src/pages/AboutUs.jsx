// frontend/src/pages/AboutUs.jsx
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import StaticPageLayout from '../components/StaticPageLayout'

const h2 = 'font-serif font-semibold text-lg text-ink mt-7 mb-2'

export default function AboutUs() {
  return (
    <>
      <Seo
        title="About Us"
        description="Star Jyotish combines real Swiss Ephemeris calculations with AI grounded in a structured Vedic astrology reference library — built to be transparent about how each reading is generated."
        path="/about"
      />
      <StaticPageLayout title="About Star Jyotish" maxWidth="max-w-3xl" eyebrow="Our Story">
        <p>
          Star Jyotish was built on a simple idea: Vedic astrology deserves both genuine astronomical rigor and
          honest, transparent AI — not a generic chatbot wrapped in a zodiac theme, and not vague predictions with
          no methodology behind them.
        </p>

        <h2 className={h2}>What makes our approach different</h2>
        <p>
          Every chart on Star Jyotish is calculated using the <strong className="text-ink">Swiss Ephemeris</strong> —
          the same astronomical engine used by professional astrology software — covering the full Shodashvarga
          (all sixteen divisional charts), KP sub-lord analysis, Ashtakavarga, Vimshottari Dasha, and Rajyoga
          detection. We don't simplify the methodology to make it easier to build; we built the harder version
          first.
        </p>
        <p>
          Our AI readings are grounded in a structured reference library covering career astrology, gemstones,
          marriage compatibility, nakshatra characteristics, numerology, and more — rather than a single generic
          prompt asked to "act like an astrologer." That's a deliberate choice: we'd rather show our work than ask
          you to trust a black box.
        </p>

        <h2 className={h2}>Who's behind this</h2>
        <p>
          Star Jyotish is built and run by a single founder with a long-standing interest in Vedic astrology —
          both as a serious area of study and as something worth building well for a modern, bilingual audience
          in India and beyond. We're an early-stage, independently built platform — not yet a large company —
          and we'd rather be upfront about that than overstate where we are.
        </p>

        <h2 className={h2}>Where we're headed</h2>
        <p>
          We're working toward a platform that combines what AI does well — instant, structured, multi-system
          analysis available in English and Hindi — with real, verified astrologers for the moments where a human
          conversation matters more than an instant report. If you'd like to follow that progress or get in
          touch, see our <Link to="/contact" className="text-primary-dark hover:underline">Contact page</Link>.
        </p>

        <h2 className={h2}>Read more</h2>
        <p>
          For the specifics of how we handle your data, see our{' '}
          <Link to="/privacy" className="text-primary-dark hover:underline">Privacy Policy</Link>. For what to
          expect from AI-generated astrology content, see our{' '}
          <Link to="/disclaimer" className="text-primary-dark hover:underline">Disclaimer</Link>.
        </p>
      </StaticPageLayout>
    </>
  )
}
