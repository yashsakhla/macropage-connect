import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import type { AIConfigPayload, KBItemPayload } from '@/types/automation'

export function useAIConfig() {
  return useQuery({
    queryKey: ['ai-config'],
    queryFn: () => api.get('/automation/ai/config').then((r) => r.data.data),
  })
}

export function useSaveAIConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AIConfigPayload) =>
      api.put('/automation/ai/config', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-config'] })
      toast.success('AI configuration saved')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to save AI config'),
  })
}

export function useKnowledgeBase() {
  return useQuery({
    queryKey: ['knowledge-base'],
    queryFn: () => api.get('/automation/ai/knowledge').then((r) => r.data.data),
  })
}

export function useAddKnowledgeItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: KBItemPayload) =>
      api.post('/automation/ai/knowledge', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge-base'] })
      toast.success('Added to knowledge base')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to add item'),
  })
}

export function useDeleteKnowledgeItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/automation/ai/knowledge/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge-base'] })
      toast.success('Item removed')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to remove item'),
  })
}

export function useToggleKnowledgeItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api
        .patch(`/automation/ai/knowledge/${id}/toggle`, { enabled })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['knowledge-base'] }),
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to toggle item'),
  })
}

export function useTestAIResponse() {
  return useMutation({
    mutationFn: (message: string) =>
      api.post('/automation/ai/test', { message }).then((r) => r.data.data),
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Test failed'),
  })
}

export function useAIAnalytics() {
  return useQuery({
    queryKey: ['ai-analytics'],
    queryFn: () => api.get('/automation/ai/analytics').then((r) => r.data.data),
  })
}
