import { motion } from 'framer-motion'
import { CloudLightning, Menu, X } from 'lucide-react'

export default function Navbar({ sidebarOpen, onMenuToggle, isMobile }) {
  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 flex items-center z-50"
      style={{
        background: 'rgba(10,15,30,0.9)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* logo zone — full width on mobile, sidebar-width on desktop */}
      <div className="lg:w-60 flex-shrink-0 flex items-center px-4 lg:px-5 gap-3">
        {/* hamburger — mobile/tablet only */}
        {isMobile && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onMenuToggle}
            className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
            }}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </motion.button>
        )}

        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #00d4ff22, #7c3aed33)',
              border: '1px solid rgba(0,212,255,0.3)',
              boxShadow: '0 0 18px rgba(0,212,255,0.2)',
            }}
          >
            <CloudLightning size={20} style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 6px #00d4ff)' }} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-semibold text-base lg:text-lg tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              NimbusAI
            </span>
            <span className="text-xs tracking-wide hidden sm:block" style={{ color: 'rgba(0,212,255,0.7)', fontFamily: "'Inter', sans-serif" }}>
              AI-Powered Cloud Intelligence
            </span>
          </div>
        </motion.div>
      </div>

      {/* right content area — desktop only divider */}
      <div
        className="flex-1 h-full hidden lg:flex items-center px-6"
        style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
      />
    </header>
  )
}
