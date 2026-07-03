// frontend/src/config/learningTaxonomy.js
//
// Shared vocabulary for the Knowledge Center: the difficulty scale and
// the category list every guide gets tagged with. Both
// config/knowledgeGraph.js (per-guide metadata) and any future content
// config read from this instead of each defining their own copy of
// "what a category is" — the categories here are deliberately the same
// eight already used for the /learn landing page's "Explore by Category"
// grid (see learnContent.js's CATEGORIES), just with `id` as the shared
// key both files key off of.

export const DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
}

export const DIFFICULTY_LABELS = {
  [DIFFICULTY.BEGINNER]: 'Beginner',
  [DIFFICULTY.INTERMEDIATE]: 'Intermediate',
  [DIFFICULTY.ADVANCED]: 'Advanced',
}

export const CATEGORIES = [
  { id: 'beginner',  label: 'Beginner Guides' },
  { id: 'zodiac',    label: 'Zodiac' },
  { id: 'nakshatra', label: 'Nakshatra' },
  { id: 'planets',   label: 'Planets' },
  { id: 'houses',    label: 'Houses' },
  { id: 'dashas',    label: 'Dashas' },
  { id: 'yogas',     label: 'Yogas' },
  { id: 'doshas',    label: 'Doshas' },
]

export function getCategoryLabel(id) {
  return CATEGORIES.find(c => c.id === id)?.label ?? id
}
