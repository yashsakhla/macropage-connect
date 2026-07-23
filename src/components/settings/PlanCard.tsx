import { Check, CheckCircle, Zap, TrendingUp, Crown, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BillingCycle, BillingPlan } from '@/types'

interface Props {
  plan: BillingPlan
  isCurrentPlan: boolean
  billingCycle: BillingCycle
  onSelect: (planId: string) => void
  currentPlanOrder: number
  thisPlanOrder: number
}

const PLAN_META: Record<string, {
  icon: React.ElementType
  accentBg: string
  iconBg: string
  iconColor: string
  checkBg: string
  checkColor: string
}> = {
  STARTER: {
    icon: Zap,
    accentBg: 'bg-sky-500',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-500',
    checkBg: 'bg-sky-50',
    checkColor: 'text-sky-500',
  },
  GROWTH: {
    icon: TrendingUp,
    accentBg: 'bg-[#1a5c3a]',
    iconBg: 'bg-[#e8f5ee] dark:bg-emerald-950/30',
    iconColor: 'text-[#1a5c3a]',
    checkBg: 'bg-[#e8f5ee] dark:bg-emerald-950/30',
    checkColor: 'text-[#1a5c3a]',
  },
  BUSINESS: {
    icon: Crown,
    accentBg: 'bg-purple-600',
    iconBg: 'bg-purple-50 dark:bg-purple-950/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    checkBg: 'bg-purple-50 dark:bg-purple-950/30',
    checkColor: 'text-purple-600 dark:text-purple-400',
  },
  ENTERPRISE: {
    icon: Globe,
    accentBg: 'bg-gray-600',
    iconBg: 'bg-gray-100 dark:bg-white/10',
    iconColor: 'text-gray-600 dark:text-gray-400',
    checkBg: 'bg-gray-100 dark:bg-white/10',
    checkColor: 'text-gray-600 dark:text-gray-400',
  },
}

const DEFAULT_META = {
  icon: Zap,
  accentBg: 'bg-gray-400',
  iconBg: 'bg-gray-100 dark:bg-white/10',
  iconColor: 'text-gray-500 dark:text-gray-400',
  checkBg: 'bg-gray-100 dark:bg-white/10',
  checkColor: 'text-gray-500 dark:text-gray-400',
}

export default function PlanCard({ plan, isCurrentPlan, billingCycle, onSelect, currentPlanOrder, thisPlanOrder }: Props) {
  const tier      = plan.pricing[billingCycle]
  const isPopular = plan.highlight
  const isUpgrade = thisPlanOrder > currentPlanOrder
  const meta      = PLAN_META[plan.id] ?? DEFAULT_META
  const Icon      = meta.icon

  return (
    <div className={cn(
      'relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200',
      'border-2',
      isCurrentPlan
        ? 'border-[#1a5c3a] shadow-lg shadow-[#1a5c3a]/10'
        : 'border-[#e8ebe8] dark:border-white/10 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:shadow-black/5',
    )}>

      {/* Colored accent strip */}
      <div className={cn('h-1 w-full flex-shrink-0', meta.accentBg)} />

      <div className="flex flex-col flex-1 p-5">

        {/* Header: icon + name + badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', meta.iconBg)}>
              <Icon size={15} className={meta.iconColor} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{plan.name}</p>
              <p className="text-2xs text-gray-400 dark:text-gray-500 leading-tight mt-0.5">{plan.desc}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
            {isPopular && !isCurrentPlan && (
              <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-[#1a5c3a] text-white">
                Popular
              </span>
            )}
            {isCurrentPlan && (
              <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] border border-[#c8e6d4] flex items-center gap-1">
                <CheckCircle size={9} />
                Current
              </span>
            )}
          </div>
        </div>

        {/* Price block */}
        <div className="mb-4">
          {plan.custom ? (
            <span className="text-3xl font-black text-gray-900 dark:text-white leading-none">Custom</span>
          ) : (
            <div className="flex items-end gap-1">
              <span className="text-3xl font-black text-gray-900 dark:text-white leading-none">
                ₹{tier.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">/ mo</span>
            </div>
          )}

          <p className="text-2xs text-gray-400 dark:text-gray-500 mt-1">
            {tier.billedAs}
            {tier.savings && (
              <span className="ml-1.5 font-semibold text-[#1a5c3a]">{tier.savings}</span>
            )}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#f5f5f5] dark:bg-white/10 mb-4" />

        {/* Features list */}
        <ul className="space-y-2 flex-1 mb-5">
          {(plan.features ?? []).map((f) => (
            <li key={f} className="flex items-start gap-2">
              <div className={cn(
                'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                meta.checkBg,
              )}>
                <Check size={9} className={meta.checkColor} strokeWidth={3} />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <button
          onClick={() => !isCurrentPlan && onSelect(plan.id)}
          disabled={isCurrentPlan}
          className={cn(
            'w-full h-9 rounded-xl text-sm font-semibold transition-all mt-auto',
            isCurrentPlan
              ? 'bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] cursor-default'
              : isUpgrade
              ? 'btn-primary'
              : 'btn-outline',
          )}
        >
          {isCurrentPlan
            ? '✓ Current plan'
            : isUpgrade
            ? 'Upgrade →'
            : 'Switch plan'}
        </button>
      </div>
    </div>
  )
}
