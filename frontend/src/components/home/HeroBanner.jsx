// frontend/src/components/home/HeroBanner.jsx
//
// Full-width immersive hero banner matching the design spec:
// - Deep indigo/purple gradient background spanning full width
// - User avatar photo (left) with gold ring
// - "Namaste, [Name] 🙏" large serif heading
// - Birth date · time · place one-liner
// - 4 colored pill tags: Lagna, Rashi, Mahadasha, Antardasha with icons
// - Glowing zodiac wheel SVG (right side, desktop only)
// - Desktop: side-by-side layout. Mobile: stacked, wheel hidden

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatDate, formatTime } from '../../utils/format'

// Zodiac sign symbols
const SIGN_GLYPHS = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
}

// Pill accent colors per field
const TAG_STYLES = {
  lagna:       { bg: 'rgba(180,140,50,0.25)',  border: 'rgba(217,164,65,0.5)',  text: '#F0CB80', icon: '♑' },
  rashi:       { bg: 'rgba(120,90,180,0.25)',  border: 'rgba(160,130,220,0.5)', text: '#C4AAEE', icon: '☽' },
  mahadasha:   { bg: 'rgba(180,60,60,0.25)',   border: 'rgba(220,100,100,0.5)', text: '#F0A0A0', icon: '🔥' },
  antardasha:  { bg: 'rgba(50,130,90,0.25)',   border: 'rgba(90,180,130,0.5)', text: '#90D4B0', icon: '✦' },
}

// Minimal zodiac wheel SVG — 12 sign glyphs on a circle with central star
function ZodiacWheelSVG() {
  const signs = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']
  const R = 130, r = 100, cx = 150, cy = 150
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" aria-hidden="true"
         style={{ opacity: 0.85 }}>
      <defs>
        <radialGradient id="wg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D9A441" stopOpacity="0.35"/>
          <stop offset="60%" stopColor="#8060C0" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#171B33" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="cg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F0CB80" stopOpacity="1"/>
          <stop offset="100%" stopColor="#D9A441" stopOpacity="0.6"/>
        </radialGradient>
      </defs>
      {/* Glow background */}
      <circle cx={cx} cy={cy} r={R+10} fill="url(#wg)"/>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(217,164,65,0.3)" strokeWidth="1"/>
      {/* Inner ring */}
      <circle cx={cx} cy={cy} r={r-20} fill="none" stroke="rgba(217,164,65,0.15)" strokeWidth="1"/>
      {/* Spokes */}
      {signs.map((_, i) => {
        const a = (i * 30 - 90) * Math.PI / 180
        return <line key={i}
          x1={cx + Math.cos(a) * (r-20)} y1={cy + Math.sin(a) * (r-20)}
          x2={cx + Math.cos(a) * R}      y2={cy + Math.sin(a) * R}
          stroke="rgba(217,164,65,0.2)" strokeWidth="0.5"/>
      })}
      {/* Sign glyphs */}
      {signs.map((g, i) => {
        const a = (i * 30 - 75) * Math.PI / 180
        const sx = cx + Math.cos(a) * (r + 16)
        const sy = cy + Math.sin(a) * (r + 16)
        return <text key={i} x={sx} y={sy} textAnchor="middle" dominantBaseline="middle"
          fontSize="14" fill="rgba(240,203,128,0.75)" fontFamily="Georgia,serif">{g}</text>
      })}
      {/* Central star */}
      <circle cx={cx} cy={cy} r={22} fill="rgba(217,164,65,0.12)" stroke="rgba(217,164,65,0.4)" strokeWidth="1"/>
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fontSize="22" fill="url(#cg)" fontFamily="Georgia,serif">✦</text>
      {/* Crescent moon top-right */}
      <text x={cx+98} y={cy-75} fontSize="28" fill="rgba(240,203,128,0.6)" fontFamily="Georgia,serif">☽</text>
    </svg>
  )
}

export default function HeroBanner({ profile, user, onOpenChart }) {
  const { t } = useTranslation()
  if (!profile) return null

  const { chart } = profile
  const moon = chart.planets.find(p => p.name === 'Moon')
  const md   = chart.dasha.current_mahadasha
  const ad   = chart.dasha.current_antardasha
  const firstName = profile.label?.split(' ')[0] ?? profile.label

  const lagnaSign = chart.ascendant.sign
  const rashiSign = moon?.sign ?? '—'
  const lagnaGlyph = SIGN_GLYPHS[lagnaSign] || '♑'
  const rashiGlyph = SIGN_GLYPHS[rashiSign] || '☽'

  const avatarUrl = user?.avatar_url ?? null

  return (
    <div className="sj-hero-banner">
      {/* Starfield layer */}
      <div className="sj-hb-stars" aria-hidden="true">
        {Array.from({length:25},(_,i)=>{
          const h=(i*2654435761)%1000
          return <span key={i} className="sj-hb-star" style={{
            left:`${h%100}%`, top:`${((h>>3)%85)+5}%`,
            width: i%5===0?2.2:i%3===0?1.5:1,
            height: i%5===0?2.2:i%3===0?1.5:1,
            animationDuration:`${4+(i%5)*1.8}s`,
            animationDelay:`${(i%9)*0.6}s`,
          }}/>
        })}
      </div>

      <div className="sj-hb-inner">
        {/* Left: avatar + text */}
        <div className="sj-hb-left">
          {/* Avatar */}
          <div className="sj-hb-avatar-wrap">
            {avatarUrl ? (
              <img src={avatarUrl} alt={profile.label} className="sj-hb-avatar-img"/>
            ) : (
              <div className="sj-hb-avatar-placeholder">
                <span style={{fontSize:28,color:'rgba(240,203,128,0.6)'}}>
                  {lagnaGlyph}
                </span>
              </div>
            )}
            <span className="sj-hb-edit-btn" aria-label="Edit profile">✎</span>
          </div>

          {/* Name + tagline */}
          <div className="sj-hb-nameblock">
            <h1 className="sj-hb-namaste">
              Namaste, <span className="sj-hb-firstname">{firstName}</span> 🙏
            </h1>
            <p className="sj-hb-tagline">Your cosmic journey begins here ✨</p>
            <p className="sj-hb-birthinfo">
              📅 {formatDate(profile.birth_date)}
              <span className="sj-hb-sep">·</span>
              🕐 {formatTime(profile.birth_time)}
              <span className="sj-hb-sep">·</span>
              📍 {profile.place}
            </p>
          </div>

          {/* 4 pill tags */}
          <div className="sj-hb-tags">
            <div className="sj-hb-tag" style={{
              background: TAG_STYLES.lagna.bg,
              border: `1px solid ${TAG_STYLES.lagna.border}`,
            }}>
              <span className="sj-hb-tag-icon" style={{color: TAG_STYLES.lagna.text}}>{lagnaGlyph}</span>
              <div>
                <p className="sj-hb-tag-label">Lagna</p>
                <p className="sj-hb-tag-value" style={{color: TAG_STYLES.lagna.text}}>
                  {lagnaSign}
                </p>
              </div>
            </div>

            <div className="sj-hb-tag" style={{
              background: TAG_STYLES.rashi.bg,
              border: `1px solid ${TAG_STYLES.rashi.border}`,
            }}>
              <span className="sj-hb-tag-icon" style={{color: TAG_STYLES.rashi.text}}>{rashiGlyph}</span>
              <div>
                <p className="sj-hb-tag-label">Rashi</p>
                <p className="sj-hb-tag-value" style={{color: TAG_STYLES.rashi.text}}>
                  {rashiSign}
                </p>
              </div>
            </div>

            <div className="sj-hb-tag" style={{
              background: TAG_STYLES.mahadasha.bg,
              border: `1px solid ${TAG_STYLES.mahadasha.border}`,
            }}>
              <span className="sj-hb-tag-icon" style={{color: TAG_STYLES.mahadasha.text}}>⟳</span>
              <div>
                <p className="sj-hb-tag-label">Mahadasha</p>
                <p className="sj-hb-tag-value" style={{color: TAG_STYLES.mahadasha.text}}>
                  {md?.planet} (Saturn)
                </p>
              </div>
            </div>

            {ad && (
              <div className="sj-hb-tag" style={{
                background: TAG_STYLES.antardasha.bg,
                border: `1px solid ${TAG_STYLES.antardasha.border}`,
              }}>
                <span className="sj-hb-tag-icon" style={{color: TAG_STYLES.antardasha.text}}>✦</span>
                <div>
                  <p className="sj-hb-tag-label">Antardasha</p>
                  <p className="sj-hb-tag-value" style={{color: TAG_STYLES.antardasha.text}}>
                    {ad?.planet} (Mercury)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="sj-hb-actions">
            <button onClick={() => onOpenChart?.('birth_chart','kundli')} className="sj-hb-btn-primary">
              Full Chart & Analysis →
            </button>
            <Link to="/onboarding" state={{addAnother:true}} className="sj-hb-btn-ghost">
              + Add another chart
            </Link>
          </div>
        </div>

        {/* Right: zodiac wheel (desktop only) */}
        <div className="sj-hb-wheel" aria-hidden="true">
          <ZodiacWheelSVG />
        </div>
      </div>

      <style>{`
        .sj-hero-banner {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #1a1635 0%, #2d1f5e 30%, #1e1545 60%, #0f0d24 100%);
          width: 100%;
          /* Extend edge-to-edge outside the content container */
        }
        .sj-hb-stars { position:absolute;inset:0;pointer-events:none; }
        .sj-hb-star {
          position:absolute;border-radius:50%;
          background:rgba(240,203,128,0.9);
          animation: sj-hb-twinkle linear infinite;
        }
        @keyframes sj-hb-twinkle {
          0%,100%{opacity:0.08;transform:scale(1)}
          50%{opacity:0.9;transform:scale(1.15)}
        }

        .sj-hb-inner {
          position: relative;
          max-width: 1152px;
          margin: 0 auto;
          padding: 36px 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        @media(min-width:640px){
          .sj-hb-inner { padding: 44px 32px 40px; }
        }

        .sj-hb-left {
          display: flex;
          flex-direction: column;
          gap: 18px;
          flex: 1;
          min-width: 0;
        }

        /* Avatar */
        .sj-hb-avatar-wrap {
          position: relative;
          width: 88px; height: 88px;
          border-radius: 50%;
          border: 3px solid rgba(217,164,65,0.7);
          box-shadow: 0 0 24px rgba(217,164,65,0.3), 0 0 0 6px rgba(217,164,65,0.08);
          flex-shrink: 0;
        }
        .sj-hb-avatar-img {
          width:100%;height:100%;border-radius:50%;object-fit:cover;
        }
        .sj-hb-avatar-placeholder {
          width:100%;height:100%;border-radius:50%;
          background: rgba(40,35,80,0.8);
          display:flex;align-items:center;justify-content:center;
        }
        .sj-hb-edit-btn {
          position:absolute;bottom:2px;right:2px;
          width:24px;height:24px;border-radius:50%;
          background:#D9A441;color:#0f0d24;
          display:flex;align-items:center;justify-content:center;
          font-size:12px;cursor:pointer;
        }

        /* Name block */
        .sj-hb-namaste {
          font-family: Fraunces, Georgia, serif;
          font-size: clamp(24px, 4.5vw, 38px);
          font-weight: 600;
          color: rgba(248,242,228,0.97);
          line-height: 1.15;
          margin: 0;
        }
        .sj-hb-firstname { color: #F0CB80; }
        .sj-hb-tagline {
          font-size: clamp(12px,2vw,14px);
          color: rgba(248,242,228,0.5);
          margin: 4px 0 0;
        }
        .sj-hb-birthinfo {
          font-size: clamp(11px,1.8vw,13px);
          color: rgba(248,242,228,0.55);
          margin: 6px 0 0;
          display: flex; flex-wrap: wrap; gap: 4px; align-items: center;
        }
        .sj-hb-sep { color: rgba(248,242,228,0.25); margin: 0 2px; }

        /* Tags */
        .sj-hb-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .sj-hb-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 12px;
          cursor: default;
        }
        .sj-hb-tag-icon { font-size: 18px; flex-shrink: 0; }
        .sj-hb-tag-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(248,242,228,0.45);
          margin: 0;
          line-height: 1;
        }
        .sj-hb-tag-value {
          font-size: 13px;
          font-weight: 700;
          margin: 2px 0 0;
          line-height: 1;
        }

        /* Actions */
        .sj-hb-actions { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
        .sj-hb-btn-primary {
          background: rgba(217,164,65,0.9);
          color: #0f0d24;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 20px;
          border-radius: 99px;
          border: none;
          cursor: pointer;
          transition: all 160ms;
          text-decoration: none;
          display: inline-block;
        }
        .sj-hb-btn-primary:hover { background: #F0CB80; }
        .sj-hb-btn-ghost {
          color: rgba(248,242,228,0.55);
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          padding: 8px 4px;
          transition: color 160ms;
        }
        .sj-hb-btn-ghost:hover { color: rgba(248,242,228,0.85); }

        /* Zodiac wheel — hide on small screens */
        .sj-hb-wheel { display:none; }
        @media(min-width:768px){ .sj-hb-wheel { display:block; flex-shrink:0; } }

        /* Mobile: avatar + name side by side */
        .sj-hb-nameblock { flex:1; }
        @media(max-width:479px){
          .sj-hb-left { flex-direction:column; }
          .sj-hb-avatar-wrap { width:72px; height:72px; }
          .sj-hb-tag { padding:6px 10px; }
          .sj-hb-tag-value { font-size:12px; }
        }
      `}</style>
    </div>
  )
}
