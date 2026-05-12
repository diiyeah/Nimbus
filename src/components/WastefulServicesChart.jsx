import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import GlassTooltip from './ui/GlassTooltip'

/* Pick top 5 services by cost, sorted descending */
function buildBarData(rows) {
  return [...rows]
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5)
    .map((r) => ({ name: r.name, cost: r.cost, usage: r.usage }))
}

/* Color per bar — gradient from cyan to violet across the 5 bars */
const BAR_COLORS = ['#00d4ff', '#22c5f5', '#6b7ff0', '#9b6be8', '#a78bfa']

// Remove old CustomTooltip — now using GlassTooltip

/* Custom bar shape with rounded right corners */
const RoundedBar = (props) => {
  const { x, y, width, height, fill } = props
  if (!height || height <= 0) return null
  const r = 4
  return (
    <path
      d={`
        M${x},${y + height}
        L${x},${y + r}
        Q${x},${y} ${x + r},${y}
        L${x + width - r},${y}
        Q${x + width},${y} ${x + width},${y + r}
        L${x + width},${y + height}
        Z
      `}
      fill={fill}
      opacity={0.9}
    />
  )
}

export default function WastefulServicesChart({ rows }) {
  const data = buildBarData(rows)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
        minWidth: 0,
      }}
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h3
            className="text-sm font-semibold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Top 5 Costliest Services
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', sans-serif" }}>
            Monthly spend by service
          </p>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.25)',
            color: '#a78bfa',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Top 5
        </span>
      </div>

      {/* chart */}
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
            barCategoryGap="28%"
          >
            <defs>
              {BAR_COLORS.map((color, i) => (
                <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor={color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.5} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              horizontal={false}
            />

            <XAxis
              type="number"
              tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />

            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11, fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              content={
                <GlassTooltip
                  formatter={(val, name, entry) => [
                    `$${val.toLocaleString()} · ${entry.payload.usage}% util`,
                    entry.payload.name,
                  ]}
                />
              }
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />

            <Bar
              dataKey="cost"
              shape={<RoundedBar />}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={`url(#barGrad${i})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
