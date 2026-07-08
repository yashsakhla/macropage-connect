import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { useCreateSubscription, useVerifyPayment } from './useBilling'
import { useAuthStore } from '@/store/authStore'
import { loadRazorpay } from '@/lib/razorpay'

declare global {
  interface Window {
    Razorpay: any
  }
}

// Full 3-step checkout flow: create subscription -> open Razorpay popup -> verify payment.
// All 3 steps must complete before a plan is considered upgraded.
export function useRazorpay() {
  const { mutateAsync: createSubscription, isPending: creating } = useCreateSubscription()
  const { mutateAsync: verifyPayment, isPending: verifying } = useVerifyPayment()
  const user = useAuthStore((s) => s.user)

  const openCheckout = useCallback(
    async (
      planId: string,
      billingCycle: string,
      onSuccess?: () => void,
      onError?: (err: unknown) => void
    ) => {
      try {
        await loadRazorpay()
        const data = await createSubscription({ planId, billingCycle })

        const rzp = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          subscription_id: data.subscriptionId,
          name: 'Macropage Connect',
          description: `${data.planName ?? planId} — ${billingCycle}`,
          image: '/logo-icon.svg',
          prefill: {
            name: user?.name ?? '',
            email: user?.email ?? '',
            contact: user?.phone ?? '',
          },
          theme: { color: '#1a5c3a' },
          modal: {
            // User closed the popup without paying — not an error, just reset loading.
            ondismiss: () => onError?.(null),
          },
          handler: async (response: {
            razorpay_subscription_id: string
            razorpay_payment_id: string
            razorpay_signature: string
          }) => {
            try {
              await verifyPayment(response)
              onSuccess?.()
            } catch (err) {
              onError?.(err)
            }
          },
        })

        rzp.on('payment.failed', (response: any) => {
          toast.error(response?.error?.description ?? 'Payment failed. Please try again.')
          onError?.(response)
        })

        rzp.open()
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Could not initiate payment. Please try again.')
        onError?.(err)
      }
    },
    [createSubscription, verifyPayment, user]
  )

  return { openCheckout, isLoading: creating || verifying }
}
