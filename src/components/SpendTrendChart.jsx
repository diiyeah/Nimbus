import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import GlassTooltip from './ui/GlassTooltip'

/* Generate 6-month simulated trend ending at current total spend */
function buildTrendData(rows) {
  const total = rows.reduce((s, r) => s + r.cost, 0)
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']
  // gentle upward curve ending at total
  const factors = [0.72, 0.78, 0.84, 0.91, 0.96, 1.0]
  return months.map((month, i) => ({
    month,
    spend: Math.round(total * factors[i]),
  }))
}

// Remove old CustomTooltip — now using GlassTooltip

export default function SpendTrendChart({ rows }) {
  const data = buildTrendData(rows)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
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
            Monthly Spend Trend
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', sans-serif" }}>
            Last 6 months
          </p>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.2)',
            color: '#00d4ff',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          +38% YoY
        </span>
      </div>

      {/* chart */}
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#00d4ff" stopOpacity={0.35} />
                <stop offset="60%"  stopColor="#7c3aed" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />

            <Tooltip
              content={
                <GlassTooltip
                  formatter={(val) => [`$${val.toLocaleString()}`, 'Spend']}
                />
              }
              cursor={{ stroke: 'rgba(0,212,255,0.2)', strokeWidth: 1 }}
            />

            <Area
              type="monotone"
              dataKey="spend"
              stroke="#00d4ff"
              strokeWidth={2}
              fill="url(#spendGrad)"
              dot={{ fill: '#00d4ff', r: 3, strokeWidth: 0 }}
              activeDot={{
                r: 5,
                fill: '#00d4ff',
                stroke: 'rgba(0,212,255,0.3)',
                strokeWidth: 4,
              }}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
