import { useState } from 'react'

const YOGA_ICONS = {
  'Raja Yoga':                  '👑',
  'Dharma-Karma Adhipati Yoga': '⚖️',
  'Budha-Aditya Yoga':          '☀️',
  'Gaja-Kesari Yoga':           '🐘',
  'Hamsa Yoga':                 '🦢',
  'Malavya Yoga':               '💎',
  'Sasa Yoga':                  '🪐',
  'Bhadra Yoga':                '📚',
  'Ruchaka Yoga':               '⚔️',
  'Amala Yoga':                 '🌸',
  'Adhi Yoga':                  '🏛️',
  'Dhana Yoga':                 '💰',
  'Kendra-Trikona Rajyoga':     '🔺',
  'Yogakaraka Planet':          '🌟',
  'Neecha Bhanga Rajyoga':      '🔄',
  'Vipareeta Rajyoga':          '🌪️',
  'Kahala Yoga':                '🦁',
  'Lakshmi Yoga':               '🌺',
  'Saraswati Yoga':             '🎶',
  'Chamara Yoga':               '🪭',
}

const YOGA_DETAILS = {
  'Raja Yoga': {
    meaning: 'The king-making yoga formed when the lords of fortune (9th house) and action (10th house) unite in the same house, combining dharma and karma.',
    characteristics: [
      'Bestows authority and high social standing',
      'Native rises to prominent positions in career or public life',
      'Strong leadership qualities and decision-making power',
      'Recognition and respect from peers and superiors',
    ],
    benefits: [
      'Political power, government positions, or corporate leadership',
      'Fame and name that spreads far beyond birthplace',
      'Ability to command large organizations or institutions',
      'Success multiplies during the dashas of the involved planets',
    ],
  },
  'Dharma-Karma Adhipati Yoga': {
    meaning: 'Formed by a sign exchange (Parivartana) between the 9th and 10th house lords. Fortune and career destiny become deeply intertwined.',
    characteristics: [
      'Career path aligns naturally with one\'s higher purpose',
      'Success comes through ethical and righteous action',
      'Strong moral compass guides professional decisions',
      'The native\'s work often benefits society at large',
    ],
    benefits: [
      'Sustained career success built on a solid ethical foundation',
      'Recognition as a person of integrity and virtue',
      'Spiritual advancement alongside material success',
      'Long-lasting legacy that outlives the native',
    ],
  },
  'Budha-Aditya Yoga': {
    meaning: 'Sun (soul and authority) and Mercury (intellect and communication) conjunct in the same house — intellect is illuminated by the light of the self.',
    characteristics: [
      'Exceptionally sharp and articulate mind',
      'Ability to express ideas with clarity and confidence',
      'Intelligence combined with natural authority',
      'Strong memory and analytical reasoning',
    ],
    benefits: [
      'Success in careers requiring intelligence: consulting, writing, academics',
      'Favor from government and authority figures',
      'Persuasive communication that wins trust',
      'Excellence in research, teaching, and advisory roles',
    ],
  },
  'Gaja-Kesari Yoga': {
    meaning: 'Elephant (Gaja) and Lion (Kesari) — Jupiter in a kendra (1st/4th/7th/10th) from Moon. Wisdom and courage combine for lasting greatness.',
    characteristics: [
      'Broad wisdom and generous nature',
      'Natural charisma and presence in public',
      'Good fortune through learning and mentorship',
      'Prosperous and dignified social life',
    ],
    benefits: [
      'Fame and reputation that endures long after death',
      'Material prosperity alongside spiritual wisdom',
      'Respected as a teacher, guide, or community leader',
      'Blessings of good health and long life',
    ],
  },
  'Hamsa Yoga': {
    meaning: 'One of the Pancha Mahapurusha Yogas — Jupiter in its own or exalted sign in a kendra. The swan symbolizes purity, wisdom, and discernment.',
    characteristics: [
      'Noble character and high spiritual inclination',
      'Deep wisdom and philosophical insight',
      'Generous and compassionate disposition',
      'Well-respected for integrity and learning',
    ],
    benefits: [
      'Prominence in education, law, spirituality, or philosophy',
      'Respected and honored by scholars and wise persons',
      'Beautiful home, devoted family, and comfortable life',
      'Capacity to guide others toward the right path',
    ],
  },
  'Malavya Yoga': {
    meaning: 'Pancha Mahapurusha Yoga — Venus in own or exalted sign in a kendra. Named after the prosperous Malwa region, it grants beauty and luxury.',
    characteristics: [
      'Refined aesthetic sense and artistic talent',
      'Charming personality and magnetic social presence',
      'Love of luxury, beauty, and sensory pleasures',
      'Skilled in music, arts, fashion, or entertainment',
    ],
    benefits: [
      'Wealth and material comforts accumulated with ease',
      'Success in creative fields, fashion, entertainment, luxury goods',
      'Happy marriage and pleasurable domestic life',
      'Fame in arts and culture; admired for beauty and talent',
    ],
  },
  'Sasa Yoga': {
    meaning: 'Pancha Mahapurusha Yoga — Saturn in own or exalted sign in a kendra. The hare (Sasa) represents patience, endurance, and mastery over time.',
    characteristics: [
      'Highly disciplined, methodical, and hardworking',
      'Ability to manage and lead large groups of people',
      'Skilled in administration, law, and public service',
      'Rises slowly but builds a strong and lasting foundation',
    ],
    benefits: [
      'Leadership roles in large institutions, corporations, or government',
      'Accumulation of land, property, and wealth over time',
      'Authority over servants, workers, and subordinates',
      'Longevity and the ability to withstand adversity',
    ],
  },
  'Bhadra Yoga': {
    meaning: 'Pancha Mahapurusha Yoga — Mercury in own or exalted sign in a kendra. "Bhadra" means auspicious — this yoga blesses with brilliant intellect.',
    characteristics: [
      'Razor-sharp analytical and mathematical mind',
      'Eloquent speech and masterful writing ability',
      'Skill in trade, commerce, and financial analysis',
      'Quick learner with excellent memory and wit',
    ],
    benefits: [
      'Distinguished career in finance, CA, commerce, IT, or communication',
      'Wealth from business, trade, and intellectual ventures',
      'Admired for intelligence and rhetorical skill',
      'Success in media, publishing, and consulting',
    ],
  },
  'Ruchaka Yoga': {
    meaning: 'Pancha Mahapurusha Yoga — Mars in own or exalted sign in a kendra. Named after Sage Ruchaka, this yoga creates warriors and leaders.',
    characteristics: [
      'Exceptionally courageous, energetic, and competitive',
      'Strong physical constitution and willpower',
      'Executive authority and commanding presence',
      'Natural instinct for strategy and decisive action',
    ],
    benefits: [
      'Distinguished career in military, police, surgery, or sports',
      'Fame as a bold leader and decisive executive',
      'Success in real estate, engineering, and construction',
      'Ability to overcome enemies and overcome adversity',
    ],
  },
  'Amala Yoga': {
    meaning: '"Amala" means spotless or pure. Formed when a natural benefic (Jupiter, Venus, Mercury, or Moon) occupies the 10th house from lagna.',
    characteristics: [
      'Unblemished professional reputation throughout life',
      'Career built on integrity, compassion, and service',
      'Naturally positive and uplifting presence in the workplace',
      'Work that serves or benefits others',
    ],
    benefits: [
      'A spotless legacy — name is untarnished even after death',
      'Success through honest and ethical means only',
      'Popularity and love from the community',
      'Long-lasting good name that benefits descendants',
    ],
  },
  'Adhi Yoga': {
    meaning: 'Formed when Mercury, Venus, and Jupiter (at least 2) occupy the 6th, 7th, and 8th houses from the Moon. "Adhi" means superior or prime.',
    characteristics: [
      'Natural aptitude for high administrative roles',
      'Strong diplomatic and negotiating skills',
      'Ability to transform adversaries into allies',
      'Well-rounded intellect covering law, arts, and wisdom',
    ],
    benefits: [
      'Equivalent of a chief minister or prime minister in modern terms',
      'Commanding authority over rivals and competitors',
      'Freedom from serious illness and longevity',
      'Happiness, wealth, and freedom from worry',
    ],
  },
  'Dhana Yoga': {
    meaning: 'Wealth yoga formed when the lords of the 2nd house (accumulated wealth) and 11th house (income and gains) are strong in their signs.',
    characteristics: [
      'Strong financial instincts and money-attracting qualities',
      'Multiple sources of income and steady wealth accumulation',
      'Generous nature that still retains prosperity',
      'Financial success through career or enterprise',
    ],
    benefits: [
      'Significant financial gains and wealth accumulation',
      'Economic security for self and family',
      'Ability to generate wealth across multiple dashas',
      'Freedom from financial hardship throughout life',
    ],
  },
  'Kendra-Trikona Rajyoga': {
    meaning: 'The highest-grade Rajyoga in Vedic astrology. A lord of a kendra (1/4/7/10 — power) and a lord of a trikona (1/5/9 — fortune) conjoin in the same house.',
    characteristics: [
      'Fortune (trikona) and power (kendra) work in complete harmony',
      'Rapid rise to positions of prominence and authority',
      'Success feels natural and unstoppable during relevant dashas',
      'Combination of luck, skill, and destiny all aligned',
    ],
    benefits: [
      'The most potent indicator of royalty, kingship, or equivalent',
      'Extraordinary career success and social elevation',
      'Wealth, fame, and power achieved simultaneously',
      'Results are especially strong in the dasha of the planets involved',
    ],
  },
  'Yogakaraka Planet': {
    meaning: 'A single planet that simultaneously rules both a kendra and a trikona house for the native\'s lagna. This makes it the supreme benefic for the chart.',
    characteristics: [
      'One planet becomes the key to all success in the chart',
      'Its dasha periods produce the most transformative results',
      'Acts as both fortune-giver (trikona) and power-giver (kendra)',
      'Well-placed Yogakaraka elevates the entire chart\'s quality',
    ],
    benefits: [
      'Exceptional career and life success during its dasha and antardasha',
      'Wearing the gem of the Yogakaraka can amplify positive results',
      'A well-dignified Yogakaraka alone can deliver a prosperous life',
      'Fame, wealth, authority, and spiritual merit all at once',
    ],
  },
  'Neecha Bhanga Rajyoga': {
    meaning: '"Neecha Bhanga" means cancellation of debilitation. When a planet\'s weakness is cancelled by specific conditions, it turns into extraordinary strength.',
    characteristics: [
      'What was initially a weakness becomes the greatest strength',
      'Native often faces early struggles before dramatic rise',
      'Resilience, grit, and the ability to bounce back from failures',
      'The debilitated planet\'s qualities manifest powerfully once cancelled',
    ],
    benefits: [
      'Dramatic and unexpected rise after a period of hardship',
      'Greater success than those who never faced difficulties',
      'The planet becomes extremely strong in its area of life',
      'Transformation of enemies and obstacles into stepping-stones',
    ],
  },
  'Vipareeta Rajyoga': {
    meaning: '"Vipareeta" means reversed or contrary. Lords of dusthana houses (6th/8th/12th) placed in each other\'s houses cause adversity to self-destruct.',
    characteristics: [
      'Native benefits from the downfall of enemies or rivals',
      'Hidden strength — troubles and losses ultimately become gains',
      'May appear to struggle on the surface while gaining internally',
      'Events that seem negative at first reverse into blessings',
    ],
    benefits: [
      'Unexpected rise through circumstances that harm others',
      'Gains from inherited property, insurance, or foreign sources',
      'Ability to overcome hidden enemies and recover from setbacks',
      'A protective shield against life\'s major misfortunes',
    ],
  },
  'Kahala Yoga': {
    meaning: 'Formed when the 4th and 9th house lords conjoin, or when their ruler occupies a kendra or trikona. "Kahala" means bold, courageous, or adventurous.',
    characteristics: [
      'Fearless, direct, and commanding personality',
      'Strong connection between fortune and domestic happiness',
      'Blessed with land, property, vehicles, and comforts',
      'Natural authority and the ability to lead boldly',
    ],
    benefits: [
      'Wealth in land, real estate, and immovable property',
      'Authority over many subordinates and followers',
      'Good fortune from father, gurus, and higher education',
      'A bold approach to life that attracts success',
    ],
  },
  'Lakshmi Yoga': {
    meaning: 'Named after Goddess Lakshmi (divine wealth). Formed when the 9th lord is in its own or exalted sign and placed in a kendra or trikona house.',
    characteristics: [
      'Blessed with divine grace and material abundance',
      'Beautiful, charming, and deeply fortunate personality',
      'Strong dharmic instincts that attract prosperity',
      'Wealth comes naturally without extreme effort',
    ],
    benefits: [
      'Immense wealth, luxury, and material comforts',
      'Fame and beauty that attract opportunities effortlessly',
      'Divine protection and blessings of the goddess of prosperity',
      'Charitable nature combined with ever-replenishing abundance',
    ],
  },
  'Saraswati Yoga': {
    meaning: 'Named after Goddess Saraswati (wisdom and arts). Formed when Mercury, Venus, and Jupiter (at least 2) occupy a kendra, trikona, or the 2nd house.',
    characteristics: [
      'Exceptional intelligence combined with artistic sensibility',
      'Eloquent, learned, and deeply cultivated mind',
      'Mastery over language, music, or a specialized field of knowledge',
      'Respected as an intellectual and creative authority',
    ],
    benefits: [
      'Outstanding academic achievements and literary fame',
      'Excellence in teaching, writing, music, or philosophy',
      'Honored by scholars, artists, and learned institutions',
      'Lasting fame through intellectual or creative contributions',
    ],
  },
  'Chamara Yoga': {
    meaning: '"Chamara" means a royal fan — used to honor kings. Formed when Jupiter is in a kendra and the lagna lord is exalted/own, or Jupiter itself is exalted in a kendra.',
    characteristics: [
      'Scholarly, noble, and learned personality',
      'Honored and respected like royalty in one\'s field',
      'Deep wisdom combined with executive authority',
      'Attracts patronage from powerful and influential persons',
    ],
    benefits: [
      'Fame as a learned, wise, and respected figure',
      'Royal or government patronage and honors',
      'Success in advisory, scholarly, and leadership roles',
      'A life filled with dignity, recognition, and intellectual prestige',
    ],
  },
}

function getInfo(yogaName) {
  for (const [key, info] of Object.entries(YOGA_DETAILS)) {
    if (yogaName.startsWith(key)) return info
  }
  return null
}

function getIcon(yogaName) {
  for (const [key, icon] of Object.entries(YOGA_ICONS)) {
    if (yogaName.startsWith(key)) return icon
  }
  return '✨'
}

function YogaCard({ yoga, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const icon = getIcon(yoga.yoga)
  const info = getInfo(yoga.yoga)

  const isPresent = yoga.present

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden transition-all ${
      isPresent
        ? 'bg-white border-emerald-200 border-l-4 border-l-emerald-500'
        : 'bg-slate-50 border-slate-200'
    }`}>
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <span className={`text-2xl mt-0.5 ${isPresent ? '' : 'opacity-40'}`}>{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-bold text-sm ${isPresent ? 'text-slate-800' : 'text-slate-500'}`}>
              {yoga.yoga}
            </h3>
            {isPresent
              ? <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Present</span>
              : <span className="text-xs font-medium bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">Not present</span>
            }
          </div>
          <p className={`text-xs mt-1 leading-relaxed ${isPresent ? 'text-slate-600' : 'text-slate-400'}`}>
            {yoga.description}
          </p>
        </div>
        <span className={`text-slate-400 text-xs mt-1 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Expandable details */}
      {open && info && (
        <div className={`px-4 pb-4 pt-0 border-t ${isPresent ? 'border-emerald-100' : 'border-slate-200'}`}>
          {/* Meaning */}
          <div className="mt-3">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isPresent ? 'text-indigo-600' : 'text-slate-400'}`}>
              What is this yoga?
            </p>
            <p className={`text-xs leading-relaxed ${isPresent ? 'text-slate-700' : 'text-slate-500'}`}>
              {info.meaning}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            {/* Characteristics */}
            <div className={`rounded-lg p-3 ${isPresent ? 'bg-indigo-50' : 'bg-slate-100'}`}>
              <p className={`text-xs font-semibold mb-2 ${isPresent ? 'text-indigo-700' : 'text-slate-500'}`}>
                Characteristics
              </p>
              <ul className="space-y-1">
                {info.characteristics.map((c, i) => (
                  <li key={i} className={`flex gap-1.5 text-xs leading-relaxed ${isPresent ? 'text-slate-700' : 'text-slate-500'}`}>
                    <span className={`mt-1 shrink-0 w-1 h-1 rounded-full ${isPresent ? 'bg-indigo-400' : 'bg-slate-400'}`} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div className={`rounded-lg p-3 ${isPresent ? 'bg-emerald-50' : 'bg-slate-100'}`}>
              <p className={`text-xs font-semibold mb-2 ${isPresent ? 'text-emerald-700' : 'text-slate-500'}`}>
                Benefits
              </p>
              <ul className="space-y-1">
                {info.benefits.map((b, i) => (
                  <li key={i} className={`flex gap-1.5 text-xs leading-relaxed ${isPresent ? 'text-slate-700' : 'text-slate-500'}`}>
                    <span className={`mt-1 shrink-0 w-1 h-1 rounded-full ${isPresent ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RajyogasTab({ input }) {
  const [status, setStatus]     = useState('idle')
  const [result, setResult]     = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function load() {
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/rajyogas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `Server error ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
      setStatus('done')
    } catch (e) {
      setErrorMsg(e.message)
      setStatus('error')
    }
  }

  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="text-5xl">👑</div>
        <h2 className="text-xl font-bold text-slate-800">Rajyoga Analysis</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          Discover all classical Rajyogas, Dhana Yogas, Mahapurusha Yogas and
          more present in your birth chart — with detailed meanings and benefits.
        </p>
        <button
          onClick={load}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow transition text-sm">
          Analyse Rajyogas
        </button>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i}
              className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p className="text-sm text-slate-500">Scanning your chart for yogas…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="text-3xl">⚠️</div>
        <p className="text-sm text-red-600">{errorMsg}</p>
        <button onClick={load} className="text-sm text-indigo-600 underline">Try again</button>
      </div>
    )
  }

  const present = result.yogas.filter(y => y.present)

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">👑</span>
          <div>
            <h2 className="font-bold text-lg leading-tight">Your Rajyogas</h2>
            <p className="text-indigo-200 text-xs">
              Classical Vedic yogas present in your birth chart — tap any card to see full details
            </p>
          </div>
        </div>
        <div className="mt-3">
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center inline-block">
            <div className="text-2xl font-extrabold">{present.length}</div>
            <div className="text-xs text-indigo-100">Yogas Active in Your Chart</div>
          </div>
        </div>
      </div>

      {/* Present yogas — open by default */}
      {present.length > 0 ? (
        <div>
          <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-3 px-1">
            Active Yogas in Your Chart ({present.length})
          </h3>
          <div className="space-y-3">
            {present.map((y, i) => <YogaCard key={i} yoga={y} defaultOpen={true} />)}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 text-center border border-slate-100 shadow-sm">
          <div className="text-3xl mb-2">🌱</div>
          <p className="text-slate-600 text-sm">No classical Rajyogas detected in this chart.</p>
          <p className="text-slate-400 text-xs mt-1">This does not limit success — many planetary combinations outside these yogas can bring excellent results.</p>
        </div>
      )}
    </div>
  )
}
