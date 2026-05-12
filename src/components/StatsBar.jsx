import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingDown, Server, Activity } from 'lucide-react'

/* ─── count-up hook ──────────────────────────────────────── */
function useCountUp(target, duration = 1600, delay = 0) {
  const [value, setValue] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    let start = null
    const startTime = performance.now() + delay

    const step = (now) => {
      if (now < startTime) { raf.current = requestAnimationFrame(step); return }
      if (!start) start = now
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }

    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration, delay])

  return value
}

/* ─── individual card ────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, prefix, suffix, gradient, glowColor, delay, index }) {
  const animated = useCountUp(value, 1800, delay)

  const formatted =
    value >= 1000
      ? animated.toLocaleString()
      : animated.toString()

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex-1 min-w-0 rounded-2xl p-5 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* top-right ambient glow */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${glowColor}30 0%, transparent 70%)`,
          filter: 'blur(12px)',
        }}
      />

      {/* gradient top border line */}
      <div
        className="absolute top-0 left-4 right-4 h-px rounded-full"
        style={{ background: gradient }}
      />

      {/* icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: `${glowColor}18`,
          border: `1px solid ${glowColor}35`,
        }}
      >
        <Icon size={17} style={{ color: glowColor, filter: `drop-shadow(0 0 5px ${glowColor})` }} />
      </div>

      {/* number */}
      <div className="flex items-end gap-0.5 mb-1">
        {prefix && (
          <span
            className="text-lg font-semibold mb-0.5"
            style={{ color: glowColor, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {prefix}
          </span>
        )}
        <span
          className="text-3xl font-bold text-white tabular-nums leading-none"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {formatted}
        </span>
        {suffix && (
          <span
            className="text-lg font-semibold mb-0.5"
            style={{ color: glowColor, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {suffix}
          </span>
        )}
      </div>

      {/* label */}
      <p
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif" }}
      >
        {label}
      </p>
    </motion.div>
  )
}

/* ─── stats bar ──────────────────────────────────────────── */
export default function StatsBar({ rows, recommendations }) {
  const totalSpend    = rows.reduce((s, r) => s + r.cost, 0)
  const potentialSave = recommendations
    ? recommendations.reduce((s, r) => s + (r.saving ?? 0), 0)
    : Math.round(totalSpend * 0.31)          // fallback estimate
  const servicesCount = rows.length
  const avgUtil       = Math.round(rows.reduce((s, r) => s + r.usage, 0) / rows.length)

  const cards = [
    {
      icon:      DollarSign,
      label:     'Total Monthly Spend',
      value:     totalSpend,
      prefix:    '$',
      gradient:  'linear-gradient(90deg, #00d4ff, transparent)',
      glowColor: '#00d4ff',
    },
    {
      icon:      TrendingDown,
      label:     'Potential Savings',
      value:     potentialSave,
      prefix:    '$',
      gradient:  'linear-gradient(90deg, #7c3aed, transparent)',
      glowColor: '#a78bfa',
    },
    {
      icon:      Server,
      label:     'Services Analyzed',
      value:     servicesCount,
      gradient:  'linear-gradient(90deg, #06b6d4, transparent)',
      glowColor: '#22d3ee',
    },
    {
      icon:      Activity,
      label:     'Average Utilization',
      value:     avgUtil,
      suffix:    '%',
      gradient:  'linear-gradient(90deg, #8b5cf6, transparent)',
      glowColor: '#8b5cf6',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:flex gap-4 w-full">
      {cards.map((card, i) => (
        <StatCard key={card.label} {...card} index={i} delay={i * 120} />
      ))}
    </div>
  )
}
