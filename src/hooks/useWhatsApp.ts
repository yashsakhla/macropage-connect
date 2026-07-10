import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import type { SetupStatus } from '@/types/setup'

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
    onSuccess: (data: any) => {
      toast.success(data?.message ?? 'Details sent!')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Could not send details')
    },
  })
}

export function useWhatsAppSetupStatus() {
  return useQuery<SetupStatus>({
    queryKey: ['whatsapp-setup-status'],
    queryFn: () =>
      api.get('/whatsapp/status').then(r => {
        // Handle both response shapes: { data: {...} } or direct {...}
        return r.data?.data ?? r.data
      }),
    staleTime: 0,
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
    },

    onError: (err: any) => {
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

    onError: (err: any) => {
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

    onError: (err: any) => {
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

    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message
      toast.error(msg ?? 'Invalid OTP. Try again.')
    },
  })
}

export function useSendTestMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      api.post('/whatsapp/setup/send-test')
        .then(r => r.data?.data ?? r.data),

    onSuccess: (responseData: any) => {
      toast.success(
        `Test message sent to ${responseData?.sentTo ?? 'your number'}!`
      )
      qc.invalidateQueries({ queryKey: ['whatsapp-setup-status'] })
    },

    onError: (err: any) => {
      const code = err?.response?.data?.error?.code
      const msg  = err?.response?.data?.error?.message

      if (code === 'NO_OWNER_PHONE') {
        toast.error('Add your phone number in profile settings first')
      } else if (code === 'TEMPLATE_ERROR') {
        toast.error('hello_world template not available. Contact support.')
      } else {
        toast.error(msg ?? 'Could not send test message')
      }
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

    onError: (err: any) => {
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
