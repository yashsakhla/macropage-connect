import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useOnboardingChecklist } from '@/hooks/useAnalytics'
import type { ChecklistData } from '@/types'
import { ChecklistSkeleton } from '@/components/ui/DashboardSkeletons'
import WidgetError from '@/components/ui/WidgetError'

const STEP_DESCRIPTIONS: Record<string, string> = {
  'Create your account': 'Sign up for Macropage Connect',
  'Verify your email': 'Confirm your email address',
  'Connect WhatsApp Business': 'Link your WhatsApp number',
  'Import your contacts': 'Upload your contact list',
  'Create your first template': 'Set up a message template',
  'Launch your first campaign': 'Send your first broadcast',
}

function inferStepUrl(title: string): string {
  if (title.includes('WhatsApp')) return '/settings/waba'
  if (title.includes('contacts')) return '/contacts'
  if (title.includes('template')) return '/templates'
  if (title.includes('campaign')) return '/campaigns'
  return '/dashboard'
}

export default function OnboardingChecklist() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [dismissed, setDismissed] = useState(false)
  const {
    data: checklistData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useOnboardingChecklist()

  if (dismissed || user?.whatsappSetupDone) return null

  if (isLoading) return <ChecklistSkeleton />

  if (isError) {
    return (
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl min-h-48">
        <WidgetError
          title="Could not load checklist"
          message="We are currently facing an issue. Please try again."
          onRetry={refetch}
          isRetrying={isFetching}
        />
      </div>
    )
  }

  const checklist = checklistData as ChecklistData | undefined
  const steps = checklist?.steps ?? []
  const completed = checklist?.completedCount ?? 0
  const total = checklist?.totalSteps ?? steps.length
  const pct = checklist?.progressPercent ?? (total > 0 ? Math.round((completed / total) * 100) : 0)

  const firstIncompleteId = steps.find(s => !s.completed)?.id

  return (
    <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3d2b] to-[#1a5c3a] px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-base font-semibold text-white">Get started with Macropage Connect 🚀</p>
          <p className="text-sm text-white/70 mt-0.5">{completed} of {total} steps complete</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Progress circle */}
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
            <circle
              cx="20" cy="20" r="16" fill="none"
              stroke="white" strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - pct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 20 20)"
            />
            <text x="20" y="25" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">{pct}%</text>
          </svg>
          <button onClick={() => setDismissed(true)} className="text-white/50 hover:text-white text-xl leading-none">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Steps */}
      {steps.map(step => {
        const active = step.id === firstIncompleteId
        const href = step.actionUrl || inferStepUrl(step.title)
        return (
          <div
            key={step.id}
            onClick={() => active && navigate(href)}
            className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 border-b border-[#f5f5f5] dark:border-white/5 last:border-0 ${
              active ? 'cursor-pointer hover:bg-[#fafffe] dark:hover:bg-white/5' : ''
            }`}
          >
            {/* Status circle */}
            <div className="flex-shrink-0">
              {step.completed ? (
                <div className="w-7 h-7 bg-[#1a5c3a] rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" strokeWidth={3} />
                </div>
              ) : active ? (
                <div className="w-7 h-7 bg-white dark:bg-[#0b1220] border-2 border-[#1a5c3a] rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-[#1a5c3a] rounded-full" />
                </div>
              ) : (
                <div className="w-7 h-7 border-2 border-[#e8ebe8] dark:border-white/10 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-300 dark:text-gray-600 font-medium" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{step.title}</p>
              {STEP_DESCRIPTIONS[step.title] && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{STEP_DESCRIPTIONS[step.title]}</p>
              )}
              {active && (
                <p className="text-xs text-[#1a5c3a] font-medium mt-1">Continue →</p>
              )}
            </div>

            {/* Done badge */}
            {step.completed && (
              <span className="bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] text-[0.625rem] rounded-full px-2 py-0.5 flex-shrink-0">
                Done
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
