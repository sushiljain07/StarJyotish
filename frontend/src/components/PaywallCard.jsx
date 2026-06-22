// frontend/src/components/PaywallCard.jsx
//
// Shown instead of locked tab content when hasPremiumAccess() is false.
// See src/config/entitlements.js for how the lock itself is controlled.

export default function PaywallCard({ icon = '🔒', title, body, bullets = [] }) {
  return (
    <div className="max-w-md mx-auto py-10 px-6 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-ink mb-2">{title}</h3>
      <p className="text-sm text-ink-muted leading-relaxed mb-4">{body}</p>
      {bullets.length > 0 && (
        <ul className="text-sm text-ink text-left space-y-1.5 mb-6 inline-block">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-emerald-500 shrink-0">✓</span>{b}
            </li>
          ))}
        </ul>
      )}
      <button
        // TODO: wire to the real checkout flow once Razorpay (Master Plan
        // Phase 4) exists. There's nowhere real to send someone yet — swap
        // in a payment link or a WhatsApp/contact link when ready.
        onClick={() => alert('Checkout is coming soon — your full report will unlock right here.')}
        className="bg-primary hover:bg-primary-dark text-night text-sm font-semibold px-6 py-2.5 rounded-full shadow transition"
      >
        Unlock Full Report
      </button>
    </div>
  )
}
