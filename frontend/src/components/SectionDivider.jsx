// frontend/src/components/SectionDivider.jsx
//
// Punctuation between sections — a sparkle between two short line segments.
// Replaces plain whitespace at a few transition points on the landing page
// where sections otherwise just stack with nothing marking the seam.
export default function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-1" aria-hidden="true">
      <span className="h-px w-12 sm:w-20 bg-line" />
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-primary/70" fill="currentColor">
        <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
      </svg>
      <span className="h-px w-12 sm:w-20 bg-line" />
    </div>
  )
}
