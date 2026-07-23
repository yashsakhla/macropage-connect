import { useNavigate } from 'react-router-dom'
import { Crown, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

export default function PlanExpiredBanner() {
  const { isPlanExpired, isInTrial, trialDaysLeft, effectivePlan } = useAuthStore()
  const { setPlanExpiredModalOpen } = useUIStore()
  const navigate = useNavigate()

  if (!isPlanExpired()) return null

  const isTrialExpiry = isInTrial() && trialDaysLeft() <= 0
  const rawLabel = isTrialExpiry ? 'Free Trial' : (effectivePlan() || 'Plan')
  const planLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1).toLowerCase()

  return (
    <div className="w-full bg-red-700 text-white px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
      {/* Left */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center flex-shrink-0">
          <Crown size={16} className="text-white" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm leading-tight">
            Your {planLabel} has expired
          </div>
          <div className="text-xs text-red-200 mt-0.5 leading-tight">
            Access is limited to Inbox &amp; Settings only — upgrade to restore all features
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => navigate('/plans')}
          className="flex items-center gap-1.5 h-8 px-4 bg-white dark:bg-[#0b1220] text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30
            text-xs font-bold rounded-lg transition-colors"
        >
          Upgrade Now
          <ArrowRight size={13} />
        </button>
        <button
          onClick={() => setPlanExpiredModalOpen(true)}
          className="h-8 px-3 border border-white/30 text-white/90 hover:bg-white/10
            text-xs font-medium rounded-lg transition-colors"
        >
          View details
        </button>
      </div>
    </div>
  )
}
