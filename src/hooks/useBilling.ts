import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import type { Subscription, BillingPlan, Payment, PaymentMethod } from '@/types'

const STATUS_MAP: Record<string, Subscription['status']> = {
  ACTIVE: 'active', TRIALING: 'trial', CANCELLED: 'cancelled', PAST_DUE: 'past_due',
}

function unwrap(r: any) {
  // handles both { success, data: T } and direct T responses
  return r.data?.data ?? r.data
}

export function useBillingSubscription() {
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: (): Promise<Subscription | null> =>
      api.get('/billing/subscription').then((r) => {
        const d = unwrap(r)
        if (!d || typeof d !== 'object' || Array.isArray(d)) return null
        return {
          ...d,
          planId: d.planId ?? d.plan ?? '',
          planName: d.planName ?? (d.plan ? d.plan.charAt(0) + d.plan.slice(1).toLowerCase() : ''),
          status: STATUS_MAP[d.status] ?? 'trial',
          currentPeriodEnd: d.currentPeriodEnd ?? d.trialEndsAt ?? null,
          razorpayPlanId: d.razorpayPlanId ?? undefined,
          usage: d.usage ?? { messages: 0, contacts: 0, storage: 0, teamMembers: 0, campaigns: 0 },
        } as Subscription
      }),
  })
}

export function useBillingPlans() {
  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: (): Promise<BillingPlan[]> =>
      api.get('/billing/plans').then((r) => {
        const payload = unwrap(r)
        const raw: any[] = Array.isArray(payload) ? payload : []
        return raw.map((p) => ({
          ...p,
          features: Array.isArray(p.features) ? p.features : [],
          notIncluded: Array.isArray(p.notIncluded) ? p.notIncluded : [],
        })) as BillingPlan[]
      }),
    staleTime: Infinity,
  })
}

// Kept for backwards compatibility with any other invoice-style consumers —
// payment history now comes from usePaymentHistory() (GET /billing/payments).
export function useInvoices() {
  return useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: () => api.get('/billing/invoices').then((r) => r.data),
  })
}

export function usePaymentHistory(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['billing', 'payments', page],
    queryFn: (): Promise<{ payments: Payment[]; total: number }> =>
      api.get('/billing/payments', { params: { page, limit } }).then((r) => {
        const d = unwrap(r)
        return { payments: d?.payments ?? [], total: d?.total ?? 0 }
      }),
    staleTime: 60000,
  })
}

export function useBillingPaymentMethod() {
  return useQuery({
    queryKey: ['billing', 'payment-method'],
    queryFn: (): Promise<PaymentMethod | null> =>
      api.get('/billing/payment-method').then((r) => {
        const d = unwrap(r)
        if (!d || typeof d !== 'object' || !d.paymentMethod) return null
        return d as PaymentMethod
      }),
    staleTime: 60000,
  })
}

// Step 1 of checkout — creates the Razorpay subscription on the backend.
// Step 2 (opening the checkout popup) and step 3 (verify-payment) live in useRazorpay().
export function useCreateSubscription() {
  return useMutation({
    mutationFn: ({ planId, billingCycle }: { planId: string; billingCycle: string }) =>
      api.post('/billing/subscription', { plan: planId, billingCycle }).then((r) => unwrap(r)),
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to initiate checkout'),
  })
}

// Step 3 of checkout — the ONLY step that actually confirms payment.
// The popup's handler() callback just collects the Razorpay IDs; never trust it alone.
export function useVerifyPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      razorpay_subscription_id: string
      razorpay_payment_id: string
      razorpay_signature: string
    }) => api.post('/billing/verify-payment', data).then((r) => unwrap(r)),
    onSuccess: async () => {
      const me = await api.get('/auth/me')
      const user = me.data?.data?.user ?? me.data?.data ?? me.data?.user
      if (user) useAuthStore.getState().setUser(user)
      qc.invalidateQueries({ queryKey: ['billing'] })
      toast.success('Plan activated successfully!')
    },
    // Payment already went through Razorpay at this point — money may be deducted.
    // A toast is easy to miss here, so surface a modal with support contact details instead.
    onError: (_err, variables) =>
      useUIStore.getState().openPaymentIssueModal(variables?.razorpay_payment_id),
  })
}

export function useCancelSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (cancelImmediately: boolean) =>
      api.delete('/billing/subscription', { data: { cancelImmediately } }).then((r) => unwrap(r)),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ['billing'] })
      toast.success(data?.message ?? 'Subscription cancelled')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to cancel subscription'),
  })
}
