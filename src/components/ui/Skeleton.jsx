import { motion } from 'framer-motion'

/** Single skeleton shimmer block */
export function SkeletonBlock({ className = '', style = {} }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{ background: 'rgba(255,255,255,0.05)', ...style }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.2 }}
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%)',
        }}
      />
    </div>
  )
}

/** Stats bar skeleton — 4 cards */
export function StatsBarSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:flex gap-4 w-full">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex-1 min-w-0 rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <SkeletonBlock className="w-9 h-9 rounded-xl" />
          <SkeletonBlock className="h-8 w-3/4" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

/** Charts row skeleton */
export function ChartsSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="flex-1 min-w-0 rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <SkeletonBlock className="h-4 w-36" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
            <SkeletonBlock className="h-6 w-16 rounded-full" />
          </div>
          <SkeletonBlock className="h-48 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}

/** Service cards skeleton */
export function ServiceCardsSkeleton({ count = 8 }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <SkeletonBlock className="h-5 w-24" />
        <SkeletonBlock className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex justify-between">
              <SkeletonBlock className="w-10 h-10 rounded-xl" />
              <SkeletonBlock className="h-6 w-20 rounded-full" />
            </div>
            <SkeletonBlock className="h-4 w-2/3" />
            <SkeletonBlock className="h-7 w-1/2" />
            <SkeletonBlock className="h-14 w-14 rounded-full" style={{ borderRadius: '50%' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
