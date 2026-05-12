import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Drop-in button wrapper that adds a scale + ripple effect on click.
 * Accepts all standard button props plus className / style.
 */
export default function RippleButton({ children, onClick, className = '', style = {}, disabled = false, ...rest }) {
  const [ripples, setRipples] = useState([])
  const ref = useRef(null)

  const handleClick = (e) => {
    if (disabled) return

    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()

    setRipples((prev) => [...prev, { id, x, y }])
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600)

    onClick?.(e)
  }

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`relative overflow-hidden ${className}`}
      style={style}
      {...rest}
    >
      {children}

      {/* ripple layer */}
      <AnimatePresence>
        {ripples.map(({ id, x, y }) => (
          <motion.span
            key={id}
            initial={{ width: 0, height: 0, opacity: 0.35, x, y, translateX: '-50%', translateY: '-50%' }}
            animate={{ width: 300, height: 300, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="absolute rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.25)', top: 0, left: 0 }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  )
}
