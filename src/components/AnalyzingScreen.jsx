import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TIPS = [
  '70% of cloud spend is wasted on idle resources.',
  'Right-sizing EC2 instances can cut costs by up to 40%.',
  'Reserved Instances save an average of 30–60% vs on-demand.',
  'S3 Intelligent-Tiering reduces storage costs automatically.',
  'NAT Gateway data transfer is one of the most overlooked costs.',
  'Lambda functions with high usage often cost less than EC2.',
  'Multi-region replication can silently double your S3 bill.',
  'Unused Elastic IPs cost money even when not attached.',
]

const STAGES = [
  { label: 'Reading service topology…',     pct: 12 },
  { label: 'Mapping spend distribution…',   pct: 28 },
  { label: 'Detecting idle resources…',     pct: 45 },
  { label: 'Running cost anomaly checks…',  pct: 62 },
  { label: 'Generating AI recommendations…',pct: 78 },
  { label: 'Finalising insights report…',   pct: 92 },
  { label: 'Analysis complete.',            pct: 100 },
]

export default function AnalyzingScreen({ onComplete }) {
  const [tipIdx,   setTipIdx]   = useState(0)
  const [stageIdx, setStageIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  // cycle tips every 3 s
  useEffect(() => {
    const id = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 3000)
    return () => clearInterval(id)
  }, [])

  // advance stages
  useEffect(() => {
    if (stageIdx >= STAGES.length - 1) return
    const delay = stageIdx === 0 ? 600 : 1400
    const id = setTimeout(() => setStageIdx((s) => s + 1), delay)
    return () => clearTimeout(id)
  }, [stageIdx])

  // smooth progress bar
  useEffect(() => {
    const target = STAGES[stageIdx].pct
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= target) { clearInterval(id); return target }
        return Math.min(p + 1, target)
      })
    }, 18)
    return () => clearInterval(id)
  }, [stageIdx])

  // fire onComplete when we hit 100
  useEffect(() => {
    if (progress === 100) {
      const id = setTimeout(() => onComplete && onComplete(), 900)
      return () => clearTimeout(id)
    }
  }, [progress, onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 px-6"
      style={{ backgroundColor: '#0a0f1e' }}
    >
      {/* ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(0,212,255,0.07) 0%, transparent 70%)',
        }}
      />

      {/* neural network */}
      <NeuralNetwork />

      {/* headline */}
      <div className="relative z-10 flex flex-col items-center gap-3 text-center max-w-lg">
        <motion.h2
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          Claude AI is analyzing your infrastructure…
        </motion.h2>

        {/* stage label */}
        <AnimatePresence mode="wait">
          <motion.p
            key={stageIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm"
            style={{ color: 'rgba(0,212,255,0.75)', fontFamily: "'Inter', sans-serif" }}
          >
            {STAGES[stageIdx].label}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* progress bar */}
      <div className="relative z-10 w-full max-w-md flex flex-col gap-2">
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
              boxShadow: '0 0 12px rgba(0,212,255,0.6)',
              transition: 'width 0.08s linear',
            }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Inter', sans-serif" }}>
            Processing
          </span>
          <span
            className="text-xs font-semibold tabular-nums"
            style={{ color: '#00d4ff', fontFamily: "'Inter', sans-serif" }}
          >
            {progress}%
          </span>
        </div>
      </div>

      {/* cycling tip */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl px-5 py-4"
        style={{
          background: 'rgba(0,212,255,0.05)',
          border: '1px solid rgba(0,212,255,0.15)',
          backdropFilter: 'blur(12px)',
          minHeight: '3.5rem',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={tipIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-sm text-center"
            style={{ color: 'rgba(255,255,255,0.55)', fontFamily: "'Inter', sans-serif" }}
          >
            <span style={{ color: '#00d4ff', fontWeight: 600 }}>💡 Did you know? </span>
            {TIPS[tipIdx]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ─── Neural Network SVG ─────────────────────────────────── */
const NODES = [
  // input layer
  { id: 0, x: 80,  y: 60  },
  { id: 1, x: 80,  y: 120 },
  { id: 2, x: 80,  y: 180 },
  // hidden layer 1
  { id: 3, x: 190, y: 40  },
  { id: 4, x: 190, y: 100 },
  { id: 5, x: 190, y: 160 },
  { id: 6, x: 190, y: 200 },
  // hidden layer 2
  { id: 7, x: 300, y: 60  },
  { id: 8, x: 300, y: 120 },
  { id: 9, x: 300, y: 180 },
  // output layer
  { id: 10, x: 400, y: 90  },
  { id: 11, x: 400, y: 150 },
]

const EDGES = [
  // input → h1
  [0,3],[0,4],[0,5],
  [1,3],[1,4],[1,5],[1,6],
  [2,4],[2,5],[2,6],
  // h1 → h2
  [3,7],[3,8],
  [4,7],[4,8],[4,9],
  [5,7],[5,8],[5,9],
  [6,8],[6,9],
  // h2 → output
  [7,10],[7,11],
  [8,10],[8,11],
  [9,10],[9,11],
]

function NeuralNetwork() {
  return (
    <div className="relative z-10" style={{ width: 480, height: 240 }}>
      <svg width="480" height="240" viewBox="0 0 480 240">
        <defs>
          <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
          </radialGradient>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="edgeGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* edges */}
        {EDGES.map(([a, b], i) => {
          const na = NODES[a], nb = NODES[b]
          return (
            <motion.line
              key={i}
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke="rgba(0,212,255,0.18)"
              strokeWidth="1"
              filter="url(#edgeGlow)"
              animate={{ opacity: [0.15, 0.55, 0.15] }}
              transition={{
                duration: 2 + (i % 5) * 0.4,
                repeat: Infinity,
                delay: (i % 7) * 0.2,
                ease: 'easeInOut',
              }}
            />
          )
        })}

        {/* pulse signals travelling along edges */}
        {EDGES.filter((_, i) => i % 3 === 0).map(([a, b], i) => {
          const na = NODES[a], nb = NODES[b]
          return (
            <motion.circle
              key={`pulse-${i}`}
              r="2.5"
              fill="#00d4ff"
              filter="url(#nodeGlow)"
              animate={{
                cx: [na.x, nb.x],
                cy: [na.y, nb.y],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.35,
                ease: 'easeInOut',
              }}
            />
          )
        })}

        {/* nodes */}
        {NODES.map((n, i) => (
          <motion.circle
            key={n.id}
            cx={n.x}
            cy={n.y}
            r="7"
            fill="url(#nodeGrad)"
            filter="url(#nodeGlow)"
            animate={{
              r: [6, 8, 6],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>
    </div>
  )
}
