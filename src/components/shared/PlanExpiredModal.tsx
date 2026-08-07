import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, X, ArrowRight, Zap, Clock, Lock, MessageSquare, Users, BarChart2, Send } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import popupBanner from '@/assets/popups/POPUP.svg'

const MISSING_FEATURES = [
  { icon: MessageSquare, label: 'Live chat inbox & conversations' },
  { icon: Send,          label: 'Send campaigns to your contacts' },
  { icon: Users,         label: 'Team collaboration & agent assignment' },
  { icon: BarChart2,     label: 'Analytics & performance reports' },
]

export default function PlanExpiredModal() {
  const [closing, setClosing] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const { isAuthenticated, user, isPlanExpired, isInTrial, trialDaysLeft, effectivePlan } = useAuthStore()
  const { planExpiredModalOpen, setPlanExpiredModalOpen } = useUIStore()
  const navigate = useNavigate()

  useEffect(() => {
    setPortalTarget(document.body)
  }, [])

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
  if ((!planExpiredModalOpen && !closing) || !portalTarget) return null

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

  return createPortal(
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4
        transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}
      onClick={(e) => e.target === e.currentTarget && dismiss()}
    >
      <div
        className={`bg-white dark:bg-[#0b1220] rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-2xl overflow-hidden
          transition-all duration-300 ${closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        style={{ animation: closing ? undefined : 'planExpiredIn 0.32s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Banner */}
        <div
          className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-5 sm:pb-6 min-h-[9.5rem] sm:min-h-0 overflow-hidden bg-gradient-to-br from-[#eafbf1] to-[#dcf5e6] dark:from-[#0f2a1c] dark:to-[#0b1f15]"
          style={{ backgroundImage: `url(${popupBanner})`, backgroundSize: 'cover', backgroundPosition: 'left center' }}
        >
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/70 hover:bg-white
              backdrop-blur-sm transition-colors flex items-center justify-center shadow-sm"
          >
            <X size={14} className="text-gray-700" />
          </button>

          <div className="relative ml-auto w-[70%] sm:w-1/2 pr-8 sm:pr-10 text-right">
            <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-brand-300/30
              rounded-full px-2.5 sm:px-3 py-1 mb-2 sm:mb-3">
              <Clock size={11} className="text-brand-300" />
              <span className="text-[0.6rem] sm:text-[0.65rem] font-bold text-brand-300 uppercase tracking-wide">
                {displayLabel} Expired
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">
              Your {displayLabel} has <span className="text-brand-300">Expired</span>
            </h2>
            <p className="hidden sm:block text-gray-600 text-xs mt-2 leading-relaxed">
              Access to key features is paused. Upgrade your plan to get back to running your
              WhatsApp business at full speed.
            </p>

            <div className="mt-2 sm:mt-3 inline-flex items-center gap-1.5 sm:gap-2 bg-[#1a5c3a] rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5">
              <Lock size={11} className="text-white" />
              <span className="text-[0.65rem] sm:text-xs font-semibold text-white">Portal access is restricted</span>
            </div>
          </div>
        </div>

        {/* What you're missing */}
        <div className="px-5 sm:px-6 py-4 sm:py-3.5">
          <p className="text-[0.7rem] font-bold text-brand-300 uppercase tracking-widest mb-2 sm:mb-2.5">
            What you're missing
          </p>
          <ul className="space-y-1 sm:space-y-1.5">
            {MISSING_FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 rounded-xl px-2 py-1.5 sm:py-1 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-300/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-brand-300" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{label}</span>
                <ChevronRight size={15} className="text-gray-300 dark:text-gray-600" />
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-4 flex flex-col gap-2">
          <button
            onClick={upgrade}
            className="w-full h-12 sm:h-11 bg-gradient-to-r from-[#1a5c3a] to-[#2d7a4f] hover:brightness-110 text-white rounded-2xl
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
    </div>,
    portalTarget
  )
}
