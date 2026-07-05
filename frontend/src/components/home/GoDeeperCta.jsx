// frontend/src/components/home/GoDeeperCta.jsx
export default function GoDeeperCta({ onOpenFullReading, guideHref, guideLabel }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <button
        onClick={onOpenFullReading}
        className="text-left rounded-2xl p-6 bg-gradient-to-br from-primary to-primary-dark flex flex-col justify-between min-h-[130px] hover:shadow-lg transition"
      >
        <div>
          <h4 className="font-serif font-semibold text-[17px] text-night mb-1.5">Your full AI reading</h4>
          <p className="text-[13px] text-night/70">A complete narrative synthesis of your entire kundli — not a chat, a proper reading you can keep.</p>
        </div>
        <span className="self-start mt-3.5 text-xs font-bold px-4 py-2 rounded-full bg-night text-primary-light">
          Generate full reading →
        </span>
      </button>
      <a
        href={guideHref}
        className="rounded-2xl p-6 bg-parchment-card border border-line flex flex-col justify-between min-h-[130px] hover:border-primary/50 hover:shadow-md transition"
      >
        <div>
          <h4 className="font-serif font-semibold text-[17px] text-ink mb-1.5">{guideLabel}</h4>
          <p className="text-[13px] text-ink-muted">Read the full personality, career, and compatibility guide for your Lagna sign.</p>
        </div>
        <span className="self-start mt-3.5 text-xs font-bold px-4 py-2 rounded-full bg-night text-primary-light">
          Explore guide →
        </span>
      </a>
    </div>
  )
}
