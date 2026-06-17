import { cn } from '@/lib/utils'

function Pulse({ className }: { className?: string }) {
  return <div className={cn('bg-gray-100 rounded-xl animate-pulse', className)} />
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <Pulse className="h-3 w-24" />
        <Pulse className="h-9 w-9 rounded-xl" />
      </div>
      <Pulse className="h-8 w-20 mb-3" />
      <div className="flex items-center gap-2">
        <Pulse className="h-3 w-8" />
        <Pulse className="h-3 w-24" />
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <Pulse className="h-4 w-40" />
        <Pulse className="h-8 w-28 rounded-xl" />
      </div>
      <div className="flex items-end gap-2 h-52 pt-4">
        {[55, 80, 45, 90, 65, 75, 50, 85, 70, 60, 88, 72].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-100 rounded-t-lg animate-pulse"
            style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

export function ActivitySkeleton() {
  return (
    <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5">
      <Pulse className="h-4 w-32 mb-5" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-start gap-3">
            <Pulse className="w-8 h-8 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-3 w-full" />
              <Pulse className="h-3 w-2/3" />
            </div>
            <Pulse className="h-3 w-10 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function HealthSkeleton() {
  return (
    <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5">
      <Pulse className="h-4 w-36 mb-4" />
      <div className="space-y-3">
        <Pulse className="h-12 w-full rounded-xl" />
        <Pulse className="h-12 w-full rounded-xl" />
        <Pulse className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function ChecklistSkeleton() {
  return (
    <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <Pulse className="h-4 w-40" />
        <Pulse className="h-3 w-16" />
      </div>
      <Pulse className="h-2 w-full rounded-full mb-5" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Pulse className="w-6 h-6 rounded-full flex-shrink-0" />
            <Pulse className="h-3 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
