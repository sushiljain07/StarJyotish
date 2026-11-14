// Single source of truth for colour tokens. tailwind.config.js and
// theme/chartPalette.js both import from here.
export const colors = {
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
    alt:     '#F1ECE1', // zebra rows
  },
  // Ink text scale, replacing the old slate-800/500/400/200 text colors.
  ink: {
    DEFAULT: '#2A2724',
    // Darkened in Phase 5a so secondary text passes WCAG AA (4.5:1) on
    // parchment; faint is for decoration/disabled text only (3:1).
    muted:   '#6F6656',
    faint:   '#857A6A',
    onnight: '#C9C2D6',
    // Secondary and decorative text on night surfaces (replaces /45-/60 alphas).
    onnightMuted: '#A39CB4',
    onnightFaint: '#8C86A0', // decoration only (3:1)
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
    // Darkened to reach 4.5:1 as text on parchment, card and its own light.
    DEFAULT: '#557258',
    light:   '#E7EEE3',
    onnight: '#869D88',
  },
  // Insights tab accent — replaces the old cool rose, for the same
  // reason as sage above.
  mauve: {
    DEFAULT: '#8B5B72',
    light:   '#F3E6EC',
    onnight: '#D4A5BC',
  },
  // Semantic status colours (Phase 5a): text on parchment passes AA;
  // `light` is the matching tinted background. Use these instead of
  // ad-hoc green/amber/red for good / caution / bad meanings.
  good: {
    DEFAULT: '#3F6B45',
    light:   '#E7EEE3',
    onnight: '#9FC7A2',
  },
  caution: {
    DEFAULT: '#8A5A12',
    light:   '#FBF0DC',
  },
  bad: {
    DEFAULT: '#A23B3B',
    light:   '#F7E8E4',
    onnight: '#E09090',
  },
  // Standard hairline border/divider color on parchment surfaces.
  line: '#EAE1CC',
  // Planet palette (owner decision 14 Nov): AA on parchment.card, parchment.alt
  // and primary.light. Venus is mauve.DEFAULT, Jupiter primary.ink, Mercury good.
  planet: {
    sun: '#B83232', moon: '#6B4BA8', mars: '#8B2A2A', mercury: '#3F6B45',
    jupiter: '#86621E', venus: '#8B5B72', saturn: '#2F5AA8', rahu: '#4A4458',
    ketu: '#7A4A2A', uranus: '#7C3AED', neptune: '#4F46B5', pluto: '#374151',
  },
  // Lighter variants of the same hues for night surfaces (>=4.5:1 on night and night.deep).
  planetNight: {
    sun: '#D27C7C', moon: '#9F8AC6', mars: '#BD8686', mercury: '#7E9C82',
    jupiter: '#A9905F', venus: '#AD8B9C', saturn: '#7894C6', rahu: '#96939E',
    ketu: '#AD8F7B', uranus: '#A97DF3', neptune: '#928CD1', pluto: '#8F959E',
  },
}
