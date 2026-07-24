import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import type { AccountSettings, NotificationPreferences, Webhook } from '@/types'

function normalizeWebhook(raw: any): Webhook {
  return {
    id: raw._id ?? raw.id,
    url: raw.url,
    description: raw.description,
    events: raw.events ?? [],
    isEnabled: raw.isEnabled ?? raw.enabled ?? true,
    createdAt: raw.createdAt,
    // A freshly created webhook has no delivery history yet — the backend
    // omits `stats`/`recentDeliveries` entirely rather than sending zeros.
    stats: raw.stats ?? { totalDeliveries: 0, successRate: 0 },
    recentDeliveries: raw.recentDeliveries ?? [],
  }
}

export function useAccountSettings() {
  return useQuery({
    queryKey: ['settings', 'account'],
    queryFn: () =>
      api.get('/settings/account').then((r) => {
        const d = r.data.data
        return {
          ...d,
          companyName: d.companyName ?? d.company,
          companyLogoUrl: d.companyLogoUrl ?? d.logoUrl,
        } as AccountSettings
      }),
  })
}

export function useUploadAccountLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return api
        .post('/settings/account/logo', form, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((r) => r.data.data.logoUrl as string)
    },
    onSuccess: (logoUrl) => {
      qc.setQueryData(['settings', 'account'], (prev: AccountSettings | undefined) =>
        prev ? { ...prev, companyLogoUrl: logoUrl } : prev
      )
      toast.success('Logo updated')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to upload logo'),
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
    queryFn: () =>
      api.get('/settings/webhooks').then((r) => {
        const body = r.data?.data ?? r.data
        const list: any[] = Array.isArray(body) ? body : (body?.webhooks ?? [])
        return list.map(normalizeWebhook)
      }),
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
