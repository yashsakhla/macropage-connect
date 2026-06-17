import { useUIStore } from '@/store/uiStore'

export default function FullPageLoader() {
  const fullLoader = useUIStore((s) => s.fullLoader)
  if (!fullLoader) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <svg width="160" height="160" viewBox="0 0 160 160" className="animate-spin-slow">
          <defs>
            <linearGradient id="g" x1="0" x2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r="52" stroke="url(#g)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray="80 160" />
        </svg>

        <div className="text-white text-lg font-semibold">Connecting…</div>
        <div className="text-white/80 text-sm">Initializing secure session. This may take a moment.</div>
      </div>

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .animate-spin-slow { animation: spin-slow 2.2s linear infinite }
      `}</style>
    </div>
  )
}
