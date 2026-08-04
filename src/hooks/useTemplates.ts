import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { Template, CreateTemplatePayload, RawTemplateDTO, ApiErrorResponse } from '@/types'

type TemplateErrorResponse = ApiErrorResponse & { error?: { message?: string } }
type MutationError = AxiosError<TemplateErrorResponse> | (TemplateErrorResponse & { response?: undefined })

function apiError(err: MutationError, fallback: string): string {
  if (err && 'isAxiosError' in err) {
    return err.response?.data?.error?.message ?? err.response?.data?.message ?? fallback
  }
  return err?.error?.message ?? fallback
}

// `_id` is sometimes plain string, sometimes MongoDB extended JSON (`{ $oid: "..." }`)
// depending on how the backend serialized it — normalize both to a plain string so
// every PATCH/DELETE `/templates/:id` call built from `template.id` actually resolves.
function normalizeTemplateId(raw: RawTemplateDTO): string {
  const rawId = raw._id ?? raw.id
  return (typeof rawId === 'object' && rawId?.$oid) ? rawId.$oid : (rawId as string)
}

// The API returns the WhatsApp-wire shape (header.format, buttons wrapped in
// { buttons: [...] }) — the rest of the app reads the flatter Template shape
// (header.type, buttons as a plain array), so without this every template
// with a header or buttons silently rendered as body-text-only.
export function normalizeTemplate(raw: RawTemplateDTO): Template {
  const header = raw.header
    ? { type: raw.header.type ?? raw.header.format, text: raw.header.text, mediaUrl: raw.header.mediaUrl }
    : undefined
  const buttons = Array.isArray(raw.buttons)
    ? raw.buttons
    : Array.isArray(raw.buttons?.buttons)
    ? raw.buttons.buttons
    : undefined
  return { ...raw, id: normalizeTemplateId(raw), header, buttons } as Template
}

export function useTemplates(filters?: { status?: string }) {
  return useQuery({
    queryKey: ['templates', filters],
    queryFn: () =>
      api.get('/templates', { params: filters }).then((r) => {
        const items: RawTemplateDTO[] = Array.isArray(r.data) ? r.data : (r.data?.data ?? [])
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
    onError: (err: MutationError) =>
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
    onError: (err: MutationError) =>
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
    onError: (err: MutationError) =>
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
    onError: (err: MutationError) =>
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
    onError: (err: MutationError) =>
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
    meta: { onError: (err: MutationError) => toast.error(apiError(err, 'Failed to sync templates')) },
  })
}
