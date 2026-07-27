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

// `_id` is sometimes plain string, sometimes MongoDB extended JSON (`{ $oid: "..." }`)
// depending on how the backend serialized it — normalize both to a plain string so
// every PATCH/DELETE `/templates/:id` call built from `template.id` actually resolves.
function normalizeTemplateId(raw: any): string {
  const rawId = raw._id ?? raw.id
  return (typeof rawId === 'object' && rawId?.$oid) ? rawId.$oid : rawId
}

function normalizeTemplate(raw: any): Template {
  return { ...raw, id: normalizeTemplateId(raw) } as Template
}

export function useTemplates(filters?: { status?: string }) {
  return useQuery({
    queryKey: ['templates', filters],
    queryFn: () =>
      api.get('/templates', { params: filters }).then((r) => {
        const items: any[] = Array.isArray(r.data) ? r.data : (r.data?.data ?? [])
        return items.map(normalizeTemplate)
      }),
  })
}

export function useTemplate(id: string) {
  return useQuery<Template>({
    queryKey: ['template', id],
    queryFn: () => api.get(`/templates/${id}`).then((r) => normalizeTemplate(r.data?.data ?? r.data)),
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
    mutationFn: ({ id, data }) => {
      if (!id) return Promise.reject(new Error('Missing template id — cannot update'))
      return api.patch(`/templates/${id}`, data).then((r) => r.data)
    },
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
    mutationFn: (id: string) => {
      if (!id) return Promise.reject(new Error('Missing template id — cannot delete'))
      return api.delete(`/templates/${id}`).then((r) => r.data)
    },
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
  return useQuery({
    queryKey: ['templates', 'sync'],
    queryFn: () =>
      api
        .get('/templates/sync')
        .then((r) => r.data)
        .then((res: { data?: { updated?: number } }) => {
          qc.invalidateQueries({ queryKey: ['templates'] })
          toast.success(`Synced ${res.data?.updated ?? 0} template statuses`)
          return res
        }),
    enabled: false,
    retry: false,
    meta: { onError: (err: any) => toast.error(apiError(err, 'Failed to sync templates')) },
  })
}
