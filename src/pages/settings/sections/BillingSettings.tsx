import { useState } from 'react'
import { CheckCircle, Download, Info, Loader2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import SettingsSection from '@/components/settings/SettingsSection'
import PlanCard from '@/components/settings/PlanCard'
import InvoiceTable from '@/components/settings/InvoiceTable'
import { useBillingSubscription, useBillingPlans, usePaymentHistory, useCancelSubscription } from '@/hooks/useBilling'
import { useRazorpay } from '@/hooks/useRazorpay'
import type { BillingCycle, Invoice } from '@/types'

const PLAN_ORDER: Record<string, number> = { STARTER: 0, GROWTH: 1, BUSINESS: 2, ENTERPRISE: 3 }
const CYCLE_LABEL: Record<BillingCycle, string> = { monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' }

const METERS = [
  { label: 'Messages sent', key: 'messages', limit: 50000 },
  { label: 'Contacts', key: 'contacts', limit: 10000 },
  { label: 'Team members', key: 'teamMembers', limit: 10 },
]

export default function BillingSettings() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [switchingPlan, setSwitchingPlan] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [page, setPage] = useState(1)

  const { data: subscription, isLoading: subLoading, isError: subError } = useBillingSubscription()
  const { data: plans, isLoading: plansLoading } = useBillingPlans()
  const { data: paymentsData, isLoading: paymentsLoading } = usePaymentHistory(page)
  const { openCheckout } = useRazorpay()
  const { mutate: cancelSubscription, isPending: cancelling } = useCancelSubscription()

  const allPlans = plans ?? []
  const allInvoices: Invoice[] = (paymentsData?.payments ?? []).map((p) => ({
    id: p._id,
    number: `${p.plan}-${p.billingCycle}`,
    amount: p.amount / 100,
    currency: 'INR',
    status: p.status === 'success' ? 'paid' : p.status === 'failed' ? 'failed' : 'pending',
    paidAt: p.createdAt,
    createdAt: p.createdAt,
    downloadUrl: p.invoiceUrl,
  }))
  const currentPlanOrder = PLAN_ORDER[subscription?.planId ?? ''] ?? -1

  const handleSelectPlan = async (planId: string) => {
    const plan = allPlans.find(p => p.id === planId)
    if (plan?.custom) {
      window.open(plan.ctaHref || 'mailto:sales@macropage.in?subject=Enterprise%20Plan%20Inquiry', '_blank')
      return
    }

    setSwitchingPlan(planId)
    await openCheckout(
      planId,
      billingCycle,
      () => setSwitchingPlan(null),
      () => setSwitchingPlan(null)
    )
  }

  if (subLoading || plansLoading) return (
    <SettingsSection title="Billing & Plans" subtitle="Manage your subscription and payment details">
      <div className="py-16 text-center text-gray-400 text-sm">Loading billing information…</div>
    </SettingsSection>
  )

  if (subError || !subscription) return (
    <SettingsSection title="Billing & Plans" subtitle="Manage your subscription and payment details">
      <div className="py-16 text-center text-red-400 text-sm">Failed to load billing information.</div>
    </SettingsSection>
  )

  return (
    <SettingsSection title="Billing & Plans" subtitle="Manage your subscription and payment details">
      {/* Current plan */}
      <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 flex items-start justify-between" style={{ background: 'linear-gradient(135deg, #1a3d2b, #1a5c3a)' }}>
          <div>
            <p className="text-xl font-bold text-white capitalize">{subscription.planName} Plan</p>
            <p className="text-sm text-white/70 mt-1">
              {subscription.status === 'trial'
                ? `Free trial · ends ${subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}`
                : `₹${allPlans.find(p => p.id === subscription.planId)?.pricing?.monthly?.price?.toLocaleString('en-IN') ?? '—'} / month · Billed monthly`
              }
            </p>
          </div>
          <button className="bg-white/20 hover:bg-white/30 rounded-xl px-4 h-9 text-sm font-medium text-white transition-colors">Change plan</button>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-2 mb-6">
            {['10 team members', '50,000 messages/month', 'Unlimited campaigns', 'AI chatbot included', 'WhatsApp flows', 'Priority support'].map(f => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle size={13} className="text-[#1a5c3a] flex-shrink-0" />
                <span className="text-sm text-gray-700">{f}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#e8ebe8] pt-5">
            <p className="text-sm font-semibold text-gray-800 mb-4">This month's usage</p>
            {METERS.map(({ label, key, limit }) => {
              const used = subscription.usage[key as keyof typeof subscription.usage] as number
              const pct = (used / limit) * 100
              return (
                <div key={key} className="flex items-center gap-4 mb-4">
                  <span className="text-sm text-gray-600 w-36 flex-shrink-0">{label}</span>
                  <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className={cn('h-2 rounded-full transition-all', pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-[#1a5c3a]')} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-28 text-right flex-shrink-0">{used.toLocaleString('en-IN')} / {limit.toLocaleString('en-IN')}</span>
                </div>
              )
            })}
          </div>

          <div className="border-t border-[#e8ebe8] pt-5 flex justify-between">
            <div>
              <p className="text-xs text-gray-500">{subscription.status === 'trial' ? 'Trial ends' : 'Next billing date'}</p>
              <p className="text-sm font-semibold mt-0.5">
                {subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {subscription.status === 'trial' ? 'Free' : `₹${allPlans.find(p => p.id === subscription.planId)?.pricing?.monthly?.price?.toLocaleString('en-IN') ?? '—'}`}
              </p>
              <p className="text-xs text-gray-400">{subscription.cancelAtPeriodEnd ? 'Cancels at period end' : 'Auto-renews'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan comparison */}
      <div className="bg-white border border-[#e8ebe8] rounded-2xl p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-gray-800">Available plans</p>
          <div className="flex gap-1 bg-[#f7f8f6] rounded-xl p-1">
            {(Object.keys(CYCLE_LABEL) as BillingCycle[]).map((cycle) => {
              const savings = allPlans.find(p => !p.custom)?.pricing[cycle]?.savings
              return (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={cn('px-4 py-1.5 text-xs font-medium rounded-lg transition-all', billingCycle === cycle ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')}
                >
                  {CYCLE_LABEL[cycle]} {savings && <span className="text-[#1a5c3a]">{savings}</span>}
                </button>
              )
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {allPlans.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={plan.id === subscription.planId}
              billingCycle={billingCycle}
              onSelect={handleSelectPlan}
              currentPlanOrder={currentPlanOrder}
              thisPlanOrder={i}
            />
          ))}
        </div>
        {switchingPlan && (
          <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-4">
            <Loader2 size={12} className="animate-spin" /> Opening checkout…
          </p>
        )}
      </div>

      {/* Cancel subscription */}
      {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
        <div className="bg-white border border-[#e8ebe8] rounded-2xl p-6 mt-6">
          {showCancelConfirm ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-4">
              <p className="text-sm font-semibold text-red-800 mb-1 flex items-center gap-1.5">
                <AlertCircle size={14} /> Cancel subscription?
              </p>
              <p className="text-xs text-red-600 mb-3">
                You'll keep access until{' '}
                {subscription.currentPeriodEnd
                  ? format(new Date(subscription.currentPeriodEnd), 'dd MMM yyyy')
                  : 'the end of the current period'}
                . After that your plan reverts to Starter.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => cancelSubscription(false, { onSuccess: () => setShowCancelConfirm(false) })}
                  disabled={cancelling}
                  className="h-9 px-4 bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {cancelling ? <Loader2 size={13} className="animate-spin" /> : 'Yes, cancel'}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="h-9 px-4 border border-[#e8ebe8] rounded-xl text-xs font-medium text-gray-600"
                >
                  Keep subscription
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowCancelConfirm(true)} className="text-xs text-red-500 hover:underline font-medium">
              Cancel subscription
            </button>
          )}
        </div>
      )}

      {/* Payment method */}
      <div className="bg-white border border-[#e8ebe8] rounded-2xl p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-800">Payment method</p>
          <button className="btn-outline h-9 text-sm">+ Add payment method</button>
        </div>
        <div className="bg-[#f7f8f6] border border-[#e8ebe8] rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-7 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
          <div className="flex-1">
            <p className="text-sm font-mono">•••• •••• •••• 4242</p>
            <p className="text-xs text-gray-500">Expires 12/26</p>
          </div>
          <span className="text-2xs bg-[#e8f5ee] text-[#1a5c3a] rounded-full px-2 py-0.5">Primary</span>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden mt-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8ebe8]">
          <p className="text-sm font-semibold text-gray-800">Invoices</p>
          <button className="btn-ghost text-sm flex items-center gap-1.5"><Download size={13} /> Export all</button>
        </div>
        <div className="px-2">
          {paymentsLoading ? (
            <div className="py-10 text-center text-gray-400 text-sm">Loading payment history…</div>
          ) : allInvoices.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">No payment history yet</div>
          ) : (
            <InvoiceTable invoices={allInvoices} />
          )}
        </div>
        {(paymentsData?.total ?? 0) > 10 && (
          <div className="flex justify-center gap-2 px-6 py-4 border-t border-[#e8ebe8]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 px-3 rounded-xl border border-[#e8ebe8] text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 10 >= (paymentsData?.total ?? 0)}
              className="h-8 px-3 rounded-xl border border-[#e8ebe8] text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Meta note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 flex gap-3">
        <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">Meta messaging charges are billed separately by Meta to your WhatsApp Business Account. Your Macropage Connect subscription covers platform access only.</p>
      </div>
    </SettingsSection>
  )
}
