import { Check, CheckCircle, Zap, TrendingUp, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BillingPlan } from '@/types'

interface Props {
  plan: BillingPlan
  isCurrentPlan: boolean
  isAnnual: boolean
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
  description: string
}> = {
  starter: {
    icon: Zap,
    accentBg: 'bg-sky-500',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-500',
    checkBg: 'bg-sky-50',
    checkColor: 'text-sky-500',
    description: 'Perfect for small teams getting started',
  },
  growth: {
    icon: TrendingUp,
    accentBg: 'bg-[#1a5c3a]',
    iconBg: 'bg-[#e8f5ee]',
    iconColor: 'text-[#1a5c3a]',
    checkBg: 'bg-[#e8f5ee]',
    checkColor: 'text-[#1a5c3a]',
    description: 'Scale your outreach with powerful tools',
  },
  enterprise: {
    icon: Crown,
    accentBg: 'bg-purple-600',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    checkBg: 'bg-purple-50',
    checkColor: 'text-purple-600',
    description: 'Full control with dedicated support',
  },
}

const DEFAULT_META = {
  icon: Zap,
  accentBg: 'bg-gray-400',
  iconBg: 'bg-gray-100',
  iconColor: 'text-gray-500',
  checkBg: 'bg-gray-100',
  checkColor: 'text-gray-500',
  description: 'Enterprise-grade power and flexibility',
}

export default function PlanCard({ plan, isCurrentPlan, isAnnual, onSelect, currentPlanOrder, thisPlanOrder }: Props) {
  const price    = isAnnual ? Math.round(plan.price.annual / 12) : plan.price.monthly
  const isPopular = plan.name === 'growth'
  const isUpgrade = thisPlanOrder > currentPlanOrder
  const meta     = PLAN_META[plan.name] ?? DEFAULT_META
  const Icon     = meta.icon
  const annualSavings = plan.price.monthly * 12 - plan.price.annual

  return (
    <div className={cn(
      'relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200',
      'border-2',
      isCurrentPlan
        ? 'border-[#1a5c3a] shadow-lg shadow-[#1a5c3a]/10'
        : 'border-[#e8ebe8] hover:border-gray-300 hover:shadow-md hover:shadow-black/5',
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
              <p className="text-sm font-bold text-gray-900 capitalize leading-tight">{plan.name}</p>
              <p className="text-2xs text-gray-400 leading-tight mt-0.5">{meta.description}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
            {isPopular && !isCurrentPlan && (
              <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-[#1a5c3a] text-white">
                Popular
              </span>
            )}
            {isCurrentPlan && (
              <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-[#e8f5ee] text-[#1a5c3a] border border-[#c8e6d4] flex items-center gap-1">
                <CheckCircle size={9} />
                Current
              </span>
            )}
          </div>
        </div>

        {/* Price block */}
        <div className="mb-4">
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-gray-900 leading-none">
              ₹{price.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-gray-400 mb-0.5">/ mo</span>
          </div>

          {isAnnual ? (
            <p className="text-2xs text-gray-400 mt-1">
              ₹{plan.price.annual.toLocaleString('en-IN')} billed yearly
              {annualSavings > 0 && (
                <span className="ml-1.5 font-semibold text-[#1a5c3a]">
                  Save ₹{annualSavings.toLocaleString('en-IN')}
                </span>
              )}
            </p>
          ) : (
            <p className="text-2xs text-gray-400 mt-1">
              or{' '}
              <span className="font-medium text-gray-600">
                ₹{Math.round(plan.price.annual / 12).toLocaleString('en-IN')}/mo
              </span>
              {' '}billed annually
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#f5f5f5] mb-4" />

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
              <span className="text-xs text-gray-600 leading-relaxed">{f}</span>
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
              ? 'bg-[#e8f5ee] text-[#1a5c3a] cursor-default'
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
