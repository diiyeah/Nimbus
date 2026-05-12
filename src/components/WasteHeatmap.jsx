import { motion } from 'framer-motion'

/* ─── waste = inverse of utilisation ────────────────────── */
function wastePercent(usage) {
  return 100 - usage
}

function wasteLevel(waste) {
  if (waste >= 70) return 'high'
  if (waste >= 40) return 'medium'
  return 'low'
}

const LEVEL_CONFIG = {
  low: {
    label:      'Low Waste',
    color:      '#4ade80',
    bg:         'rgba(74,222,128,0.12)',
    border:     'rgba(74,222,128,0.3)',
    glow:       'rgba(74,222,128,0.25)',
    textColor:  '#4ade80',
  },
  medium: {
    label:      'Medium Waste',
    color:      '#facc15',
    bg:         'rgba(250,204,21,0.12)',
    border:     'rgba(250,204,21,0.3)',
    glow:       'rgba(250,204,21,0.2)',
    textColor:  '#facc15',
  },
  high: {
    label:      'High Waste',
    color:      '#f87171',
    bg:         'rgba(248,113,113,0.12)',
    border:     'rgba(248,113,113,0.3)',
    glow:       'rgba(248,113,113,0.25)',
    textColor:  '#f87171',
  },
}

/* ─── single heatmap cell ────────────────────────────────── */
function HeatCell({ service, index }) {
  const waste  = wastePercent(service.usage)
  const level  = wasteLevel(waste)
  const config = LEVEL_CONFIG[level]

  // bar fill width based on waste %
  const barWidth = `${waste}%`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        scale: 1.04,
        boxShadow: `0 8px 32px ${config.glow}, 0 0 0 1px ${config.border}`,
        zIndex: 10,
      }}
      className="relative rounded-2xl p-4 flex flex-col gap-3 overflow-hidden cursor-default"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* top-right glow blob */}
      <div
        className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${config.color}30 0%, transparent 70%)`,
          filter: 'blur(10px)',
        }}
      />

      {/* service name */}
      <p
        className="text-sm font-semibold text-white leading-tight z-10"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {service.name}
      </p>

      {/* waste % big number */}
      <div className="z-10">
        <span
          className="text-3xl font-bold tabular-nums leading-none"
          style={{ color: config.color, fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {waste}
        </span>
        <span
          className="text-sm font-semibold ml-0.5"
          style={{ color: config.color, fontFamily: "'Space Grotesk', sans-serif" }}
        >
          %
        </span>
        <p
          className="text-xs mt-0.5"
          style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif" }}
        >
          waste · {service.usage}% utilised
        </p>
      </div>

      {/* animated waste bar */}
      <div
        className="relative w-full h-1.5 rounded-full overflow-hidden z-10"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: barWidth }}
          transition={{ duration: 0.9, delay: index * 0.06 + 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`,
            boxShadow: `0 0 8px ${config.color}60`,
          }}
        />
      </div>

      {/* level badge */}
      <span
        className="self-start text-xs font-medium px-2 py-0.5 rounded-full z-10"
        style={{
          background: `${config.color}18`,
          border: `1px solid ${config.color}35`,
          color: config.color,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {config.label}
      </span>
    </motion.div>
  )
}

/* ─── legend ─────────────────────────────────────────────── */
function Legend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="flex items-center gap-6 flex-wrap"
    >
      <span
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Inter', sans-serif" }}
      >
        Waste Level
      </span>

      {Object.entries(LEVEL_CONFIG).map(([key, cfg]) => (
        <div key={key} className="flex items-center gap-2">
          {/* gradient swatch */}
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-sm"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                boxShadow: `0 0 6px ${cfg.glow}`,
              }}
            />
            <div
              className="w-8 h-1.5 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${cfg.color}30, ${cfg.color})`,
              }}
            />
          </div>
          <span
            className="text-xs"
            style={{ color: cfg.color, fontFamily: "'Inter', sans-serif" }}
          >
            {cfg.label}
          </span>
          <span
            className="text-xs"
            style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Inter', sans-serif" }}
          >
            {key === 'low' ? '(≥60% util)' : key === 'medium' ? '(30–60% util)' : '(<30% util)'}
          </span>
        </div>
      ))}
    </motion.div>
  )
}

/* ─── main export ────────────────────────────────────────── */
export default function WasteHeatmap({ rows }) {
  // sort by waste descending so worst offenders appear first
  const sorted = [...rows].sort((a, b) => wastePercent(b.usage) - wastePercent(a.usage))

  const highCount   = sorted.filter(r => wasteLevel(wastePercent(r.usage)) === 'high').length
  const medCount    = sorted.filter(r => wasteLevel(wastePercent(r.usage)) === 'medium').length
  const lowCount    = sorted.filter(r => wasteLevel(wastePercent(r.usage)) === 'low').length

  return (
    <div className="flex flex-col gap-5">
      {/* section header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2
            className="text-lg font-semibold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Waste Heatmap
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', sans-serif" }}
          >
            Sorted by waste percentage — highest first
          </p>
        </div>

        {/* summary pills */}
        <div className="flex items-center gap-2">
          {highCount > 0 && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.25)',
                color: '#f87171',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {highCount} High
            </span>
          )}
          {medCount > 0 && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                background: 'rgba(250,204,21,0.1)',
                border: '1px solid rgba(250,204,21,0.25)',
                color: '#facc15',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {medCount} Medium
            </span>
          )}
          {lowCount > 0 && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                background: 'rgba(74,222,128,0.1)',
                border: '1px solid rgba(74,222,128,0.25)',
                color: '#4ade80',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {lowCount} Low
            </span>
          )}
        </div>
      </div>

      {/* heatmap grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
      >
        {sorted.map((service, i) => (
          <HeatCell key={service.name} service={service} index={i} />
        ))}
      </div>

      {/* legend */}
      <Legend />
    </div>
  )
}
