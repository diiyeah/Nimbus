import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react'
import RippleButton from './ui/RippleButton'

export default function PreviewTable({ rows, fileName, warnings = [], onConfirm, onCancel }) {
  const total = rows.reduce((s, r) => s + r.cost, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-2xl flex flex-col gap-5"
    >
      {/* header */}
      <div className="flex items-center gap-3">
        <CheckCircle2
          size={22}
          style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 6px #00d4ff)' }}
        />
        <div>
          <p
            className="text-white font-semibold text-base"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {fileName}
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif" }}>
            {rows.length} service{rows.length !== 1 ? 's' : ''} parsed · ${total.toLocaleString()} total spend
          </p>
        </div>
      </div>

      {/* warnings */}
      {warnings.length > 0 && (
        <div
          className="rounded-xl px-4 py-3 flex flex-col gap-1"
          style={{
            background: 'rgba(251,191,36,0.07)',
            border: '1px solid rgba(251,191,36,0.25)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} style={{ color: '#fbbf24' }} />
            <span className="text-xs font-medium" style={{ color: '#fbbf24', fontFamily: "'Inter', sans-serif" }}>
              {warnings.length} row{warnings.length !== 1 ? 's' : ''} skipped
            </span>
          </div>
          {warnings.map((w, i) => (
            <p key={i} className="text-xs" style={{ color: 'rgba(251,191,36,0.7)', fontFamily: "'Inter', sans-serif" }}>
              {w}
            </p>
          ))}
        </div>
      )}

      {/* table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['#', 'Service', 'Spend ($)', 'Usage (%)'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'rgba(0,212,255,0.7)', fontFamily: "'Inter', sans-serif" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className="transition-colors duration-150"
                style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,212,255,0.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td className="px-5 py-3" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Inter', sans-serif" }}>
                  {i + 1}
                </td>
                <td className="px-5 py-3 font-medium text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {row.name}
                </td>
                <td className="px-5 py-3" style={{ color: '#00d4ff', fontFamily: "'Inter', sans-serif" }}>
                  ${row.cost.toLocaleString()}
                </td>
                <td className="px-5 py-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <UsageBadge value={row.usage} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors duration-150"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.55)',
            fontFamily: "'Inter', sans-serif",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          Upload Different File
        </button>

        <motion.button
          onClick={onConfirm}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex-[2] relative overflow-hidden rounded-xl py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2"          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))',
            border: '1px solid rgba(0,212,255,0.35)',
            boxShadow: '0 0 20px rgba(0,212,255,0.15)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Run Analysis
          <ArrowRight size={15} />
        </motion.button>
      </div>
    </motion.div>
  )
}

function UsageBadge({ value }) {
  const color =
    value >= 70 ? '#4ade80' :
    value >= 40 ? '#facc15' :
    '#f87171'

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 4px ${color}` }}
      />
      {value}%
    </span>
  )
}
