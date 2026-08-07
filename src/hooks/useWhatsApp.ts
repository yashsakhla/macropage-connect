import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import type { SetupStatus } from '@/types/setup'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/types'

type MutationError = AxiosError<ApiErrorResponse & { error?: { message?: string; code?: string } }>

export function useWABADetails() {
  return useQuery({
    queryKey: ['waba-details'],
    queryFn: () =>
      api.get('/whatsapp/details').then(r => r.data?.data ?? r.data),
    staleTime: 2 * 60 * 1000,
    retry: 2,
  })
}

export function useShareWABADetails() {
  return useMutation({
    mutationFn: (email?: string) =>
      api.post('/whatsapp/share-details', { email }).then(r => r.data?.data ?? r.data),
    onSuccess: (data: { message?: string }) => {
      toast.success(data?.message ?? 'Details sent!')
    },
    onError: (err: MutationError) => {
      toast.error(err?.response?.data?.message ?? 'Could not send details')
    },
  })
}

// `poll: true` keeps refetching every 10s so template approval status (Meta
// review) updates automatically without a manual refresh — only the
// completion step needs that; the rest of the setup wizard advances via
// explicit refetchStatus() calls at each step transition, so it stays off
// by default to avoid hitting /whatsapp/status continuously everywhere else
// this hook is used (sidebar, layout, banners, etc).
export function useWhatsAppSetupStatus(options?: { poll?: boolean }) {
  return useQuery<SetupStatus>({
    queryKey: ['whatsapp-setup-status'],
    queryFn: () =>
      api.get('/whatsapp/status').then(r => {
        // Handle both response shapes: { data: {...} } or direct {...}
        return r.data?.data ?? r.data
      }),
    staleTime: 30000,
    // Stop the 10s poll once the request is failing — otherwise a down/
    // erroring backend gets hammered forever instead of backing off.
    refetchInterval: (query) => {
      if (!options?.poll) return false
      return query.state.status === 'error' ? false : 10000
    },
    retry: 2,
  })
}

export function useBusinessInfo(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['whatsapp-business-info'],
    queryFn: () =>
      api.get('/whatsapp/setup/business-info').then(r => r.data?.data ?? r.data),
    enabled: options?.enabled ?? true,
    staleTime: 30000,
    retry: 2,
  })
}

export function useSaveBusinessInfo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      businessName: string
      category:     string
      description?: string
      website?:     string
      address?:     string
      email?:       string
    }) =>
      api.post('/whatsapp/setup/business-info', data)
        .then(r => r.data?.data ?? r.data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-setup-status'] })
      qc.invalidateQueries({ queryKey: ['whatsapp-business-info'] })
    },

    onError: (err: MutationError) => {
      const msg = err?.response?.data?.error?.message
      toast.error(msg ?? 'Could not save business info')
    },
  })
}

export function useConnectMeta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      code:          string
      wabaId:        string
      phoneNumberId: string
    }) =>
      api.post('/whatsapp/connect', data)
        .then(r => r.data?.data ?? r.data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-setup-status'] })
    },

    onError: (err: MutationError) => {
      const msg = err?.response?.data?.error?.message
      toast.error(msg ?? 'Could not connect WhatsApp')
    },
  })
}

export function useRequestPhoneOTP() {
  return useMutation({
    mutationFn: (data: { phoneNumberId: string; method: 'SMS' | 'VOICE' }) =>
      api.post('/whatsapp/verify-phone/request', data)
        .then(r => r.data?.data ?? r.data),

    onError: (err: MutationError) => {
      const msg = err?.response?.data?.error?.message
      toast.error(msg ?? 'Could not send OTP')
    },
  })
}

export function useConfirmPhoneOTP() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { phoneNumberId: string; code: string }) =>
      api.post('/whatsapp/verify-phone/confirm', data)
        .then(r => r.data?.data ?? r.data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-setup-status'] })
    },

    onError: (err: MutationError) => {
      const msg = err?.response?.data?.error?.message
      toast.error(msg ?? 'Invalid OTP. Try again.')
    },
  })
}

export function useRegisterPhone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pin: string) =>
      api.post('/whatsapp/register-phone', { pin })
        .then(r => r.data?.data ?? r.data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-setup-status'] })
    },

    onError: () => {
      // PIN errors are shown inline in WhatsAppPinStep — never toast/log the PIN itself
    },
  })
}

export function useCompleteSetup() {
  const qc          = useQueryClient()
  const { setUser } = useAuthStore()
  const navigate    = useNavigate()

  return useMutation({
    mutationFn: () =>
      api.post('/whatsapp/setup/complete')
        .then(r => r.data?.data ?? r.data),

    onSuccess: async () => {
      try {
        const me = await api.get('/auth/me')
        const user = me.data?.data?.user ?? me.data?.data ?? me.data?.user
        if (user) setUser(user)
      } catch {
        // Even if /me fails — still navigate
      }

      qc.invalidateQueries({ queryKey: ['me'] })
      qc.invalidateQueries({ queryKey: ['whatsapp-setup-status'] })

      toast.success('WhatsApp setup complete! 🎉')
      navigate('/dashboard')
    },

    onError: (err: MutationError) => {
      const code = err?.response?.data?.error?.code
      const msg  = err?.response?.data?.error?.message

      if (code === 'SETUP_INCOMPLETE') {
        toast.error('Please complete all steps before finishing setup')
      } else {
        toast.error(msg ?? 'Could not complete setup')
      }
    },
  })
}
