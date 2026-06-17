import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { loadRazorpay } from '@/lib/razorpay'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import {
  CheckCircle, Zap, ArrowLeft, Crown,
  MessageSquare, Globe, Headphones,
  Sparkles, Check, Minus, Loader2
} from 'lucide-react'

// ─── Plan data ────────────────────────────────────────────────────────────────

const PLAN_ORDER = ['STARTER', 'GROWTH', 'BUSINESS', 'ENTERPRISE']

const PLAN_DATA = [
  {
    id:           'STARTER',
    name:         'Starter',
    tagline:      'For small teams',
    monthlyPrice: 999,
    annualPrice:  833,
    icon:         MessageSquare,
    iconBg:       'bg-blue-50',
    iconColor:    'text-blue-600',
    features: [
      { label: '3 team members',       included: true  },
      { label: '5,000 contacts',        included: true  },
      { label: '1 WhatsApp number',     included: true  },
      { label: 'Live inbox',            included: true  },
      { label: 'Unlimited campaigns',   included: true  },
      { label: 'Message templates',     included: true  },
      { label: 'Basic auto-replies',    included: true  },
      { label: 'Flow builder',          included: false },
      { label: 'AI chatbot',            included: false },
      { label: 'API access',            included: false },
      { label: 'Advanced analytics',    included: false },
      { label: 'CRM integrations',      included: false },
    ],
  },
  {
    id:           'GROWTH',
    name:         'Growth',
    tagline:      'Most popular',
    monthlyPrice: 2499,
    annualPrice:  2083,
    icon:         Zap,
    iconBg:       'bg-[#e8f5ee]',
    iconColor:    'text-[#1a5c3a]',
    features: [
      { label: '10 team members',       included: true  },
      { label: '25,000 contacts',        included: true  },
      { label: '2 WhatsApp numbers',     included: true  },
      { label: 'Everything in Starter', included: true  },
      { label: 'Visual flow builder',   included: true  },
      { label: 'AI chatbot (500/mo)',    included: true  },
      { label: 'REST API access',       included: true  },
      { label: 'Webhooks',              included: true  },
      { label: 'Zapier integration',    included: true  },
      { label: 'Advanced analytics',    included: false },
      { label: 'CRM integrations',      included: false },
    ],
  },
  {
    id:           'BUSINESS',
    name:         'Business',
    tagline:      'For larger teams',
    monthlyPrice: 5999,
    annualPrice:  4999,
    icon:         Crown,
    iconBg:       'bg-purple-50',
    iconColor:    'text-purple-600',
    features: [
      { label: '25 team members',         included: true },
      { label: '1,00,000 contacts',        included: true },
      { label: '5 WhatsApp numbers',       included: true },
      { label: 'Everything in Growth',     included: true },
      { label: 'AI chatbot (5,000/mo)',     included: true },
      { label: 'Advanced analytics',       included: true },
      { label: 'CRM integrations',         included: true },
      { label: 'Custom knowledge base',    included: true },
      { label: 'Dedicated onboarding',     included: true },
      { label: 'Phone support',            included: true },
    ],
  },
  {
    id:           'ENTERPRISE',
    name:         'Enterprise',
    tagline:      'Custom everything',
    monthlyPrice: 0,
    annualPrice:  0,
    icon:         Globe,
    iconBg:       'bg-gray-50',
    iconColor:    'text-gray-600',
    features: [
      { label: 'Unlimited team members',    included: true },
      { label: 'Unlimited contacts',        included: true },
      { label: 'Unlimited WA numbers',      included: true },
      { label: 'Everything in Business',    included: true },
      { label: 'White-label portal',        included: true },
      { label: 'Custom domain',             included: true },
      { label: 'Reseller dashboard',        included: true },
      { label: 'SLA guarantee',             included: true },
      { label: 'Dedicated account manager', included: true },
      { label: 'Custom integrations',       included: true },
    ],
  },
]

// ─── Feature comparison rows ──────────────────────────────────────────────────

const COMPARISON_ROWS = [
  { label: 'Team members',       values: ['3', '10', '25', 'Unlimited'] },
  { label: 'Contacts',           values: ['5,000', '25,000', '1,00,000', 'Unlimited'] },
  { label: 'WhatsApp numbers',   values: ['1', '2', '5', 'Unlimited'] },
  { label: 'Live inbox',         values: [true, true, true, true] },
  { label: 'Campaigns',          values: [true, true, true, true] },
  { label: 'Templates',          values: [true, true, true, true] },
  { label: 'Basic auto-replies', values: [true, true, true, true] },
  { label: 'Flow builder',       values: [false, true, true, true] },
  { label: 'AI chatbot',         values: [false, '500/mo', '5,000/mo', 'Unlimited'] },
  { label: 'REST API & webhooks',values: [false, true, true, true] },
  { label: 'Zapier integration', values: [false, true, true, true] },
  { label: 'Advanced analytics', values: [false, false, true, true] },
  { label: 'CRM integrations',   values: [false, false, true, true] },
  { label: 'Custom knowledge base', values: [false, false, true, true] },
  { label: 'White label',        values: [false, false, false, true] },
  { label: 'Custom domain',      values: [false, false, false, true] },
  { label: 'Dedicated support',  values: [false, false, 'Phone', 'Account manager'] },
]

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true)
    return <CheckCircle size={16} className="text-[#1a5c3a] mx-auto" />
  if (value === false)
    return <Minus size={14} className="text-gray-200 mx-auto" />
  return <span className="text-xs text-gray-700 font-medium">{value}</span>
}

function FeatureComparisonTable({
  billingCycle,
  currentPlan,
  onSelectPlan,
  processing,
}: {
  billingCycle: 'monthly' | 'annual'
  currentPlan?: string
  onSelectPlan: (id: string) => void
  processing: string | null
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8ebe8] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e8ebe8]">
            <th className="text-left p-4 text-gray-500 font-medium w-48">Feature</th>
            {PLAN_DATA.map(plan => {
              const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice
              const isCurrent = currentPlan === plan.id
              return (
                <th key={plan.id} className={cn('p-4 text-center', isCurrent && 'bg-[#f0faf5]')}>
                  <div className="font-bold text-gray-900">{plan.name}</div>
                  {plan.id !== 'ENTERPRISE' ? (
                    <div className="text-xs text-gray-400 mt-0.5">
                      ₹{price.toLocaleString('en-IN')}/mo
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 mt-0.5">Custom</div>
                  )}
                  {!isCurrent && (
                    <button
                      onClick={() => onSelectPlan(plan.id)}
                      disabled={!!processing}
                      className={cn(
                        'mt-2 h-7 px-3 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50',
                        plan.id === 'ENTERPRISE'
                          ? 'bg-[#1a5c3a] text-white hover:bg-[#2d7a4f]'
                          : 'border border-[#1a5c3a] text-[#1a5c3a] hover:bg-[#e8f5ee]'
                      )}
                    >
                      {processing === plan.id
                        ? 'Processing…'
                        : plan.id === 'ENTERPRISE'
                        ? 'Contact sales'
                        : 'Select'}
                    </button>
                  )}
                  {isCurrent && (
                    <span className="mt-2 inline-block text-xs bg-[#1a5c3a] text-white rounded-lg px-3 py-1 font-semibold">
                      Current
                    </span>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row, i) => (
            <tr key={row.label} className={cn('border-b border-[#f0f0f0]', i % 2 === 0 && 'bg-[#fafafa]')}>
              <td className="p-4 text-gray-600 text-xs font-medium">{row.label}</td>
              {row.values.map((v, ci) => (
                <td key={ci} className={cn('p-4 text-center', currentPlan === PLAN_DATA[ci].id && 'bg-[#f0faf5]/60')}>
                  <ComparisonCell value={v} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main Plans page ──────────────────────────────────────────────────────────

export default function Plans() {
  const navigate    = useNavigate()
  const location    = useLocation()
  const qc          = useQueryClient()
  const { user, setUser } = useAuthStore()

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [processing, setProcessing]     = useState<string | null>(null)

  const highlightPlan = (location.state as { highlightPlan?: string } | null)?.highlightPlan

  useEffect(() => { loadRazorpay() }, [])

  const handleSelectPlan = async (planId: string) => {
    if (user?.plan === planId) return
    if (planId === 'ENTERPRISE') {
      window.open('mailto:sales@macropage.in?subject=Enterprise%20Plan%20Inquiry', '_blank')
      return
    }

    setProcessing(planId)
    try {
      const { data: resp } = await api.post('/billing/subscribe', { planId, billingCycle })
      const subscriptionData = resp.data ?? resp

      const rzp = new (window as any).Razorpay({
        key:             import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: subscriptionData.subscriptionId,
        name:            'Macropage Connect',
        description:     `${planId} Plan — ${billingCycle}`,
        image:           '/logo.png',
        prefill: {
          name:    user?.name,
          email:   user?.email,
          contact: user?.phone ?? '',
        },
        notes: {
          planId,
          billingCycle,
          tenantId: user?.companyId,
        },
        theme: { color: '#1a5c3a' },

        handler: async (response: any) => {
          try {
            await api.post('/billing/verify-payment', { ...response, planId, billingCycle })
            const meRes = await api.get('/auth/me')
            setUser(meRes.data.data)
            qc.invalidateQueries({ queryKey: ['me'] })
            toast.success('Plan activated successfully!')
            navigate('/dashboard')
          } catch {
            toast.error('Payment verification failed. Please contact support.')
          } finally {
            setProcessing(null)
          }
        },

        modal: {
          ondismiss: () => setProcessing(null),
          escape: false,
        },
      })
      rzp.open()
    } catch {
      setProcessing(null)
      toast.error('Could not start checkout. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f6]">

      {/* Top bar */}
      <div className="bg-white border-b border-[#e8ebe8] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-base font-bold text-gray-900">Choose your plan</h1>
            <p className="text-xs text-gray-400 hidden sm:block">Upgrade or change your subscription</p>
          </div>

          <div className="flex items-center">
            <span className="text-xs bg-[#e8f5ee] text-[#1a5c3a] rounded-full px-3 py-1 font-semibold">
              Current: {user?.plan ?? 'TRIAL'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Trial status banner */}
        {user?.plan === 'TRIAL' && user?.trialEndsAt && (
          <div className="bg-[#e8f5ee] border border-[#c8e6d4] rounded-2xl px-5 py-4 mb-8 flex items-center gap-3 flex-wrap">
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
          <div className="bg-white border border-[#e8ebe8] rounded-2xl p-1.5 flex gap-1 shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                'px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                billingCycle === 'monthly' ? 'bg-[#1a5c3a] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={cn(
                'px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2',
                billingCycle === 'annual' ? 'bg-[#1a5c3a] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              Annual
              <span className={cn(
                'text-2xs font-bold px-2 py-0.5 rounded-full',
                billingCycle === 'annual' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
              )}>
                2 months free
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {PLAN_DATA.map(plan => {
            const price        = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice
            const isCurrent    = user?.plan === plan.id
            const isPopular    = plan.id === 'GROWTH'
            const isProcessing = processing === plan.id
            const isEnterprise = plan.id === 'ENTERPRISE'
            const isHighlighted = highlightPlan === plan.id

            return (
              <div
                key={plan.id}
                className={cn(
                  'bg-white rounded-2xl border-2 flex flex-col transition-all duration-200 relative',
                  isCurrent
                    ? 'border-[#1a5c3a] bg-[#f0faf5]'
                    : isPopular || isHighlighted
                    ? 'border-[#1a5c3a] shadow-xl shadow-[#1a5c3a]/10'
                    : 'border-[#e8ebe8] hover:border-[#c8e6d4] hover:shadow-md'
                )}
              >
                {(isPopular || isCurrent) && (
                  <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                    <span className={cn(
                      'text-xs font-bold px-4 py-1 rounded-full',
                      isCurrent ? 'bg-[#1a5c3a] text-white' : 'bg-amber-400 text-amber-900'
                    )}>
                      {isCurrent ? '✓ Current plan' : '⭐ Most popular'}
                    </span>
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', plan.iconBg)}>
                      <plan.icon size={18} className={plan.iconColor} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-xs text-gray-400">{plan.tagline}</p>
                    </div>
                  </div>

                  <div className="mb-5">
                    {isEnterprise ? (
                      <div>
                        <span className="text-2xl font-black text-gray-900">Custom</span>
                        <p className="text-xs text-gray-400 mt-0.5">Talk to our sales team</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-end gap-1">
                          <span className="text-xs text-gray-400 mb-1">₹</span>
                          <span className="text-3xl font-black text-gray-900">
                            {price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-sm text-gray-400 mb-1">/mo</span>
                        </div>
                        {billingCycle === 'annual' && (
                          <p className="text-xs text-[#1a5c3a] mt-0.5">
                            ₹{(price * 10).toLocaleString('en-IN')} billed annually
                          </p>
                        )}
                        {billingCycle === 'monthly' && plan.annualPrice > 0 && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Save ₹{((plan.monthlyPrice - plan.annualPrice) * 12).toLocaleString('en-IN')}/yr with annual
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrent || !!processing}
                    className={cn(
                      'w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2',
                      'transition-all active:scale-[0.98] mb-5 disabled:opacity-50',
                      isCurrent
                        ? 'bg-[#e8f5ee] text-[#1a5c3a] cursor-default'
                        : isPopular || isEnterprise
                        ? 'bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white'
                        : 'border-2 border-[#1a5c3a] text-[#1a5c3a] hover:bg-[#e8f5ee]'
                    )}
                  >
                    {isCurrent ? (
                      <><Check size={15} /> Current plan</>
                    ) : isProcessing ? (
                      <><Loader2 size={15} className="animate-spin" /> Processing...</>
                    ) : isEnterprise ? (
                      <><Headphones size={15} /> Contact sales</>
                    ) : (
                      <>
                        <Zap size={15} />
                        {user?.plan && user.plan !== 'TRIAL' &&
                          PLAN_ORDER.indexOf(plan.id) > PLAN_ORDER.indexOf(user.plan)
                          ? 'Upgrade'
                          : 'Select plan'
                        }
                      </>
                    )}
                  </button>

                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map(f => (
                      <li key={f.label} className="flex items-start gap-2 text-xs">
                        {f.included ? (
                          <CheckCircle size={14} className="text-[#1a5c3a] flex-shrink-0 mt-0.5" />
                        ) : (
                          <Minus size={14} className="text-gray-200 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={cn('leading-relaxed', f.included ? 'text-gray-600' : 'text-gray-300')}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* Feature comparison table — desktop only */}
        <div className="hidden lg:block">
          <h2 className="text-lg font-bold text-gray-900 text-center mb-5">Full feature comparison</h2>
          <FeatureComparisonTable
            billingCycle={billingCycle}
            currentPlan={user?.plan}
            onSelectPlan={handleSelectPlan}
            processing={processing}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-10 space-y-2">
          <p className="text-xs text-gray-400">
            All plans include SSL encryption · 99.9% uptime SLA · GDPR compliant · Indian data residency
          </p>
          <p className="text-xs text-gray-400">
            WhatsApp message charges are billed separately by Meta.
          </p>
          <p className="text-xs text-gray-400">
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
