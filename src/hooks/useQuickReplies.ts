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
        return items.map((q) => ({ ...q, id: q._id ?? q.id })) as QuickReply[]
      }),
    staleTime: 60_000,
  })
}

export function useCreateQuickReply() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { shortcode: string; content: string }) =>
      api.post('/quick-replies', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quick-replies'] })
      toast.success('Quick reply saved')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to save quick reply'),
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
      toast.error(err.response?.data?.message ?? 'Failed to delete quick reply'),
  })
}
