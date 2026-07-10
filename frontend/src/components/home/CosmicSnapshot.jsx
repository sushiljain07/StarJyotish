// frontend/src/components/home/CosmicSnapshot.jsx
//
// "Your Cosmic Snapshot" dark card — Moon Sign, Day of week, Nakshatra.
// Matches the design: dark purple card with gold ✦ icon, right-pointing
// chevron, and 3 info items in a row.

export default function CosmicSnapshot({ panchang, profile }) {
  if (!panchang && !profile) return null

  const moonSign = profile?.chart?.planets?.find(p => p.name === 'Moon')?.sign ?? '—'
  const nakName  = typeof panchang?.nakshatra === 'object'
    ? panchang.nakshatra?.name
    : panchang?.nakshatra ?? '—'
  const dayName  = new Date().toLocaleDateString('en-GB', { weekday: 'long' })

  const items = [
    { icon: '☽', label: 'Moon Sign', value: moonSign },
    { icon: '📅', label: 'Day',       value: dayName },
    { icon: '✦',  label: 'Nakshatra', value: nakName },
  ]

  return (
    <div className="sj-cs-card">
      <div className="sj-cs-header">
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div className="sj-cs-icon-wrap">✦</div>
          <div>
            <p className="sj-cs-title">Your Cosmic Snapshot</p>
            <p className="sj-cs-sub">A quick peek into today's energies</p>
          </div>
        </div>
        <span className="sj-cs-chevron">›</span>
      </div>
      <div className="sj-cs-row">
        {items.map(item => (
          <div key={item.label} className="sj-cs-item">
            <p className="sj-cs-item-label">{item.icon} {item.label}</p>
            <p className="sj-cs-item-value">{item.value}</p>
          </div>
        ))}
      </div>
      <style>{`
        .sj-cs-card {
          background: linear-gradient(135deg, #2d1f5e 0%, #1a1635 100%);
          border: 1px solid rgba(217,164,65,0.2);
          border-radius: 16px;
          padding: 16px 18px 18px;
          height: 100%;
        }
        .sj-cs-header {
          display:flex;align-items:flex-start;
          justify-content:space-between;margin-bottom:16px;
        }
        .sj-cs-icon-wrap {
          width:38px;height:38px;border-radius:10px;
          background:rgba(217,164,65,0.2);
          border:1px solid rgba(217,164,65,0.3);
          display:flex;align-items:center;justify-content:center;
          font-size:16px;color:#D9A441;flex-shrink:0;
        }
        .sj-cs-title {
          font-size:15px;font-weight:700;
          color:rgba(248,242,228,0.95);margin:0 0 2px;
        }
        .sj-cs-sub {
          font-size:11px;color:rgba(248,242,228,0.45);margin:0;
        }
        .sj-cs-chevron {
          font-size:20px;color:rgba(248,242,228,0.3);
          align-self:center;
        }
        .sj-cs-row {
          display:grid;grid-template-columns:repeat(3,1fr);gap:8px;
        }
        .sj-cs-item { text-align:center; }
        .sj-cs-item-label {
          font-size:10px;color:rgba(248,242,228,0.45);
          margin:0 0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        }
        .sj-cs-item-value {
          font-size:14px;font-weight:700;
          color:rgba(248,242,228,0.95);margin:0;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        }
      `}</style>
    </div>
  )
}
