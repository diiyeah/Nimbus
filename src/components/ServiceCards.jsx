import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

/* ─── service → icon mapping (inline SVG paths) ─────────── */
const SERVICE_ICONS = {
  EC2: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
      <path d="M7 8h2v2H7zM11 8h2v2h-2zM15 8h2v2h-2z"/>
    </svg>
  ),
  RDS: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
    </svg>
  ),
  ElastiCache: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  EKS: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  ),
  S3: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/>
      <path d="M3 8l9 5 9-5M12 13v8"/>
    </svg>
  ),
  Lambda: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 20l4-8 4 8M10 12L8 4h2l2 5 2-5h2l-2 8"/>
    </svg>
  ),
  CloudFront: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 0 1 0 9z"/>
    </svg>
  ),
  'NAT Gateway': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
}

const DEFAULT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <path d="M9 9h6M9 12h6M9 15h4"/>
  </svg>
)

/* ─── waste badge config ─────────────────────────────────── */
function wasteBadge(usage) {
  // waste = inverse of utilisation: low usage = high waste
  if (usage < 30) return { label: 'High Waste',  color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' }
  if (usage < 60) return { label: 'Med Waste',   color: '#facc15', bg: 'rgba(250,204,21,0.1)',   border: 'rgba(250,204,21,0.3)'  }
  return              { label: 'Efficient',      color: '#4ade80', bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.3)'  }
}

/* ─── animated SVG ring ──────────────────────────────────── */
function UsageRing({ usage, color, size = 64 }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const [offset, setOffset] = useState(circ)

  useEffect(() => {
    const target = circ * (1 - usage / 100)
    const timeout = setTimeout(() => setOffset(target), 120)
    return () => clearTimeout(timeout)
  }, [usage, circ])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {/* track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="5"
      />
      {/* progress */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)',
          filter: `drop-shadow(0 0 4px ${color})`,
        }}
      />
      {/* center text — counter-rotate */}
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          transform: `rotate(90deg)`,
          transformOrigin: `${size / 2}px ${size / 2}px`,
          fill: color,
          fontSize: size * 0.22,
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {usage}%
      </text>
    </svg>
  )
}

/* ─── single service card ────────────────────────────────── */
function ServiceCard({ service, index }) {
  const badge = wasteBadge(service.usage)
  const icon  = SERVICE_ICONS[service.name] ?? DEFAULT_ICON

  // ring color matches badge
  const ringColor = badge.color

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -6,
        boxShadow: `0 16px 48px rgba(0,212,255,0.12), 0 0 0 1px rgba(0,212,255,0.2)`,
      }}
      className="relative rounded-2xl p-5 flex flex-col gap-4 cursor-default overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(18px)',
        transition: 'box-shadow 0.25s ease',
      }}
    >
      {/* ambient corner glow on hover — always rendered, opacity via motion */}
      <div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${ringColor}20 0%, transparent 70%)`,
          filter: 'blur(16px)',
        }}
      />

      {/* top row: icon + badge */}
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.18)',
            color: '#00d4ff',
          }}
        >
          <div style={{ width: 20, height: 20 }}>{icon}</div>
        </div>

        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: badge.bg,
            border: `1px solid ${badge.border}`,
            color: badge.color,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {badge.label}
        </span>
      </div>

      {/* service name + spend */}
      <div>
        <p
          className="text-sm font-semibold text-white leading-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {service.name}
        </p>
        <p
          className="text-xl font-bold mt-0.5"
          style={{ color: '#00d4ff', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          ${service.cost.toLocaleString()}
          <span className="text-xs font-normal ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            /mo
          </span>
        </p>
      </div>

      {/* usage ring + label */}
      <div className="flex items-center gap-4">
        <UsageRing usage={service.usage} color={ringColor} size={60} />
        <div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif" }}>
            Utilisation
          </p>
          <p
            className="text-sm font-semibold"
            style={{ color: ringColor, fontFamily: "'Inter', sans-serif" }}
          >
            {service.usage}% active
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── grid of cards ──────────────────────────────────────── */
export default function ServiceCards({ rows }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2
          className="text-lg font-semibold text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Services
        </h2>
        <span
          className="text-xs px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.18)',
            color: 'rgba(0,212,255,0.8)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {rows.length} services
        </span>
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
      >
        {rows.map((service, i) => (
          <ServiceCard key={service.name} service={service} index={i} />
        ))}
      </div>
    </div>
  )
}
