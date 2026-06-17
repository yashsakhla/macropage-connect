import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import type { Campaign, CampaignRecipient, CreateCampaignPayload, Template } from '@/types'

function normalizeCampaign(c: any): Campaign {
  return {
    ...c,
    id: c.id ?? c._id,
    status: (c.status as string).toLowerCase() as Campaign['status'],
  }
}

export function useCampaigns(filters?: { status?: string }) {
  return useQuery<{ data: Campaign[] }>({
    queryKey: ['campaigns', filters],
    queryFn: () =>
      api.get('/campaigns', { params: filters }).then((r) => {
        const raw: any[] = r.data?.data ?? r.data ?? []
        return { data: raw.map(normalizeCampaign) }
      }),
    placeholderData: keepPreviousData,
  })
}

export function useCampaign(id: string) {
  return useQuery<Campaign>({
    queryKey: ['campaign', id],
    queryFn: () => api.get(`/campaigns/${id}`).then((r) => normalizeCampaign(r.data?.data ?? r.data)),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = (query.state.data as Campaign | undefined)?.status
      return (status === 'running' || (status as string) === 'RUNNING') ? 5000 : false
    },
  })
}

function normalizeRecipient(r: any): CampaignRecipient {
  const rawPhone = r.phone ?? r.contact?.phone ?? r.phoneNumber ?? r.waId ?? ''
  const phone = rawPhone.startsWith('+') ? rawPhone.slice(1) : rawPhone
  const contactName =
    r.contactName ?? r.name ?? r.recipientName ?? r.recipient_name ??
    r.contact?.name ?? r.contact?.displayName ?? (phone || 'Unknown')
  return {
    ...r,
    id: r.id ?? r._id,
    contactName,
    phone,
    status: (r.status as string).toLowerCase() as CampaignRecipient['status'],
  }
}

export function useCampaignRecipients(campaignId: string, page = 1) {
  return useQuery<{ data: CampaignRecipient[] }>({
    queryKey: ['campaign-recipients', campaignId, page],
    queryFn: () =>
      api
        .get(`/campaigns/${campaignId}/recipients`, { params: { page } })
        .then((r) => {
          const raw: any[] = r.data?.data ?? r.data ?? []
          return { data: raw.map(normalizeRecipient) }
        }),
    enabled: !!campaignId,
  })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCampaignPayload) =>
      api.post('/campaigns', data).then((r) => r.data?.data ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

export function useLaunchCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.post(`/campaigns/${id}/launch`).then((r) => r.data?.data ?? r.data),
    onSuccess: (_data: unknown, id: string) => {
      qc.invalidateQueries({ queryKey: ['campaign', id] })
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campaign launched! 🚀')
    },
  })
}

export function usePauseCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/campaigns/${id}/pause`).then((r) => r.data),
    onSuccess: (_data: unknown, id: string) => {
      qc.invalidateQueries({ queryKey: ['campaign', id] })
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campaign paused')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to pause campaign'),
  })
}

export function useCancelCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/campaigns/${id}/cancel`).then((r) => r.data),
    onSuccess: (_data: unknown, id: string) => {
      qc.invalidateQueries({ queryKey: ['campaign', id] })
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campaign cancelled')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to cancel campaign'),
  })
}

export function useDuplicateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.post(`/campaigns/${id}/duplicate`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campaign duplicated as draft')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to duplicate campaign'),
  })
}

export function useApprovedTemplates() {
  return useQuery<Template[]>({
    queryKey: ['templates', 'APPROVED'],
    queryFn: () =>
      api.get('/templates', { params: { status: 'APPROVED' } })
        .then(r => {
          const list: any[] = r.data?.data ?? r.data ?? []
          return list.map(t => ({ ...t, id: t.id ?? t._id })) as Template[]
        }),
    staleTime: 5 * 60 * 1000,
  })
}

export function useContactsCount(filters?: { tags?: string[] }) {
  return useQuery<{ total: number; contacts: any[] }>({
    queryKey: ['contacts-count', filters],
    queryFn: () =>
      api.get('/contacts', {
        params: {
          ...(filters?.tags?.length ? { tags: filters.tags.join(',') } : {}),
        },
      }).then(r => {
        const list: any[] = r.data?.data ?? []
        const total: number = r.data?.total ?? list.length
        return { total, contacts: list }
      }),
    staleTime: 60000,
  })
}

export function useCampaignTags() {
  return useQuery<any[]>({
    queryKey: ['contact-tags'],
    queryFn: () =>
      api.get('/contacts/tags').then(r => r.data?.data ?? r.data ?? []),
    staleTime: 5 * 60 * 1000,
  })
}
