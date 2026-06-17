import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import type { Subscription, BillingPlan } from '@/types'

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
          name: (p.name ?? '').toLowerCase() as BillingPlan['name'],
          price: typeof p.price === 'number'
            ? { monthly: p.price, annual: Math.round(p.price * 12 * 0.8) }
            : (p.price ?? { monthly: 0, annual: 0 }),
          features: Array.isArray(p.features) ? p.features : [],
          limits: p.limits ?? {},
        })) as BillingPlan[]
      }),
    staleTime: Infinity,
  })
}

export function useInvoices() {
  return useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: () => api.get('/billing/invoices').then((r) => r.data),
  })
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (planId: string) =>
      api.post('/billing/subscribe', { planId }).then((r) => r.data),
    onSuccess: (resp: unknown) => {
      const respData = (resp as { data?: Record<string, unknown> })?.data ?? {}
      type RazorpayConstructor = (
        opts: Record<string, unknown>
      ) => { open: () => void }
      const RazorpayClass = (
        window as unknown as { Razorpay: RazorpayConstructor }
      ).Razorpay
      const instance = new (
        RazorpayClass as unknown as new (
          opts: Record<string, unknown>
        ) => { open: () => void }
      )({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: respData.subscriptionId,
        name: 'Macropage Connect',
        description: respData.planName,
        handler: (response: unknown) =>
          api.post('/billing/verify-payment', response),
      })
      instance.open()
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to initiate checkout'),
  })
}

export function useCancelSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/billing/cancel').then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing'] })
      toast.success('Subscription cancelled')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to cancel subscription'),
  })
}
