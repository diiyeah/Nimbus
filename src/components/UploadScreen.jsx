import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, AlertCircle } from 'lucide-react'
import ParticleField from './ParticleField'
import CloudIcon from './CloudIcon'
import PreviewTable from './PreviewTable'
import { parseCSV } from '../utils/parseCSV'
import { cloudServices } from '../data/data'
import RippleButton from './ui/RippleButton'

// ─── states: 'idle' | 'preview' | 'error'
export default function UploadScreen({ onDataLoaded }) {
  const [stage, setStage]       = useState('idle')
  const [dragging, setDragging] = useState(false)
  const [parsed, setParsed]     = useState(null)   // { rows, warnings, fileName }
  const [error, setError]       = useState(null)
  const fileRef = useRef(null)

  // ── CSV read + parse
  const readFile = (file) => {
    if (!file.name.match(/\.(csv)$/i)) {
      setError('Only .csv files are supported. Please upload a valid CSV file.')
      setStage('error')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const { data, error: parseError, warnings } = parseCSV(text)

      if (parseError) {
        setError(parseError)
        setStage('error')
        return
      }

      setParsed({ rows: data, warnings: warnings || [], fileName: file.name })
      setStage('preview')
    }
    reader.onerror = () => {
      setError('Failed to read the file. Please try again.')
      setStage('error')
    }
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) readFile(file)
  }

  // ── sample data — use the pre-built array from data.js
  const handleSample = () => {
    setParsed({ rows: cloudServices, warnings: [], fileName: 'sample_data.csv' })
    setStage('preview')
  }

  const handleConfirm = () => {
    onDataLoaded && onDataLoaded({ name: parsed.fileName, rows: parsed.rows, sample: parsed.fileName === 'sample_data.csv' })
  }

  const handleReset = () => {
    setStage('idle')
    setParsed(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-full w-full overflow-hidden px-4 sm:px-6 py-10">
      <ParticleField />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,212,255,0.06) 0%, transparent 70%)',
        }}
      />

      <AnimatePresence mode="wait">

        {/* ── IDLE / UPLOAD ── */}
        {stage === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center gap-8 w-full max-w-lg"
          >
            <CloudIcon />

            <div className="text-center">
              <h2
                className="text-4xl font-bold text-white mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Stop guessing.{' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Start saving.
                </span>
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Inter', sans-serif" }}>
                Upload your cloud billing CSV or load sample data to get started.
              </p>
            </div>

            {/* drop zone */}
            <DropZone
              dragging={dragging}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
            />

            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files[0] && readFile(e.target.files[0])}
            />

            <Divider />
            <ShimmerButton onClick={handleSample} />

            {/* format hint */}
            <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Inter', sans-serif" }}>
              CSV must include columns: <span style={{ color: 'rgba(0,212,255,0.6)' }}>service</span>,{' '}
              <span style={{ color: 'rgba(0,212,255,0.6)' }}>spend</span>,{' '}
              <span style={{ color: 'rgba(0,212,255,0.6)' }}>usage</span>
            </p>
          </motion.div>
        )}

        {/* ── ERROR ── */}
        {stage === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md"
          >
            <div
              className="w-full rounded-2xl px-6 py-6 flex flex-col gap-4"
              style={{
                background: 'rgba(248,113,113,0.07)',
                border: '1px solid rgba(248,113,113,0.3)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle size={20} style={{ color: '#f87171', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Could not parse file
                  </p>
                  <p className="text-sm whitespace-pre-line" style={{ color: 'rgba(248,113,113,0.85)', fontFamily: "'Inter', sans-serif" }}>
                    {error}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-colors"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            >
              ← Try Again
            </button>
          </motion.div>
        )}

        {/* ── PREVIEW ── */}
        {stage === 'preview' && parsed && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 w-full max-w-2xl"
          >
            <PreviewTable
              rows={parsed.rows}
              fileName={parsed.fileName}
              warnings={parsed.warnings}
              onConfirm={handleConfirm}
              onCancel={handleReset}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

// ── sub-components

function DropZone({ dragging, onDragOver, onDragLeave, onDrop, onClick }) {
  return (
    <motion.div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      animate={{
        boxShadow: dragging
          ? '0 0 0 2px #00d4ff, 0 0 32px rgba(0,212,255,0.4)'
          : '0 0 0 1.5px rgba(0,212,255,0.3), 0 0 20px rgba(0,212,255,0.1)',
      }}
      transition={{ duration: 0.2 }}
      className="relative w-full rounded-2xl flex flex-col items-center justify-center gap-3 py-12 cursor-pointer overflow-hidden"
      style={{
        background: dragging ? 'rgba(0,212,255,0.07)' : 'rgba(255,255,255,0.03)',
        border: '1.5px dashed rgba(0,212,255,0.45)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ border: '1.5px dashed rgba(0,212,255,0.3)', borderRadius: '1rem' }}
      />

      <motion.div animate={{ y: dragging ? -6 : 0 }} transition={{ duration: 0.2 }}>
        <Upload
          size={32}
          style={{
            color: dragging ? '#00d4ff' : 'rgba(0,212,255,0.6)',
            filter: dragging ? 'drop-shadow(0 0 10px #00d4ff)' : 'none',
            transition: 'all 0.2s',
          }}
        />
      </motion.div>
      <p
        className="text-sm font-medium"
        style={{ color: dragging ? '#00d4ff' : 'rgba(255,255,255,0.6)', fontFamily: "'Inter', sans-serif" }}
      >
        {dragging ? 'Drop it here' : 'Drag & drop your CSV file'}
      </p>
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Inter', sans-serif" }}>
        or click to browse
      </p>
    </motion.div>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Inter', sans-serif" }}>or</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
    </div>
  )
}

function ShimmerButton({ onClick }) {
  return (
    <RippleButton
      onClick={onClick}
      className="relative overflow-hidden rounded-xl px-8 py-3 text-sm font-semibold text-white w-full"
      style={{
        background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))',
        border: '1px solid rgba(0,212,255,0.3)',
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 0 20px rgba(0,212,255,0.1)',
      }}
    >
      <motion.span
        className="absolute inset-0 pointer-events-none"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
          width: '60%',
        }}
      />
      Load Sample Data
    </RippleButton>
  )
}
