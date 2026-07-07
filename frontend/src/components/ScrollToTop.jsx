// frontend/src/components/ScrollToTop.jsx
//
// Floating "back to top" button. Sits at bottom-36 on mobile so it doesn't
// overlap the AskPersonaPanel FAB (bottom-24) or the BottomNav (bottom-0).
export default function ScrollToTop({ visible }) {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className={`fixed bottom-36 md:bottom-5 right-5 z-40 w-11 h-11 rounded-full bg-primary hover:bg-primary-dark text-night shadow-lg flex items-center justify-center transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}
