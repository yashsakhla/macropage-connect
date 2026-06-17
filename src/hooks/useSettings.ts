import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import type { AccountSettings, NotificationPreferences } from '@/types'

export function useAccountSettings() {
  return useQuery({
    queryKey: ['settings', 'account'],
    queryFn: () =>
      api.get('/settings/account').then((r) => {
        const d = r.data.data
        return { ...d, companyName: d.companyName ?? d.company } as AccountSettings
      }),
  })
}

export function useUpdateAccountSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AccountSettings>) => {
      const { companyName, ...rest } = data as any
      const payload = { ...rest, ...(companyName !== undefined ? { company: companyName } : {}) }
      return api.patch('/settings/account', payload).then((r) => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings', 'account'] })
      toast.success('Settings saved')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to save settings'),
  })
}

export function useAPIKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api.get('/settings/api-keys').then((r) => r.data),
  })
}

export function useCreateAPIKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; permissions: string[]; expiresIn?: string }) =>
      api.post('/settings/api-keys', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys'] }),
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to create key'),
  })
}

export function useRevokeAPIKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/settings/api-keys/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['api-keys'] })
      toast.success('API key revoked')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to revoke key'),
  })
}

export function useWebhooks() {
  return useQuery({
    queryKey: ['webhooks'],
    queryFn: () => api.get('/settings/webhooks').then((r) => r.data),
  })
}

export function useCreateWebhook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { url: string; events: string[]; description?: string }) =>
      api.post('/settings/webhooks', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['webhooks'] })
      toast.success('Webhook added')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to add webhook'),
  })
}

export function useUpdateWebhook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.patch(`/settings/webhooks/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to update webhook'),
  })
}

export function useDeleteWebhook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/settings/webhooks/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['webhooks'] })
      toast.success('Webhook removed')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to delete webhook'),
  })
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => api.get('/notifications/preferences').then((r) => r.data.data),
  })
}

export function useUpdateNotifications() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) =>
      api.put('/notifications/preferences', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-preferences'] })
      toast.success('Preferences saved')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to save preferences'),
  })
}
