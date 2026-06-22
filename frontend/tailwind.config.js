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
        },
        // Deep indigo-night — used for hero/header dark bands (the "look up
        // at the stars" moments), not for buttons or links.
        night: {
          DEFAULT: '#171B33',
          light:   '#262B4A',
        },
        // Warm parchment surfaces, replacing the old slate-50/white pairing.
        parchment: {
          DEFAULT: '#F8F3E7',
          card:    '#FFFDF8',
        },
        // Ink text scale, replacing the old slate-800/500/400/200 text colors.
        ink: {
          DEFAULT: '#2A2724',
          muted:   '#7A7264',
          faint:   '#A39C8C',
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
        // Standard hairline border/divider color on parchment surfaces.
        line: '#EAE1CC',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Headline-only serif — see index.html for the Fraunces import.
        // Devanagari has no Fraunces glyphs, so Hindi headings fall back to
        // the sans stack automatically; that's a deliberate, honest
        // fallback rather than a forced, less-legible serif substitute.
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
