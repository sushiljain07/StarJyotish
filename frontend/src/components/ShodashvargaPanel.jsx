// Shodashvarga: the 16 primary divisional charts used in Jyotish
// D1 D2 D3 D4 D7 D9 D10 D12 D16 D20 D24 D27 D30 D40 D45 D60
import { useState } from 'react'
import KundliChart from './KundliChart'
import SouthIndiaChart from './SouthIndiaChart'
import { API_BASE } from '../api/config'

const SHODASHVARGA = [
  { d: 1,  name: 'D1',  title: 'Rashi',           desc: 'Body, overall life' },
  { d: 2,  name: 'D2',  title: 'Hora',             desc: 'Wealth, finances' },
  { d: 3,  name: 'D3',  title: 'Drekkana',         desc: 'Siblings, courage' },
  { d: 4,  name: 'D4',  title: 'Chaturthamsha',    desc: 'Fortune, home' },
  { d: 7,  name: 'D7',  title: 'Saptamsha',        desc: 'Children, progeny' },
  { d: 9,  name: 'D9',  title: 'Navamsha',         desc: 'Dharma, marriage' },
  { d: 10, name: 'D10', title: 'Dashamsha',        desc: 'Career, profession' },
  { d: 12, name: 'D12', title: 'Dwadashamsha',     desc: 'Parents, lineage' },
  { d: 16, name: 'D16', title: 'Shodashamsha',     desc: 'Vehicles, comforts' },
  { d: 20, name: 'D20', title: 'Vimshamsha',       desc: 'Spiritual progress' },
  { d: 24, name: 'D24', title: 'Siddhamsha',       desc: 'Education, learning' },
  { d: 27, name: 'D27', title: 'Nakshatramsha',    desc: 'Strength, vitality' },
  { d: 30, name: 'D30', title: 'Trimshamsha',      desc: 'Misfortune, evils' },
  { d: 40, name: 'D40', title: 'Khavedamsha',      desc: 'Auspiciousness' },
  { d: 45, name: 'D45', title: 'Akshavedamsha',    desc: 'General well-being' },
  { d: 60, name: 'D60', title: 'Shashtiamsha',     desc: 'Past-life karma' },
]

export default function ShodashvargaPanel({ input }) {
  const [selectedD, setSelectedD] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [chartStyle, setChartStyle] = useState('north')
  const [compareD, setCompareD] = useState(null)
  const [compareData, setCompareData] = useState(null)
  const [compareLoading, setCompareLoading] = useState(false)

  async function fetchDiv(division, setLoad, setChart) {
    setLoad(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/kundli/divisional?division=${division}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: input.date, time: input.time, place: input.place }),
      })
      if (!res.ok) throw new Error('Failed')
      setChart(await res.json())
    } catch {
      setError('Could not load chart.')
    }
    setLoad(false)
  }

  function selectPrimary(d) {
    setSelectedD(d)
    setChartData(null)
    fetchDiv(d, setLoading, setChartData)
  }

  function selectCompare(d) {
    setCompareD(d)
    setCompareData(null)
    fetchDiv(d, setCompareLoading, setCompareData)
  }

  const selected = SHODASHVARGA.find(x => x.d === selectedD)
  const compared = SHODASHVARGA.find(x => x.d === compareD)

  function ChartView({ data, title }) {
    if (!data) return null
    return chartStyle === 'south'
      ? <SouthIndiaChart planets={data.planets} ascendant={data.ascendant} title={title} />
      : <KundliChart planets={data.planets} ascendant={data.ascendant} title={title} />
  }

  return (
    <div className="space-y-4">
      <div className="bg-primary-light border border-primary/30 rounded-xl p-4">
        <h2 className="text-primary-dark font-bold text-base">Shodashvarga — 16 Divisional Charts</h2>
        <p className="text-primary-dark text-xs mt-1">
          The 16 primary divisional charts used in Jyotish. Click any chart to view it.
          Use Compare to view two side-by-side.
        </p>
      </div>

      {/* Chart style */}
      <div className="flex gap-2 items-center">
        <span className="text-xs text-ink-muted">Style:</span>
        {[['north','North Indian'], ['south','South Indian']].map(([id, label]) => (
          <button key={id} onClick={() => setChartStyle(id)}
                  className={`text-xs px-3 py-1 rounded-lg border transition ${
                    chartStyle === id
                      ? 'bg-primary border-primary text-night'
                      : 'bg-parchment-card border-line text-ink-muted hover:border-primary/50'
                  }`}>
            {label}
          </button>
        ))}
      </div>

      {/* 16-chart grid */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {SHODASHVARGA.map(({ d, name, title, desc }) => (
          <button key={d} title={desc}
                  onClick={() => selectPrimary(d)}
                  className={`flex flex-col items-center p-2 rounded-xl border text-center transition ${
                    selectedD === d
                      ? 'bg-primary border-primary text-night shadow-md'
                      : 'bg-parchment-card border-line text-ink hover:border-primary/50 hover:bg-primary-light'
                  }`}>
            <span className="font-bold text-sm">{name}</span>
            <span className={`text-xs mt-0.5 ${selectedD === d ? 'text-primary-light' : 'text-ink-faint'}`}>
              {title}
            </span>
          </button>
        ))}
      </div>

      {/* Selected chart info */}
      {selected && (
        <div className="flex items-center gap-3 flex-wrap bg-vermillion-light border border-vermillion/30 rounded-lg px-4 py-2">
          <span className="text-vermillion font-bold text-sm">{selected.name} — {selected.title}</span>
          <span className="text-vermillion text-xs">{selected.desc}</span>
          {chartData && compareD === null && (
            <button onClick={() => selectCompare(selectedD === 9 ? 1 : 9)}
                    className="ml-auto text-xs text-primary-dark border border-primary/40 px-2 py-1 rounded-lg hover:bg-primary-light">
              Compare with D{selectedD === 9 ? 1 : 9}
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="bg-vermillion-light border border-vermillion/30 rounded-lg p-4 text-vermillion text-sm">⚠️ {error}</div>
      )}

      {/* Charts display */}
      {(loading || chartData) && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="w-full sm:w-[460px]">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="text-center">
                  <div className="text-3xl animate-spin mb-2">🪐</div>
                  <p className="text-ink-muted text-sm">Calculating {selected?.name}…</p>
                </div>
              </div>
            ) : (
              <ChartView data={chartData}
                         title={`${selected?.name} — ${selected?.title}`} />
            )}
          </div>

          {(compareLoading || compareData) && (
            <div className="w-full sm:w-[460px]">
              {compareLoading ? (
                <div className="flex justify-center py-16">
                  <div className="text-center">
                    <div className="text-3xl animate-spin mb-2">🪐</div>
                    <p className="text-ink-muted text-sm">Calculating {compared?.name}…</p>
                  </div>
                </div>
              ) : (
                <div>
                  <ChartView data={compareData}
                             title={`${compared?.name} — ${compared?.title}`} />
                  <button onClick={() => { setCompareD(null); setCompareData(null) }}
                          className="mt-2 text-xs text-ink-muted hover:text-vermillion">
                    ✕ Close comparison
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && !chartData && (
        <div className="text-center py-12 text-ink-faint">
          <img src="/starjyotish.svg" alt="" className="w-10 h-10 mx-auto mb-3 opacity-60" />
          <p className="text-sm">Select any of the 16 divisional charts above</p>
        </div>
      )}
    </div>
  )
}
