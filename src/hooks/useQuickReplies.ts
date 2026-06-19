import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import type { QuickReply } from '@/types'

export function useQuickReplies() {
  return useQuery<QuickReply[]>({
    queryKey: ['quick-replies'],
    queryFn: () =>
      api.get('/quick-replies').then((r) => {
        const items: any[] = Array.isArray(r.data) ? r.data : (r.data?.data ?? [])
        return items.map((q) => ({
          ...q,
          id: q._id ?? q.id,
          title: q.title ?? q.shortcode ?? '',
        })) as QuickReply[]
      }),
    staleTime: 60_000,
  })
}

export function useCreateQuickReply() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; content: string; tags?: string[] }) =>
      api.post('/quick-replies', data).then((r) => r.data?.data ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quick-replies'] })
      toast.success('Quick reply created')
    },
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message ??
        err?.response?.data?.error?.message ??
        'Could not create quick reply'
      ),
  })
}

export function useUpdateQuickReply() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; content?: string; tags?: string[] } }) =>
      api.put(`/quick-replies/${id}`, data).then((r) => r.data?.data ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quick-replies'] })
      toast.success('Quick reply updated')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Could not update quick reply'),
  })
}

export function useDeleteQuickReply() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/quick-replies/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quick-replies'] })
      toast.success('Quick reply deleted')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Failed to delete quick reply'),
  })
}

export function useMarkQuickReplyUsed() {
  return useMutation({
    mutationFn: (id: string) =>
      api.post(`/quick-replies/${id}/use`).catch(() => {}),
  })
}
