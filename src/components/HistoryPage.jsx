import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Trash2, TrendingDown, DollarSign,
  Lightbulb, AlertCircle, RefreshCw, ArrowRight,
} from 'lucide-react'
import { getHistory, deleteAnalysis } from '../utils/api'
import { SkeletonBlock } from './ui/Skeleton'

/* ── skeleton cards ──────────────────────────────────────────────────────── */
function HistorySkeleton() {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex justify-between items-start">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="w-8 h-8 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="rounded-xl p-3 flex flex-col gap-1.5"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <SkeletonBlock className="h-3 w-16" />
                <SkeletonBlock className="h-5 w-20" />
              </div>
            ))}
          </div>
          <SkeletonBlock className="h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}

/* ── stat mini-card inside history card ──────────────────────────────────── */
function StatMini({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl p-3 flex flex-col gap-1"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-1.5">
        <Icon size={11} style={{ color, flexShrink: 0 }} />
        <span className="text-xs uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', sans-serif", fontSize: 10 }}>
          {label}
        </span>
      </div>
      <p className="text-sm font-bold leading-tight" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>
        {value}
      </p>
    </div>
  )
}

/* ── single history card ─────────────────────────────────────────────────── */
function HistoryCard({ item, index, onDelete, onSelect }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Delete this analysis? This cannot be undone.')) return
    setDeleting(true)
    try {
      await deleteAnalysis(item.id)
      onDelete(item.id)
    } catch (err) {
      alert(err.message)
      setDeleting(false)
    }
  }

  const date = item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : '—'

  const time = item.created_at
    ? new Date(item.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit',
      })
    : ''

  const totalSpend   = item.rows?.reduce((s, r) => s + (r.cost ?? 0), 0) ?? 0
  const totalSaving  = item.total_saving ?? 0
  const annualSaving = item.annual_saving ?? totalSaving * 12
  const recCount     = item.recommendations?.length ?? 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: deleting ? 0.4 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl p-5 flex flex-col gap-4 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* gradient top border */}
      <div className="absolute top-0 left-4 right-4 h-px rounded-full"
        style={{ background: 'linear-gradient(90deg, #00d4ff40, #7c3aed40)' }} />

      {/* header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {item.filename || 'Analysis'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Clock size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', sans-serif" }}>
              {date}{time ? ` · ${time}` : ''}
            </span>
          </div>
        </div>

        {/* delete button */}
        <motion.button
          onClick={handleDelete}
          disabled={deleting}
          whileTap={{ scale: 0.88 }}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ color: 'rgba(248,113,113,0.45)', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.14)'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.06)'; e.currentTarget.style.color = 'rgba(248,113,113,0.45)' }}
          title="Delete analysis"
        >
          <Trash2 size={13} />
        </motion.button>
      </div>

      {/* 4 stat mini-cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatMini
          icon={DollarSign}
          label="Total Spend"
          value={totalSpend > 0 ? `$${totalSpend.toLocaleString()}` : '—'}
          color="#00d4ff"
        />
        <StatMini
          icon={TrendingDown}
          label="Potential Savings"
          value={totalSaving > 0 ? `$${totalSaving.toLocaleString()}/mo` : '—'}
          color="#4ade80"
        />
        <StatMini
          icon={Lightbulb}
          label="Recommendations"
          value={recCount > 0 ? `${recCount} insight${recCount !== 1 ? 's' : ''}` : '—'}
          color="#a78bfa"
        />
        <StatMini
          icon={TrendingDown}
          label="Annual Savings"
          value={annualSaving > 0 ? `$${Math.round(annualSaving).toLocaleString()}/yr` : '—'}
          color="#facc15"
        />
      </div>

      {/* view button */}
      <motion.button
        onClick={() => onSelect(item)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(124,58,237,0.12))',
          border: '1px solid rgba(0,212,255,0.2)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        View Full Dashboard
        <ArrowRight size={14} />
      </motion.button>
    </motion.div>
  )
}

/* ── main export ─────────────────────────────────────────────────────────── */
export default function HistoryPage({ onSelectAnalysis }) {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const data = await getHistory(50)
      setItems(data.results || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = (id) => setItems(prev => prev.filter(i => i.id !== id))

  return (
    <div className="flex flex-col gap-6">

      {/* section header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Analysis History
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', sans-serif" }}>
            {loading ? 'Loading…' : `${items.length} past analysis${items.length !== 1 ? 'es' : ''} · click any card to reload dashboard`}
          </p>
        </div>

        <motion.button onClick={load} whileTap={{ scale: 0.9 }} disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.18)', color: '#00d4ff', fontFamily: "'Inter', sans-serif" }}>
          <motion.span
            animate={loading ? { rotate: 360 } : { rotate: 0 }}
            transition={loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}>
            <RefreshCw size={12} />
          </motion.span>
          Refresh
        </motion.button>
      </div>

      {/* loading */}
      {loading && <HistorySkeleton />}

      {/* error */}
      {!loading && error && (
        <div className="rounded-2xl px-5 py-5 flex items-start gap-3"
          style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)' }}>
          <AlertCircle size={18} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Could not load history
            </p>
            <p className="text-xs mb-2" style={{ color: 'rgba(248,113,113,0.8)', fontFamily: "'Inter', sans-serif" }}>
              {error}
            </p>
            <button onClick={load} className="text-xs underline" style={{ color: '#00d4ff' }}>
              Try again
            </button>
          </div>
        </div>
      )}

      {/* empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl px-6 py-16 flex flex-col items-center gap-3 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <Clock size={36} style={{ color: 'rgba(255,255,255,0.12)' }} />
          <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Grotesk', sans-serif" }}>
            No analyses yet
          </p>
          <p className="text-xs max-w-xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Inter', sans-serif" }}>
            Upload a CSV or run sample data from the upload screen to create your first analysis.
          </p>
        </div>
      )}

      {/* cards grid */}
      {!loading && !error && items.length > 0 && (
        <AnimatePresence>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {items.map((item, i) => (
              <HistoryCard
                key={item.id}
                item={item}
                index={i}
                onDelete={handleDelete}
                onSelect={onSelectAnalysis}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
