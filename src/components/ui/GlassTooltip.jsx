import { motion } from 'framer-motion'

/**
 * Reusable dark glassmorphism tooltip for Recharts.
 * Usage: <Tooltip content={<GlassTooltip formatter={(val, name) => [...]} />} />
 */
export default function GlassTooltip({ active, payload, label, formatter, labelFormatter }) {
  if (!active || !payload?.length) return null

  const displayLabel = labelFormatter ? labelFormatter(label) : label

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="rounded-xl px-4 py-3 flex flex-col gap-1.5"
      style={{
        background: 'rgba(8,12,24,0.92)',
        border: '1px solid rgba(0,212,255,0.2)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.08)',
        fontFamily: "'Inter', sans-serif",
        minWidth: 120,
      }}
    >
      {displayLabel && (
        <p className="text-xs font-medium pb-1" style={{ color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {displayLabel}
        </p>
      )}
      {payload.map((entry, i) => {
        const [value, name] = formatter
          ? formatter(entry.value, entry.name, entry)
          : [entry.value, entry.name]
        return (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: entry.color ?? entry.stroke ?? '#00d4ff', boxShadow: `0 0 4px ${entry.color ?? '#00d4ff'}` }}
            />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{name}</span>
            <span className="text-sm font-semibold ml-auto" style={{ color: entry.color ?? entry.stroke ?? '#00d4ff' }}>
              {value}
            </span>
          </div>
        )
      })}
    </motion.div>
  )
}
