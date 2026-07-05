// frontend/src/components/home/JyotiAvatar.jsx
//
// An illustrated face, not a photo — two reasons, not one:
//   1. No image-generation tool was available to produce an actual AI
//      photo when this was built.
//   2. Even if one had been, using a real (or real-looking, stock) human
//      face as a fictional persona raises likeness/impersonation concerns
//      independent of tooling — an illustration sidesteps that cleanly
//      rather than working around it.
// If a specific photoreal or illustrated style is wanted later (e.g. via
// Midjourney/DALL-E, or a proper illustrator), this file is the one place
// to swap the SVG below for an <img> — every consumer (AskPersonaPanel's
// FAB + panel header) already just renders <JyotiAvatar className="..." />,
// not raw markup.
export default function JyotiAvatar({ className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Jyoti">
      <defs>
        <linearGradient id="jyotiSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8B98A" />
          <stop offset="100%" stopColor="#D9A06B" />
        </linearGradient>
        <linearGradient id="jyotiHair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2B2118" />
          <stop offset="100%" stopColor="#1A140E" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="#F0CB80" />
      {/* Hair, behind the face */}
      <path d="M50 14c-16 0-27 12-27 28 0 9 2 17 4 23 1-6 2-13 2-19 3 3 8 5 13 5h16c5 0 10-2 13-5 0 6 1 13 2 19 2-6 4-14 4-23 0-16-11-28-27-28z" fill="url(#jyotiHair)" />
      {/* Face */}
      <ellipse cx="50" cy="54" rx="21" ry="24" fill="url(#jyotiSkin)" />
      {/* Hairline strands framing the face */}
      <path d="M29 46c-1 8 0 16 2 22" stroke="url(#jyotiHair)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M71 46c1 8 0 16-2 22" stroke="url(#jyotiHair)" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <path d="M38 52c2-2 6-2 8 0" stroke="#2B2118" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M54 52c2-2 6-2 8 0" stroke="#2B2118" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Bindi */}
      <circle cx="50" cy="45" r="1.6" fill="#A23B3B" />
      {/* Nose */}
      <path d="M50 54v6c0 1.2 1 2 2 2" stroke="#B8794A" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* Smile */}
      <path d="M43 66c3 3 11 3 14 0" stroke="#8A4A3A" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Earrings */}
      <circle cx="30" cy="60" r="2" fill="#D9A441" />
      <circle cx="70" cy="60" r="2" fill="#D9A441" />
      {/* Dupatta/shoulders */}
      <path d="M20 100c2-14 14-22 30-22s28 8 30 22z" fill="#A23B3B" />
      <path d="M20 100c2-14 14-22 30-22s28 8 30 22" fill="none" stroke="#D9A441" strokeWidth="1.5" opacity="0.6" />
    </svg>
  )
}
