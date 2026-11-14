import { colors } from './src/theme/tokens.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors,
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
