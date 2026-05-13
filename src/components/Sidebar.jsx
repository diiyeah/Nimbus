import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Layers, BrainCircuit, FileBarChart2, History } from 'lucide-react'

const navItems = [
  { id: 'overview',  label: 'Overview',    icon: LayoutDashboard },
  { id: 'services',  label: 'Services',    icon: Layers },
  { id: 'insights',  label: 'AI Insights', icon: BrainCircuit },
  { id: 'reports',   label: 'Reports',     icon: FileBarChart2 },
  { id: 'history',   label: 'History',     icon: History },
]

/* ── Desktop sidebar (lg+) ───────────────────────────────── */
function DesktopSidebar({ active, setActive }) {
  return (
    <aside
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-60 flex-col gap-1 px-3 py-6 z-40 hidden lg:flex"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <NavItems active={active} setActive={setActive} showLabels />
    </aside>
  )
}

/* ── Mobile drawer (slides in from left) ─────────────────── */
function MobileDrawer({ active, setActive, open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 flex flex-col gap-1 px-3 py-6 z-50 lg:hidden"
            style={{
              background: 'rgba(10,15,30,0.97)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRight: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '8px 0 32px rgba(0,0,0,0.5)',
            }}
          >
            <NavItems active={active} setActive={(id) => { setActive(id); onClose() }} showLabels />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

/* ── Mobile bottom tab bar ───────────────────────────────── */
function BottomTabBar({ active, setActive }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden"
      style={{
        background: 'rgba(10,15,30,0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = active === item.id
        return (
          <motion.button
            key={item.id}
            onClick={() => setActive(item.id)}
            whileTap={{ scale: 0.9 }}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 relative"
            style={{ color: isActive ? '#00d4ff' : 'rgba(255,255,255,0.4)' }}
          >
            {isActive && (
              <motion.div
                layoutId="bottomBar"
                className="absolute top-0 left-3 right-3 h-0.5 rounded-full"
                style={{ background: '#00d4ff', boxShadow: '0 0 8px #00d4ff' }}
              />
            )}
            <Icon
              size={20}
              style={{
                filter: isActive ? 'drop-shadow(0 0 5px #00d4ff)' : 'none',
              }}
            />
            <span
              className="text-xs font-medium"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 10 }}
            >
              {item.label}
            </span>
          </motion.button>
        )
      })}
    </nav>
  )
}

/* ── Shared nav items ────────────────────────────────────── */
function NavItems({ active, setActive, showLabels }) {
  return navItems.map((item) => {
    const Icon = item.icon
    const isActive = active === item.id
    return (
      <motion.button
        key={item.id}
        onClick={() => setActive(item.id)}
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.97 }}
        className="relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left"
        style={{
          fontFamily: "'Inter', sans-serif",
          color: isActive ? '#00d4ff' : 'rgba(255,255,255,0.55)',
          background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
          boxShadow: isActive ? '0 0 16px rgba(0,212,255,0.2), inset 0 0 12px rgba(0,212,255,0.05)' : 'none',
          border: isActive ? '1px solid rgba(0,212,255,0.25)' : '1px solid transparent',
          transition: 'background 0.15s, color 0.15s',
        }}
      >
        {isActive && (
          <motion.span
            layoutId="activeBar"
            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
            style={{ background: '#00d4ff', boxShadow: '0 0 8px #00d4ff' }}
          />
        )}
        <Icon
          size={18}
          style={{
            color: isActive ? '#00d4ff' : 'rgba(255,255,255,0.45)',
            filter: isActive ? 'drop-shadow(0 0 6px #00d4ff)' : 'none',
            flexShrink: 0,
          }}
        />
        {showLabels && item.label}
      </motion.button>
    )
  })
}

/* ── Main export ─────────────────────────────────────────── */
export default function Sidebar({ active, setActive, mobileOpen, onMobileClose }) {
  return (
    <>
      <DesktopSidebar active={active} setActive={setActive} />
      <MobileDrawer active={active} setActive={setActive} open={mobileOpen} onClose={onMobileClose} />
      <BottomTabBar active={active} setActive={setActive} />
    </>
  )
}
