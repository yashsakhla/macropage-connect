import { useEffect, useState } from 'react'
import { X, Sparkles, MessageCircle, Zap, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'

// Shown once, right after a successful login/sign-in, the first time the
// user lands on the dashboard. useUIStore.justLoggedIn is set by useAuth
// (useLogin / useGoogleAuth) just before navigating to /dashboard, and is
// never persisted — so a page refresh or later visit won't bring it back.
export default function PromoBanner() {
  const openHelpChat = useUIStore((s) => s.openHelpChat)

  // Captured once at mount — not a reactive subscription. Clearing the flag
  // below must not be a dependency of this effect, or the resulting re-render
  // cancels the in-flight entrance animation before it ever completes.
  const [visible, setVisible] = useState(() => useUIStore.getState().justLoggedIn)
  const [entered, setEntered] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (!visible) return
    useUIStore.getState().setJustLoggedIn(false)
    const t = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(t)
  }, [visible])

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => setVisible(false), 300)
  }

  if (!visible) return null

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl shadow-card transition-all duration-300 ease-out',
        entered && !closing ? 'opacity-100 translate-y-0 max-h-[220px]' : 'opacity-0 -translate-y-2 max-h-0'
      )}
    >
      <div className="relative bg-gradient-to-r from-[#123724] via-[#1a5c3a] to-[#2d7a4f] px-6 py-6 sm:px-8 sm:py-7 flex items-center gap-6 flex-wrap sm:flex-nowrap">
        {/* Decorative floating shapes */}
        <div className="pointer-events-none absolute -right-10 -top-16 w-48 h-48 rounded-full bg-white/10 animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute right-24 -bottom-10 w-24 h-24 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute left-1/3 -top-6 w-16 h-16 rounded-full bg-white/5" />

        {/* "Image" — illustrated icon composition */}
        <div className="group relative shrink-0 w-16 h-16 sm:w-20 sm:h-20">
          <div className="absolute inset-0 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm rotate-6 transition-transform duration-500 group-hover:rotate-0" />
          <div className="absolute inset-0 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
            <MessageCircle size={28} className="text-white" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#ffd166] flex items-center justify-center shadow-lg animate-bounce-once">
            <Sparkles size={13} className="text-[#123724]" />
          </div>
        </div>

        {/* Copy */}
        <div className="flex-1 min-w-[200px]">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/70 mb-1">
            <Zap size={11} />
            Welcome back
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
            Do more with Macropage Connect
          </h3>
          <p className="text-sm text-white/75 mt-1 max-w-xl leading-relaxed">
            One dashboard for live WhatsApp chat, campaigns, templates and analytics —
            built to help you talk to more customers, faster.
          </p>
        </div>

        {/* CTA + close */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { openHelpChat(); handleClose() }}
            className="inline-flex items-center gap-1.5 bg-white text-[#123724] text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/90 active:scale-95 transition-all"
          >
            Take a quick look
            <ArrowRight size={14} />
          </button>
          <button
            onClick={handleClose}
            aria-label="Dismiss"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            <X size={15} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
