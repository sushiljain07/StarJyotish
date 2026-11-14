/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Saffron gold — the one accent color for every CTA, link, and
        // highlight across the app. Replaces the old indigo brand color.
        primary: {
          DEFAULT: '#D9A441',
          dark:    '#BD8A2E',
          light:   '#FBF0DC',
          // Luminous gold for text/active states on night surfaces —
          // brighter than DEFAULT (which is tuned for parchment), softer
          // than light (which is nearly white). Promoted from the hardcoded
          // #F0CB80 the home page and nav active states were using.
          glow:    '#F0CB80',
          // Gold for TEXT on parchment/white (Phase 5a). DEFAULT and dark fall
          // below 4.5:1 there; this one passes AA for body text.
          ink:     '#86621E',
        },
        // Deep indigo-night — used for hero/header dark bands (the "look up
        // at the stars" moments), not for buttons or links.
        night: {
          DEFAULT: '#171B33',
          light:   '#262B4A',
          // Darkest layer, used only as the /home page's page-level
          // background (SJ-009's "cosmic dial" redesign) — one shade below
          // DEFAULT so hero/cards sitting on top of it still read as
          // distinct layers instead of blending into one flat dark block.
          deep:    '#0F1226',
        },
        // Warm parchment surfaces, replacing the old slate-50/white pairing.
        parchment: {
          DEFAULT: '#F8F3E7',
          card:    '#FFFDF8',
        },
        // Ink text scale, replacing the old slate-800/500/400/200 text colors.
        ink: {
          DEFAULT: '#2A2724',
          // Darkened in Phase 5a so secondary text passes WCAG AA (4.5:1) on
          // parchment; faint is for decoration/disabled text only (3:1).
          muted:   '#6F6656',
          faint:   '#857A6A',
          onnight: '#C9C2D6',
        },
        // Sparing secondary accent — privacy notes, focus highlights, and
        // (replacing the old amber, which sat too close to the new gold to
        // read as a distinct accent) limit/premium warnings on the Ask tab.
        vermillion: {
          DEFAULT: '#A23B3B',
          light:   '#F7E8E4',
        },
        // Advanced tab accent — replaces the old cool teal, which clashed
        // with the warm gold/night/parchment system above.
        sage: {
          DEFAULT: '#5B7A5E',
          light:   '#E7EEE3',
        },
        // Insights tab accent — replaces the old cool rose, for the same
        // reason as sage above.
        mauve: {
          DEFAULT: '#8C5B73',
          light:   '#F3E6EC',
        },
        // Semantic status colours (Phase 5a): text on parchment passes AA;
        // `light` is the matching tinted background. Use these instead of
        // ad-hoc green/amber/red for good / caution / bad meanings.
        good: {
          DEFAULT: '#3F6B45',
          light:   '#E7EEE3',
        },
        caution: {
          DEFAULT: '#8A5A12',
          light:   '#FBF0DC',
        },
        bad: {
          DEFAULT: '#A23B3B',
          light:   '#F7E8E4',
        },
        // Standard hairline border/divider color on parchment surfaces.
        line: '#EAE1CC',
      },
      fontSize: {
        // Extend the scale for UI metadata, captions, and badge labels
        // that currently use text-[10px] / text-[9px] arbitrary values.
        // Adding these two steps keeps the design system closed rather
        // than open-ended.
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],   // 11px — replaces text-[11px]
        '3xs': ['0.625rem',  { lineHeight: '0.875rem' }], // 10px — replaces text-[10px]
      },
      fontFamily: {
        // Headline-only serif — see index.html for the Fraunces import.
        // Neither Inter nor Fraunces has Devanagari glyphs, so the browser
        // falls through to the Devanagari face per character. Hindi
        // headlines get Tiro Devanagari Hindi, a serif that matches Fraunces'
        // character rather than a sans fallback.
        sans: ['Inter', 'Noto Sans Devanagari', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Tiro Devanagari Hindi', 'Georgia', 'serif'],
      },
      // One card radius for the whole app — components/ui/Card.jsx uses
      // this; ad-hoc rounded-lg/xl/2xl on cards should converge here.
      borderRadius: {
        card: '1rem',
      },
      // Two elevations only: resting cards and lifted/hover/overlay
      // surfaces. Tuned to the warm night ink so shadows don't go gray.
      boxShadow: {
        card: '0 1px 2px rgba(23, 27, 51, 0.06), 0 4px 12px rgba(23, 27, 51, 0.05)',
        lift: '0 6px 16px rgba(23, 27, 51, 0.10), 0 12px 32px rgba(23, 27, 51, 0.08)',
      },
      keyframes: {
        // Content entrance — single home for these two keyframes; used via
        // animate-fade-in-up / animate-fade-in-fast (reduced-motion handled
        // in index.css).
        fadeSlideIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeSlideInFast: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        // Route-change cross-fade — fast enough to feel instant, present
        // enough that pages stop hard-swapping. Used by the app shell.
        routeFade: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up':   'fadeSlideIn 0.6s ease forwards',
        'fade-in-fast': 'fadeSlideInFast 0.25s ease-out forwards',
        'route-fade':   'routeFade 0.18s ease-out',
      },
    },
  },
  plugins: [],
}
