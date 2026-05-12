import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import UploadScreen from './components/UploadScreen'
import AnalyzingScreen from './components/AnalyzingScreen'
import StatsBar from './components/StatsBar'
import SpendTrendChart from './components/SpendTrendChart'
import WastefulServicesChart from './components/WastefulServicesChart'
import ServiceCards from './components/ServiceCards'
import RecommendationCards from './components/RecommendationCards'
import WasteHeatmap from './components/WasteHeatmap'
import { StatsBarSkeleton, ChartsSkeleton, ServiceCardsSkeleton } from './components/ui/Skeleton'
import { mockRecommendations } from './data/data'
const PAGES = {
  overview: 'Overview',
  services: 'Services',
  insights: 'AI Insights',
  reports:  'Reports',
}

const PAGE_ORDER = ['overview', 'services', 'insights', 'reports']

// direction-aware slide variants
const pageVariants = {
  enter: (dir) => ({
    opacity: 0,
    x: dir > 0 ? 40 : -40,
    filter: 'blur(4px)',
  }),
  center: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir > 0 ? -40 : 40,
    filter: 'blur(4px)',
  }),
}

const pageTransition = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1],
}

// app stages: 'upload' | 'analyzing' | 'loading' | 'dashboard'
export default function App() {
  const [active,          setActive]          = useState('overview')
  const [prevActive,      setPrevActive]      = useState('overview')
  const [appStage,        setAppStage]        = useState('upload')
  const [data,            setData]            = useState(null)
  const [recommendations, setRecommendations] = useState(null)
  const [pageLoading,     setPageLoading]     = useState(false)
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false)
  const [isMobile,        setIsMobile]        = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // close drawer on resize to desktop
  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false)
  }, [isMobile])

  // direction: +1 = going right (forward), -1 = going left (back)
  const direction = PAGE_ORDER.indexOf(active) - PAGE_ORDER.indexOf(prevActive)

  const handleDataLoaded = (d) => {
    setData(d)
    setAppStage('analyzing')
  }

  const handleAnalysisDone = () => {
    setRecommendations(mockRecommendations)
    // brief skeleton flash to simulate data hydration
    setAppStage('loading')
    setTimeout(() => setAppStage('dashboard'), 900)
  }

  const handleNavChange = (id) => {
    if (id === active) return
    setPrevActive(active)
    setPageLoading(true)
    setActive(id)
    // skeleton flash per page switch
    setTimeout(() => setPageLoading(false), 400)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0f1e' }}>

      {/* Analyzing overlay */}
      <AnimatePresence>
        {appStage === 'analyzing' && (
          <AnalyzingScreen key="analyzing" onComplete={handleAnalysisDone} />
        )}
      </AnimatePresence>

      {appStage !== 'analyzing' && (
        <>
          <Navbar
            sidebarOpen={mobileMenuOpen}
            onMenuToggle={() => setMobileMenuOpen(o => !o)}
            isMobile={isMobile}
          />
          <Sidebar
            active={active}
            setActive={handleNavChange}
            mobileOpen={mobileMenuOpen}
            onMobileClose={() => setMobileMenuOpen(false)}
          />

          {/* layout wrapper — no left spacer on mobile */}
          <div className="flex pt-16 min-h-screen">
            <div className="w-60 flex-shrink-0 hidden lg:block" />

            {/* main content — extra bottom padding on mobile for bottom tab bar */}
            <main className="flex-1 min-w-0 overflow-x-hidden pb-20 lg:pb-0">
              <AnimatePresence mode="wait" custom={direction}>

                {/* ── UPLOAD ── */}
                {appStage === 'upload' && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center"
                  >
                    <UploadScreen onDataLoaded={handleDataLoaded} />
                  </motion.div>
                )}

                {/* ── SKELETON (initial load) ── */}
                {appStage === 'loading' && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="h-8 w-40 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
                      <div className="h-4 w-64 rounded-lg mt-1" style={{ background: 'rgba(255,255,255,0.03)' }} />
                    </div>
                    <StatsBarSkeleton />
                    <ChartsSkeleton />
                    <ServiceCardsSkeleton count={8} />
                  </motion.div>
                )}

                  {/* ── DASHBOARD ── */}
                {appStage === 'dashboard' && (
                  <motion.div
                    key={active}
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={pageTransition}
                    className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8"
                  >
                    {/* page title */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                    >
                      <h1
                        className="text-3xl font-bold text-white mb-1"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {PAGES[active]}
                      </h1>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', sans-serif" }}>
                        {data?.name} · {data?.rows?.length} services · AI analysis complete
                      </p>
                    </motion.div>

                    {/* ── per-page skeleton while switching ── */}
                    {pageLoading ? (
                      <>
                        {active === 'overview' && (
                          <>
                            <StatsBarSkeleton />
                            <ChartsSkeleton />
                            <ServiceCardsSkeleton count={8} />
                          </>
                        )}
                        {(active === 'services') && <ServiceCardsSkeleton count={8} />}
                        {(active === 'insights' || active === 'reports') && (
                          <div className="flex flex-col gap-3">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="h-20 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }} />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* ── Overview ── */}
                        {active === 'overview' && data?.rows && (
                          <>
                            <StatsBar rows={data.rows} recommendations={recommendations} />
                            {/* charts: stack on mobile, side-by-side on lg */}
                            <div className="flex flex-col lg:flex-row gap-5">
                              <SpendTrendChart rows={data.rows} />
                              <WastefulServicesChart rows={data.rows} />
                            </div>
                            <WasteHeatmap rows={data.rows} />
                            <ServiceCards rows={data.rows} />
                            <RecommendationCards recommendations={recommendations} />
                          </>
                        )}

                        {/* ── Services ── */}
                        {active === 'services' && data?.rows && (
                          <ServiceCards rows={data.rows} />
                        )}

                        {/* ── AI Insights ── */}
                        {active === 'insights' && (
                          <RecommendationCards recommendations={recommendations} />
                        )}

                        {/* ── Reports ── */}
                        {active === 'reports' && data?.rows && (
                          <WasteHeatmap rows={data.rows} />
                        )}
                      </>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </main>
          </div>
        </>
      )}
    </div>
  )
}
