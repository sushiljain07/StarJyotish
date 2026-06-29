// frontend/src/components/SocialButtons.jsx
//
// Extracted out of Footer.jsx, which had these icon paths + the button
// markup defined inline. The Contact page needs the same row of icons
// ("Social icons (if already present)" — Task 3 brief), so rather than
// copy the SVG paths a second time, both Footer.jsx and ContactUs.jsx now
// import this. Still placeholder-only — no real profile links exist yet,
// per Footer.jsx's original comment — that hasn't changed, just where the
// markup lives.
const SOCIAL_ICONS = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  x: <path d="M4 4l16 16M20 4L4 20" />,
  youtube: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="3" />
      <path d="M10.5 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M14 8.7h-1.3c-.9 0-1.4.5-1.4 1.4V12h2.4l-.3 2.2h-2.1V19h-2.2v-4.8H9V12h1.7v-2.2c0-1.8 1.1-3.1 3-3.1H14z" fill="currentColor" stroke="none" />
    </>
  ),
}

function SocialButton({ icon, dark }) {
  return (
    <button
      type="button"
      aria-label={icon}
      className={`w-8 h-8 rounded-full border flex items-center justify-center transition ${
        dark
          ? 'bg-white/5 border-white/10 text-ink-onnight hover:text-primary hover:border-primary/40'
          : 'bg-parchment-card border-line text-ink-muted hover:text-primary-dark hover:border-primary/40'
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        {SOCIAL_ICONS[icon]}
      </svg>
    </button>
  )
}

// `dark` picks the color variant for a dark background (the footer) vs. a
// light card (the Contact page) — same two surfaces every other component
// in this app already themes for (see Footer.jsx itself, or PaywallCard).
export default function SocialButtons({ dark = true, className = '' }) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {Object.keys(SOCIAL_ICONS).map(id => <SocialButton key={id} icon={id} dark={dark} />)}
    </div>
  )
}
