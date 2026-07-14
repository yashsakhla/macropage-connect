import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import type { ConversationFlow, FlowPayload } from '@/types/flow'

function normalizeFlow(f: any): ConversationFlow {
  return {
    ...f,
    id: f.id ?? f._id,
    stats: f.stats ?? {
      totalTriggered: f.totalTriggered ?? 0,
      completionRate: f.completionRate ?? 0,
      avgSteps: 0,
    },
  }
}

export function useFlows() {
  return useQuery({
    queryKey: ['flows'],
    queryFn: (): Promise<ConversationFlow[]> =>
      api.get('/automation/flows').then((r) => {
        const raw: any[] = Array.isArray(r.data) ? r.data : (r.data?.data ?? [])
        return raw.map(normalizeFlow)
      }),
  })
}

export function useFlow(id: string | undefined) {
  return useQuery({
    queryKey: ['flows', id],
    queryFn: (): Promise<ConversationFlow> =>
      api.get(`/automation/flows/${id}`).then((r) => normalizeFlow(r.data?.data ?? r.data)),
    enabled: !!id && id !== 'new',
  })
}

export function useSaveFlow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: FlowPayload }) =>
      id
        ? api.put(`/automation/flows/${id}`, data).then((r) => r.data)
        : api.post('/automation/flows', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flows'] })
      toast.success('Flow saved')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to save flow'),
  })
}

export function usePublishFlow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.post(`/automation/flows/${id}/publish`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flows'] })
      toast.success('Flow published and active!')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to publish flow'),
  })
}

export function useDeleteFlow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/automation/flows/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flows'] })
      toast.success('Flow deleted')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to delete flow'),
  })
}

export function useToggleFlow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api.patch(`/automation/flows/${id}/toggle`, { enabled }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flows'] }),
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to toggle flow'),
  })
}
