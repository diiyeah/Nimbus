import { motion } from 'framer-motion'

export default function CloudIcon() {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="relative flex items-center justify-center"
    >
      {/* glow ring */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-36 h-36 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.25) 0%, transparent 70%)',
          filter: 'blur(12px)',
        }}
      />

      <svg
        width="96"
        height="72"
        viewBox="0 0 96 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cloudGrad" x1="0" y1="0" x2="96" y2="72" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* cloud body */}
        <path
          d="M76 52H22C13.16 52 6 44.84 6 36C6 28.08 11.84 21.52 19.52 20.24C21.04 12.08 28.24 6 37 6C43.44 6 49.12 9.2 52.64 14.16C54.36 13.44 56.24 13 58.24 13C66.52 13 73.24 19.72 73.24 28C73.24 28.32 73.24 28.64 73.2 28.96C80.08 30.4 85.24 36.52 85.24 44C85.24 48.42 81.64 52 76 52Z"
          fill="url(#cloudGrad)"
          fillOpacity="0.15"
          stroke="url(#cloudGrad)"
          strokeWidth="1.5"
          filter="url(#glow)"
        />

        {/* lightning bolt */}
        <path
          d="M52 22L40 42H50L44 58L60 36H50L52 22Z"
          fill="#00d4ff"
          fillOpacity="0.95"
          filter="url(#glow)"
        />
      </svg>
    </motion.div>
  )
}
