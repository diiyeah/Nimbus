import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Trash2, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react'
import { getHistory, deleteAnalysis } from '../utils/api'
import { SkeletonBlock } from './ui/Skeleton'

/* ── skeleton rows ─────────────────────────────────────────────────────────── */
function HistorySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <SkeletonBlock className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
          <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}

/* ── single history row ────────────────────────────────────────────────────── */
function HistoryRow({ item, onDelete, onSelect }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Delete this analysis?')) return
    setDeleting(true)
    try { await deleteAnalysis(item.id); onDelete(item.id) }
    catch (err) { alert(err.message); setDeleting(false) }
  }

  const date = item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  const recCount = item.recommendations?.length ?? 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: deleting ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      onClick={() => onSelect(item)}
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,212,255,0.08), 0 0 0 1px rgba(0,212,255,0.15)' }}
      className="rounded-2xl p-4 sm:p-5 flex items-center gap-4 cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', transition: 'box-shadow 0.2s' }}
    >
      {/* icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.18)' }}>
        <Clock size={18} style={{ color: '#00d4ff' }} />
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {item.filename || 'Analysis'}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', sans-serif" }}>
          {date} · {recCount} recommendation{recCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* savings badge */}
      {item.total_saving > 0 && (
        <span className="hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80', fontFamily: "'Inter', sans-serif" }}>
          ${item.total_saving.toLocaleString()}/mo
        </span>
      )}

      {/* actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <motion.button onClick={handleDelete} disabled={deleting} whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: 'rgba(248,113,113,0.5)', background: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,113,113,0.5)' }}
        >
          <Trash2 size={14} />
        </motion.button>
        <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.2)' }} />
      </div>
    </motion.div>
  )
}

/* ── main export ───────────────────────────────────────────────────────────── */
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
    <div className="flex flex-col gap-5">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Analysis History
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', sans-serif" }}>
            {loading ? 'Loading…' : `${items.length} past analysis${items.length !== 1 ? 'es' : ''}`}
          </p>
        </div>
        <motion.button onClick={load} whileTap={{ scale: 0.9 }} disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.18)', color: '#00d4ff', fontFamily: "'Inter', sans-serif" }}>
          <motion.span animate={loading ? { rotate: 360 } : { rotate: 0 }}
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
        <div className="rounded-2xl px-5 py-4 flex items-start gap-3"
          style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)' }}>
          <AlertCircle size={18} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Could not load history
            </p>
            <p className="text-xs" style={{ color: 'rgba(248,113,113,0.8)', fontFamily: "'Inter', sans-serif" }}>{error}</p>
            <button onClick={load} className="text-xs mt-2 underline" style={{ color: '#00d4ff' }}>Try again</button>
          </div>
        </div>
      )}

      {/* empty */}
      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl px-6 py-12 flex flex-col items-center gap-3 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <Clock size={32} style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Grotesk', sans-serif" }}>
            No analyses yet
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Inter', sans-serif" }}>
            Upload a CSV or run sample data to get started.
          </p>
        </div>
      )}

      {/* list */}
      {!loading && !error && items.length > 0 && (
        <AnimatePresence>
          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <HistoryRow key={item.id} item={item} index={i}
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
