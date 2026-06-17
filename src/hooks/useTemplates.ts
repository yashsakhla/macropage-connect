import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import type { Template, CreateTemplatePayload } from '@/types'

function apiError(err: any, fallback: string): string {
  return (
    err?.error?.message ??
    err?.response?.data?.error?.message ??
    err?.response?.data?.message ??
    fallback
  )
}

export function useTemplates(filters?: { status?: string }) {
  return useQuery({
    queryKey: ['templates', filters],
    queryFn: () =>
      api.get('/templates', { params: filters }).then((r) => {
        const items: any[] = Array.isArray(r.data) ? r.data : (r.data?.data ?? [])
        return items.map((t) => ({ ...t, id: t._id ?? t.id })) as Template[]
      }),
  })
}

export function useTemplate(id: string) {
  return useQuery<Template>({
    queryKey: ['template', id],
    queryFn: () => api.get(`/templates/${id}`).then((r) => r.data.data),
    enabled: !!id,
  })
}

export function useCreateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTemplatePayload) =>
      api.post('/templates', data).then((r) => {
        if (r.data.success === false) throw r.data
        return r.data
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] })
      toast.success('Template submitted for Meta review')
    },
    onError: (err: any) =>
      toast.error(apiError(err, 'Failed to create template')),
  })
}

export function useUpdateTemplate() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, { id: string; data: Partial<CreateTemplatePayload> }>({
    mutationFn: ({ id, data }) => api.put(`/templates/${id}`, data).then((r) => r.data),
    onSuccess: (_data: unknown, { id }: { id: string }) => {
      qc.invalidateQueries({ queryKey: ['template', id] })
      qc.invalidateQueries({ queryKey: ['templates'] })
      toast.success('Template updated')
    },
    onError: (err: any) =>
      toast.error(apiError(err, 'Failed to update template')),
  })
}

export function useDeleteTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/templates/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] })
      toast.success('Template deleted')
    },
    onError: (err: any) =>
      toast.error(apiError(err, 'Failed to delete template')),
  })
}

export function useSaveDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CreateTemplatePayload>) =>
      api.post('/templates/draft', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] })
      toast.success('Draft saved')
    },
    onError: (err: any) =>
      toast.error(apiError(err, 'Failed to save draft')),
  })
}

export function useUpdateDraft() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, { id: string; data: Partial<CreateTemplatePayload> }>({
    mutationFn: ({ id, data }) =>
      api.patch(`/templates/${id}/draft`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] })
      toast.success('Draft updated')
    },
    onError: (err: any) =>
      toast.error(apiError(err, 'Failed to update draft')),
  })
}

export function useSyncTemplates() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/templates/sync').then((r) => r.data),
    onSuccess: (res: { data?: { updated?: number } }) => {
      qc.invalidateQueries({ queryKey: ['templates'] })
      toast.success(`Synced ${res.data?.updated ?? 0} template statuses`)
    },
    onError: (err: any) =>
      toast.error(apiError(err, 'Failed to sync templates')),
  })
}
