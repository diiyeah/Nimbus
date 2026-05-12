import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'

export default function ApiKeyModal({ onSubmit, onCancel }) {
  const [key,     setKey]     = useState('')
  const [show,    setShow]    = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (!key.trim()) return 'Please enter your Anthropic API key.'
    if (!key.trim().startsWith('sk-ant-')) return 'Key must start with "sk-ant-".'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    await onSubmit(key.trim())
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-2xl p-7 flex flex-col gap-5"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(0,212,255,0.2)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 0 60px rgba(0,212,255,0.08)',
        }}
      >
        {/* icon + title */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(0,212,255,0.1)',
              border: '1px solid rgba(0,212,255,0.25)',
            }}
          >
            <KeyRound size={18} style={{ color: '#00d4ff' }} />
          </div>
          <div>
            <h3
              className="text-white font-semibold text-base"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Anthropic API Key
            </h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif" }}>
              Required to run Claude AI analysis
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* key input */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-medium"
              style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', sans-serif" }}
            >
              API Key
            </label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={key}
                onChange={(e) => { setKey(e.target.value); setError('') }}
                placeholder="sk-ant-api03-..."
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: error
                    ? '1px solid rgba(248,113,113,0.5)'
                    : '1px solid rgba(255,255,255,0.1)',
                  fontFamily: "'Inter', sans-serif",
                  caretColor: '#00d4ff',
                }}
                onFocus={(e) =>
                  (e.target.style.border = '1px solid rgba(0,212,255,0.4)')
                }
                onBlur={(e) =>
                  (e.target.style.border = error
                    ? '1px solid rgba(248,113,113,0.5)'
                    : '1px solid rgba(255,255,255,0.1)')
                }
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                tabIndex={-1}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: '#f87171', fontFamily: "'Inter', sans-serif" }}
                >
                  <AlertCircle size={12} />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Inter', sans-serif" }}>
            Your key is never stored — it's used only for this session's API call.
          </p>

          {/* actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Cancel
            </button>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="flex-[2] relative overflow-hidden rounded-xl py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{
                background: loading
                  ? 'rgba(0,212,255,0.1)'
                  : 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))',
                border: '1px solid rgba(0,212,255,0.35)',
                boxShadow: '0 0 20px rgba(0,212,255,0.12)',
                fontFamily: "'Inter', sans-serif",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 rounded-full border-2 border-t-transparent"
                    style={{ borderColor: 'rgba(0,212,255,0.6)', borderTopColor: 'transparent' }}
                  />
                  Connecting…
                </>
              ) : (
                <>
                  Analyse with Claude
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
