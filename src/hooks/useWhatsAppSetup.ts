import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { BusinessInfoPayload, PhoneVerificationPayload, TestMessagePayload } from '@/types/setup'
import { useAuthStore } from '@/store/authStore'

export function useWhatsAppSetup() {
  const queryClient = useQueryClient()
  const saveBusinessInfo = useMutation({
    mutationFn: (data: BusinessInfoPayload) => api.post('/whatsapp/setup/business-info', data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['setup-status'] })
  })

  const connectMeta = useMutation({
    mutationFn: (data: { code: string; wabaId?: string }) => api.post('/whatsapp/setup/connect-meta', data).then(r => r.data),
  })

  const requestVerificationCode = useMutation({
    mutationFn: (data: PhoneVerificationPayload) => api.post('/whatsapp/setup/request-code', data).then(r => r.data),
  })

  const verifyCode = useMutation({
    mutationFn: (data: { phoneNumber: string; countryCode: string; code: string }) => api.post('/whatsapp/setup/verify-code', data).then(r => r.data),
  })

  const sendTestMessage = useMutation({
    mutationFn: (data: TestMessagePayload) => api.post('/whatsapp/setup/send-test', data).then(r => r.data),
  })

  const completeSetup = useMutation({
    mutationFn: () => api.patch('/whatsapp/setup/complete', {}).then(r => r.data),
    onSuccess: (data: any) => {
      useAuthStore.getState().setUser(data?.user ?? useAuthStore.getState().user)
    }
  })

  return {
    saveBusinessInfo,
    connectMeta,
    requestVerificationCode,
    verifyCode,
    sendTestMessage,
    completeSetup,
  }
}

export default useWhatsAppSetup
