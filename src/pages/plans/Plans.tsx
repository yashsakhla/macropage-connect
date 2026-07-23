import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useBillingPlans, useBillingSubscription } from '@/hooks/useBilling'
import { useRazorpay } from '@/hooks/useRazorpay'
import { loadRazorpay } from '@/lib/razorpay'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { BillingCycle, BillingPlan } from '@/types'
import {
  CheckCircle, Zap, ArrowLeft, Crown,
  MessageSquare, Globe, Headphones,
  Sparkles, Check, X, Loader2, Info
} from 'lucide-react'

// ─── Presentation metadata only — icon/colour per plan id.                    ──
// ─── Price, features, badges and highlight always come from the API.         ──

const PLAN_META: Record<string, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  STARTER:    { icon: MessageSquare, iconBg: 'bg-blue-50 dark:bg-blue-950/30',   iconColor: 'text-blue-600 dark:text-blue-400' },
  GROWTH:     { icon: Zap,           iconBg: 'bg-[#e8f5ee] dark:bg-emerald-950/30', iconColor: 'text-[#1a5c3a]' },
  BUSINESS:   { icon: Crown,         iconBg: 'bg-purple-50 dark:bg-purple-950/30', iconColor: 'text-purple-600 dark:text-purple-400' },
  ENTERPRISE: { icon: Globe,         iconBg: 'bg-gray-50 dark:bg-white/5',   iconColor: 'text-gray-600 dark:text-gray-400' },
}
const DEFAULT_META = { icon: MessageSquare, iconBg: 'bg-gray-50 dark:bg-white/5', iconColor: 'text-gray-600 dark:text-gray-400' }

function metaFor(plan: BillingPlan) {
  return PLAN_META[plan.id] ?? DEFAULT_META
}

const CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
}

// ─── Main Plans page ──────────────────────────────────────────────────────────

export default function Plans() {
  const navigate    = useNavigate()
  const location    = useLocation()
  const { user, isPlanExpired, isInTrial, trialDaysLeft, effectivePlan } = useAuthStore()

  const { data: plans, isLoading: plansLoading, isError: plansError } = useBillingPlans()
  const { data: subscription } = useBillingSubscription()
  const { openCheckout } = useRazorpay()

  const [billingCycle, setBillingCycle] = useState<BillingCycle>(user?.billingCycle ?? 'monthly')
  const [processing, setProcessing]     = useState<string | null>(null)

  // Cheapest first, custom (enterprise) plans always last
  const orderedPlans = [...(plans ?? [])].sort((a, b) => {
    const aVal = a.custom ? Infinity : a.pricing.monthly.price
    const bVal = b.custom ? Infinity : b.pricing.monthly.price
    return aVal - bVal
  })
  const planIndex = (id?: string) => orderedPlans.findIndex(p => p.id === id)

  // Cycle toggle savings badge — same discount % across plans, so read it off the first non-custom plan
  const referencePlan = orderedPlans.find(p => !p.custom)
  const cycleSavings = (cycle: BillingCycle) => referencePlan?.pricing[cycle]?.savings

  // The only fully reliable signal: match /billing/subscription's razorpayPlanId
  // against each plan's razorpayPlanIds{monthly,quarterly,yearly} map from /billing/plans.
  // Whichever plan+cycle owns that Razorpay plan id is the one truly active.
  const matchedByRazorpay = (() => {
    if (!subscription?.razorpayPlanId) return null
    for (const plan of orderedPlans) {
      const cycle = (Object.keys(plan.razorpayPlanIds ?? {}) as BillingCycle[])
        .find((c) => plan.razorpayPlanIds?.[c] === subscription.razorpayPlanId)
      if (cycle) return { planId: plan.id, cycle }
    }
    return null
  })()

  // /auth/me's `plan` field can lag or misreport (e.g. shows FREE for an
  // account that's actually on an active paid plan). The razorpayPlanId match
  // above is the primary source of truth; `billingPlan` (set on both plan
  // selection and payment verification) is the next best signal, ahead of the
  // unreliable `plan` field.
  const currentPlanId = (matchedByRazorpay?.planId || subscription?.planId || user?.billingPlan || user?.plan || 'TRIAL').toUpperCase()
  const isTrial = subscription ? subscription.status === 'trial' : isInTrial()

  // Which billing cycle (monthly / quarterly / yearly) the active plan is on —
  // prefer the cycle resolved from the razorpayPlanId match, falling back to
  // /auth/me's billingCycle field. Trial accounts have none.
  const activeCycleLabel = isTrial
    ? 'Free'
    : matchedByRazorpay
    ? CYCLE_LABEL[matchedByRazorpay.cycle]
    : user?.billingCycle
    ? CYCLE_LABEL[user.billingCycle]
    : null

  const expiredPlanLabel = (() => {
    if (!isPlanExpired()) return null
    if (isTrial && trialDaysLeft() <= 0) return 'Free Trial'
    const p = subscription?.planName || effectivePlan()
    return p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : 'Plan'
  })()

  // Days remaining on the currently active plan — trial countdown, or the paid
  // subscription's current billing period end. Only meaningful while not expired.
  const activeDaysLeft = (() => {
    if (expiredPlanLabel) return null
    if (isTrial) return trialDaysLeft()
    if (subscription?.currentPeriodEnd) {
      const diff = Math.ceil(
        (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      return Math.max(0, diff)
    }
    return null
  })()

  // All plans stay visible regardless of what's active — smaller tiers included —
  // so the user can see the full lineup and switch either direction.
  const visiblePlans = orderedPlans

  const highlightPlan = (location.state as { highlightPlan?: string } | null)?.highlightPlan

  useEffect(() => { loadRazorpay() }, [])

  const handleSelectPlan = async (planId: string) => {
    if (currentPlanId === planId) return
    const plan = orderedPlans.find(p => p.id === planId)
    if (plan?.custom) {
      window.open(plan.ctaHref || 'mailto:sales@macropage.in?subject=Enterprise%20Plan%20Inquiry', '_blank')
      return
    }

    setProcessing(planId)
    await openCheckout(
      planId,
      billingCycle,
      () => {
        setProcessing(null)
        navigate('/dashboard')
      },
      () => setProcessing(null)
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8f6] dark:bg-[#0f1724]">

      {/* Top bar */}
      <div className="bg-white dark:bg-[#0b1220] border-b border-[#e8ebe8] dark:border-white/10 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-base font-bold text-gray-900 dark:text-white">Choose your plan</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">Upgrade or change your subscription</p>
          </div>

          <div className="flex items-center">
            <span className="text-xs bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] rounded-full px-3 py-1 font-semibold">
              Current: {currentPlanId}{activeCycleLabel ? ` · ${activeCycleLabel}` : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Expired plan alert */}
        {expiredPlanLabel && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-red-200 shadow-sm">
            <div className="bg-gradient-to-r from-red-700 to-red-600 px-5 py-4 flex items-center gap-4 flex-wrap">
              <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-2xl flex-shrink-0">
                ⏰
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-tight">
                  Your <span className="underline decoration-red-300 underline-offset-2">{expiredPlanLabel}</span> has expired
                </p>
                <p className="text-xs text-red-200 mt-1 leading-relaxed">
                  Your portal is running in limited mode — only Inbox and Settings are available.
                  Pick a plan below to restore full access instantly.
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-xl px-3 py-1.5">
                <span className="text-base">🔒</span>
                <span className="text-xs font-semibold text-red-100">Access restricted</span>
              </div>
            </div>
          </div>
        )}

        {/* Trial status banner */}
        {isTrial && user?.trialEndsAt && (
          <div className="bg-[#e8f5ee] dark:bg-emerald-950/30 border border-[#c8e6d4] rounded-2xl px-5 py-4 mb-8 flex items-center gap-3 flex-wrap">
            <div className="w-9 h-9 bg-[#1a5c3a] rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#085041]">Free trial active</p>
              <p className="text-xs text-[#1a5c3a]/70 mt-0.5">
                You have full Growth access until{' '}
                <strong>{format(new Date(user.trialEndsAt), 'MMMM d, yyyy')}</strong>.
                Select a plan to continue after that.
              </p>
            </div>
            <span className="bg-[#1a5c3a] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0">
              {useAuthStore.getState().trialDaysLeft()} days left
            </span>
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-1.5 flex gap-1 shadow-sm">
            {(Object.keys(CYCLE_LABEL) as BillingCycle[]).map(cycle => {
              const savings = cycleSavings(cycle)
              return (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={cn(
                    'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2',
                    billingCycle === cycle ? 'bg-[#1a5c3a] text-white shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                  )}
                >
                  {CYCLE_LABEL[cycle]}
                  {savings && (
                    <span className={cn(
                      'text-2xs font-bold px-2 py-0.5 rounded-full',
                      billingCycle === cycle ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                    )}>
                      {savings}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {plansLoading ? (
          <div className="py-24 text-center text-gray-400 dark:text-gray-500 text-sm">Loading plans…</div>
        ) : plansError || orderedPlans.length === 0 ? (
          <div className="py-24 text-center text-red-400 text-sm">Failed to load plans. Please try again later.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {visiblePlans.map(plan => {
              const meta          = metaFor(plan)
              const tier           = plan.pricing[billingCycle]
              // A plan only counts as "active" while it hasn't expired — once
              // expired we fall back to a plain plan picker with nothing pre-selected.
              // When we know the exact active cycle (via razorpayPlanId match), the
              // "Current plan" ribbon must only show on that cycle's toggle — otherwise
              // e.g. a Monthly Growth subscriber would see Growth marked "current" on
              // the Quarterly/Yearly tabs too.
              const isCurrent     = !expiredPlanLabel && currentPlanId === plan.id &&
                (!matchedByRazorpay || matchedByRazorpay.cycle === billingCycle)
              const isPopular     = plan.highlight
              const isProcessing  = processing === plan.id
              const isHighlighted = highlightPlan === plan.id
              const ribbon        = isCurrent ? '✓ Current plan' : plan.badge

              return (
                <div
                  key={plan.id}
                  className={cn(
                    'bg-white dark:bg-[#0b1220] rounded-2xl border-2 flex flex-col transition-all duration-200 relative',
                    isCurrent
                      ? 'border-[#1a5c3a] bg-[#f0faf5] dark:bg-emerald-950/30'
                      : isPopular || isHighlighted
                      ? 'border-[#1a5c3a] shadow-xl shadow-[#1a5c3a]/10'
                      : 'border-[#e8ebe8] dark:border-white/10 hover:border-[#c8e6d4] hover:shadow-md'
                  )}
                >
                  {ribbon && (
                    <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                      <span className={cn(
                        'text-xs font-bold px-4 py-1 rounded-full',
                        isCurrent ? 'bg-[#1a5c3a] text-white' : 'bg-amber-400 text-amber-900'
                      )}>
                        {isCurrent ? ribbon : `⭐ ${ribbon}`}
                      </span>
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', meta.iconBg)}>
                        <meta.icon size={18} className={meta.iconColor} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{plan.desc}</p>
                      </div>
                    </div>

                    <div className="mb-5">
                      {plan.custom ? (
                        <div>
                          <span className="text-2xl font-black text-gray-900 dark:text-white">Custom</span>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Talk to our sales team</p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-end gap-1">
                            <span className="text-xs text-gray-400 dark:text-gray-500 mb-1">₹</span>
                            <span className="text-3xl font-black text-gray-900 dark:text-white">
                              {tier.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-sm text-gray-400 dark:text-gray-500 mb-1">/mo</span>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {tier.billedAs}
                            {tier.savings && (
                              <span className="ml-1.5 font-semibold text-[#1a5c3a]">{tier.savings}</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {isCurrent ? (
                      // Same footprint as the CTA button below (w-full h-11) so this
                      // card doesn't grow taller than its siblings in the grid.
                      <div className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mb-5 bg-gradient-to-r from-[#123c28] to-[#1a5c3a] text-white">
                        <Check size={15} />
                        <span>
                          This plan is active
                          {activeDaysLeft !== null && ` · ${activeDaysLeft} day${activeDaysLeft === 1 ? '' : 's'} left`}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={!!processing}
                        className={cn(
                          'w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2',
                          'transition-all active:scale-[0.98] mb-5 disabled:opacity-50',
                          isPopular || plan.custom
                            ? 'bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white'
                            : 'border-2 border-[#1a5c3a] text-[#1a5c3a] hover:bg-[#e8f5ee] dark:hover:bg-emerald-950/30'
                        )}
                      >
                        {isProcessing ? (
                          <><Loader2 size={15} className="animate-spin" /> Processing...</>
                        ) : plan.custom ? (
                          <><Headphones size={15} /> Contact sales</>
                        ) : (
                          <>
                            <Zap size={15} />
                            {!isTrial && planIndex(plan.id) > planIndex(currentPlanId)
                              ? 'Upgrade'
                              : 'Select plan'
                            }
                          </>
                        )}
                      </button>
                    )}

                    <ul className="space-y-2.5 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-xs">
                          <CheckCircle size={14} className="text-[#1a5c3a] flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed text-gray-600 dark:text-gray-400">{f}</span>
                        </li>
                      ))}
                      {plan.notIncluded.map(f => (
                        <li key={f} className="flex items-start gap-2 text-xs opacity-40">
                          <X size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed text-gray-400 dark:text-gray-500 line-through">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Meta charges disclaimer */}
        <div className="bg-[#f7f8f6] dark:bg-[#0f1724] border border-[#e8ebe8] dark:border-white/10 rounded-2xl px-5 py-4 max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <Info size={15} className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">About WhatsApp message charges</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                All plans include unlimited WhatsApp messages. WhatsApp conversation charges are billed directly
                by Meta to your WhatsApp Business account — separate from your Macropage Connect subscription.
                India rates: Marketing ₹0.86 · Utility ₹0.115 · Authentication ₹0.115 per message (+ 18% GST).
                Customer replies within 24 hours are free.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            All plans include SSL encryption · 99.9% uptime SLA · GDPR compliant · Indian data residency
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Questions?{' '}
            <a href="mailto:support@macropage.in" className="text-[#1a5c3a] underline">
              support@macropage.in
            </a>
            {' '}or{' '}
            <button onClick={() => navigate('/help')} className="text-[#1a5c3a] underline">
              visit help center
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
