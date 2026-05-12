import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingDown, Zap, ChevronDown, ChevronUp } from 'lucide-react'

/* ─── severity config ────────────────────────────────────── */
const SEVERITY = {
  critical: { color: '#f87171', label: 'Critical', bg: 'rgba(248,113,113,0.08)' },
  high:     { color: '#fb923c', label: 'High',     bg: 'rgba(251,146,60,0.08)'  },
  medium:   { color: '#facc15', label: 'Medium',   bg: 'rgba(250,204,21,0.08)'  },
  low:      { color: '#4ade80', label: 'Low',      bg: 'rgba(74,222,128,0.08)'  },
}

/* ─── category config ────────────────────────────────────── */
const CATEGORY = {
  rightsizing:  { label: 'Rightsizing',   color: '#00d4ff' },
  reserved:     { label: 'Reserved',      color: '#a78bfa' },
  idle:         { label: 'Idle Resource', color: '#f87171' },
  storage:      { label: 'Storage',       color: '#34d399' },
  network:      { label: 'Network',       color: '#60a5fa' },
  architecture: { label: 'Architecture',  color: '#f472b6' },
}

/* ─── service icons (reuse same SVG set) ─────────────────── */
const SERVICE_ICONS = {
  EC2: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4M7 8h2v2H7zM11 8h2v2h-2zM15 8h2v2h-2z"/>
    </svg>
  ),
  RDS: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
    </svg>
  ),
  ElastiCache: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  EKS: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  ),
  S3: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/>
      <path d="M3 8l9 5 9-5M12 13v8"/>
    </svg>
  ),
  Lambda: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 20l4-8 4 8M10 12L8 4h2l2 5 2-5h2l-2 8"/>
    </svg>
  ),
  CloudFront: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 0 1 0 9z"/>
    </svg>
  ),
  'NAT Gateway': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
}

const DEFAULT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <path d="M9 9h6M9 12h6M9 15h4"/>
  </svg>
)

/* ─── single recommendation card ─────────────────────────── */
function RecommendationCard({ rec, index }) {
  const [expanded, setExpanded] = useState(false)
  const sev  = SEVERITY[rec.severity]  ?? SEVERITY.low
  const cat  = CATEGORY[rec.category]  ?? { label: rec.category, color: '#00d4ff' }
  const icon = SERVICE_ICONS[rec.service] ?? DEFAULT_ICON

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* colored left border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: sev.color, boxShadow: `0 0 12px ${sev.color}60` }}
      />

      <div className="pl-5 pr-5 py-4 flex flex-col gap-3">
        {/* top row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* service icon */}
            <div
              className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{
                background: `${sev.color}15`,
                border: `1px solid ${sev.color}30`,
                color: sev.color,
              }}
            >
              <div style={{ width: 18, height: 18 }}>{icon}</div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {rec.service}
                </span>
                {/* severity badge */}
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: sev.bg,
                    border: `1px solid ${sev.color}40`,
                    color: sev.color,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {sev.label}
                </span>
                {/* category badge */}
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: `${cat.color}12`,
                    border: `1px solid ${cat.color}30`,
                    color: cat.color,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {cat.label}
                </span>
              </div>
              {/* issue text */}
              <p
                className="text-sm mt-1 leading-snug"
                style={{ color: 'rgba(255,255,255,0.65)', fontFamily: "'Inter', sans-serif" }}
              >
                {rec.issue}
              </p>
            </div>
          </div>

          {/* savings badge */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{
                background: 'rgba(74,222,128,0.1)',
                border: '1px solid rgba(74,222,128,0.25)',
              }}
            >
              <TrendingDown size={13} style={{ color: '#4ade80' }} />
              <span
                className="text-sm font-bold"
                style={{ color: '#4ade80', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                ${rec.saving.toLocaleString()}
              </span>
              <span
                className="text-xs"
                style={{ color: 'rgba(74,222,128,0.6)', fontFamily: "'Inter', sans-serif" }}
              >
                /mo
              </span>
            </div>

            {/* expand toggle */}
            <button
              onClick={() => setExpanded((e) => !e)}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{
                color: expanded ? '#00d4ff' : 'rgba(255,255,255,0.3)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {expanded ? 'Hide' : 'Action'}
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>

        {/* expandable action row */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                style={{
                  background: 'rgba(0,212,255,0.05)',
                  border: '1px solid rgba(0,212,255,0.15)',
                }}
              >
                <Zap size={14} style={{ color: '#00d4ff', flexShrink: 0, marginTop: 2 }} />
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'Inter', sans-serif" }}
                >
                  {rec.action}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ─── sticky savings bar ─────────────────────────────────── */
function SavingsBar({ recommendations }) {
  const total    = recommendations.reduce((s, r) => s + r.saving, 0)
  const annual   = total * 12
  const critical = recommendations.filter((r) => r.severity === 'critical').length
  const high     = recommendations.filter((r) => r.severity === 'high').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="sticky bottom-0 lg:bottom-0 z-30 rounded-2xl lg:rounded-none px-5 py-4 mt-2"
      style={{
        background: 'rgba(10,15,30,0.92)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(0,212,255,0.12)',
        border: '1px solid rgba(0,212,255,0.15)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        {/* left: counts */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: '#f87171', boxShadow: '0 0 6px #f87171' }}
            />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', sans-serif" }}>
              {critical} Critical
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: '#fb923c', boxShadow: '0 0 6px #fb923c' }}
            />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', sans-serif" }}>
              {high} High
            </span>
          </div>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Inter', sans-serif" }}>
            {recommendations.length} total recommendations
          </span>
        </div>

        {/* right: savings */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif" }}>
              Monthly savings
            </p>
            <p
              className="text-xl font-bold"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                background: 'linear-gradient(90deg, #4ade80, #00d4ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ${total.toLocaleString()}
            </p>
          </div>
          <div
            className="w-px h-8 self-center"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          />
          <div className="text-right">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif" }}>
              Annual savings
            </p>
            <p
              className="text-xl font-bold"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                background: 'linear-gradient(90deg, #a78bfa, #00d4ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ${annual.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── main export ────────────────────────────────────────── */
export default function RecommendationCards({ recommendations }) {
  if (!recommendations?.length) return null

  return (
    <div className="flex flex-col gap-4">
      {/* section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-lg font-semibold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            AI Recommendations
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', sans-serif" }}
          >
            Generated by Claude AI · sorted by potential savings
          </p>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.25)',
            color: '#4ade80',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {recommendations.length} insights
        </span>
      </div>

      {/* cards — stagger bottom to top (reverse order for visual effect) */}
      <div className="flex flex-col gap-3">
        {recommendations.map((rec, i) => (
          <RecommendationCard key={`${rec.service}-${i}`} rec={rec} index={i} />
        ))}
      </div>

      {/* sticky savings bar */}
      <SavingsBar recommendations={recommendations} />
    </div>
  )
}
