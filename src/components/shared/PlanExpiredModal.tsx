import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ArrowRight, Zap, MessageSquare, Users, BarChart2, Send } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

const MISSING_FEATURES = [
  { icon: MessageSquare, label: 'Live chat inbox & conversations' },
  { icon: Send,          label: 'Send campaigns to your contacts' },
  { icon: Users,         label: 'Team collaboration & agent assignment' },
  { icon: BarChart2,     label: 'Analytics & performance reports' },
]

export default function PlanExpiredModal() {
  const [closing, setClosing] = useState(false)
  const { isAuthenticated, user, isPlanExpired, isInTrial, trialDaysLeft, effectivePlan } = useAuthStore()
  const { planExpiredModalOpen, setPlanExpiredModalOpen } = useUIStore()
  const navigate = useNavigate()

  // Show automatically whenever the user lands on the portal with an expired plan.
  // Watching isAuthenticated + plan-related fields means this re-fires on every
  // fresh login, and again if the plan status changes (e.g. payment fails mid-session).
  useEffect(() => {
    if (!isAuthenticated || !isPlanExpired()) return
    const t = setTimeout(() => setPlanExpiredModalOpen(true), 800)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.plan, user?.subscriptionActive, user?.trialEndsAt])

  // planExpiredModalOpen is the single source of truth for visibility
  if (!planExpiredModalOpen && !closing) return null

  const isTrialExpiry = isInTrial() && trialDaysLeft() <= 0
  const planLabel = isTrialExpiry ? 'Free Trial' : (effectivePlan() || 'Plan')
  const displayLabel = planLabel.charAt(0).toUpperCase() + planLabel.slice(1).toLowerCase()

  function dismiss() {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      setPlanExpiredModalOpen(false)
    }, 280)
  }

  function upgrade() {
    dismiss()
    navigate('/plans')
  }

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4
        transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}
      onClick={(e) => e.target === e.currentTarget && dismiss()}
    >
      <div
        className={`bg-white dark:bg-[#0b1220] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden
          transition-all duration-300 ${closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        style={{ animation: closing ? undefined : 'planExpiredIn 0.32s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Header */}
        <div className="relative bg-[#1a3d2b] px-6 pt-7 pb-8 overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/5" />
          <div className="absolute right-4 bottom-0 w-16 h-16 rounded-full bg-white/5" />
          <div className="absolute -left-4 bottom-2 w-20 h-20 rounded-full bg-white/3" />

          <button
            onClick={dismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
              transition-colors flex items-center justify-center"
          >
            <X size={14} className="text-white" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/20
                bg-white/10 text-2xl"
              style={{ animation: 'expiredIconPulse 2s ease-in-out infinite' }}
            >
              ⏰
            </div>
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center
              shadow-lg shadow-red-500/40 text-lg">
              🔒
            </div>
          </div>

          <h2 className="text-xl font-black text-white leading-tight">
            Your {displayLabel} has expired
          </h2>
          <p className="text-white/70 text-xs mt-2 leading-relaxed">
            Access to key features is paused. Upgrade your plan to get back to running your
            WhatsApp business at full speed.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 bg-red-500/20 border border-red-400/30
            rounded-xl px-3 py-1.5">
            <span className="text-base">🚫</span>
            <span className="text-xs font-semibold text-red-200">Portal access is restricted</span>
          </div>
        </div>

        {/* What you're missing */}
        <div className="px-6 py-5">
          <p className="text-[0.7rem] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
            What you're missing 👇
          </p>
          <ul className="space-y-2.5">
            {MISSING_FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
                  <Icon size={13} className="text-red-400" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="px-6 pb-6 flex flex-col gap-2.5">
          <button
            onClick={upgrade}
            className="w-full h-12 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-2xl
              font-bold text-sm transition-all flex items-center justify-center gap-2
              shadow-lg shadow-[#1a5c3a]/30 hover:shadow-xl hover:shadow-[#1a5c3a]/40 hover:-translate-y-0.5"
          >
            <Zap size={15} />
            Upgrade Now — Restore Full Access
            <ArrowRight size={15} />
          </button>

          <button
            onClick={dismiss}
            className="w-full h-10 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 text-sm transition-colors
              rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5"
          >
            Continue with limited access
          </button>
        </div>
      </div>

      <style>{`
        @keyframes planExpiredIn {
          from { opacity: 0; transform: scale(0.85) translateY(24px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes expiredIconPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.12); }
        }
      `}</style>
    </div>
  )
}
