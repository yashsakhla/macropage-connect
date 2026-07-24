import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import type { Contact, ContactFilters, ContactSegment, CreateContactPayload, ImportPayload } from '@/types'

function normalizeSegment(raw: any): ContactSegment {
  return {
    id: raw.id ?? raw._id,
    name: raw.name,
    color: raw.color ?? '#1a5c3a',
    filters: raw.filters ?? {},
    contactCount: raw.count ?? raw.contactCount ?? 0,
    isBuiltIn: raw.type ? raw.type !== 'custom' : (raw.isBuiltIn ?? false),
    createdAt: raw.createdAt,
  }
}

function normaliseContact(raw: any): Contact {
  if (!raw) return raw
  return {
    ...raw,
    id: raw._id ?? raw.id,
    status: raw.status ?? 'active',
    customFields: raw.customFields ?? {},
    tags: raw.tags ?? [],
  }
}

export function useContacts(filters?: ContactFilters) {
  // Only search/page/limit go to the server — all other filtering is done client-side
  // from the returned contact objects which already carry status, tags, dates, etc.
  return useQuery({
    queryKey: ['contacts', { search: filters?.search, page: filters?.page, limit: filters?.limit }],
    queryFn: () =>
      api
        .get('/contacts', {
          params: {
            search: filters?.search || undefined,
            page: filters?.page ?? 1,
            limit: filters?.limit ?? 500,
          },
        })
        .then((r) => ({
          ...r.data,
          data: (r.data.data ?? []).map(normaliseContact),
        })),
    placeholderData: keepPreviousData,
  })
}

export function useContact(id: string) {
  return useQuery<Contact>({
    queryKey: ['contact', id],
    queryFn: () => api.get(`/contacts/${id}`).then((r) => normaliseContact(r.data.data ?? r.data)),
    enabled: !!id,
  })
}

export function useCreateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateContactPayload) =>
      api.post('/contacts', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] })
      qc.invalidateQueries({ queryKey: ['contact-tags'] })
      toast.success('Contact added')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to add contact'),
  })
}

export function useUpdateContact() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, { id: string; data: Partial<Contact> }>({
    mutationFn: ({ id, data }) =>
      api.patch(`/contacts/${id}`, data).then((r) => r.data),
    onSuccess: (_data: unknown, { id }: { id: string }) => {
      qc.invalidateQueries({ queryKey: ['contact', id] })
      qc.invalidateQueries({ queryKey: ['contacts'] })
      qc.invalidateQueries({ queryKey: ['contact-tags'] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
      qc.invalidateQueries({ queryKey: ['conversation'] })
      toast.success('Contact updated')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to update contact'),
  })
}

export function useDeleteContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/contacts/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] })
      qc.invalidateQueries({ queryKey: ['contact-tags'] })
      toast.success('Contact deleted')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to delete contact'),
  })
}

export function useBulkTagContacts() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      ids,
      tags,
      action,
    }: {
      ids: string[]
      tags: string[]
      action: 'add' | 'remove'
    }) => api.post('/contacts/bulk-tag', { ids, tags, action }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] })
      qc.invalidateQueries({ queryKey: ['contact-tags'] })
      toast.success('Tags updated')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to update tags'),
  })
}

export function useDeleteContactTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tag: string) =>
      api.delete(`/contacts/tags/${encodeURIComponent(tag)}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] })
      qc.invalidateQueries({ queryKey: ['contact-tags'] })
      toast.success('Tag removed from all contacts')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to remove tag'),
  })
}

export function useBulkDeleteContacts() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) =>
      api.post('/contacts/bulk-delete', { ids }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contacts deleted')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to delete contacts'),
  })
}

export function useSegments() {
  return useQuery({
    queryKey: ['segments'],
    queryFn: () =>
      api.get('/contacts/segments').then((r) => {
        const body = r.data?.data ?? r.data
        const list: any[] = Array.isArray(body) ? body : (body?.segments ?? [])
        // The API also returns "predefined" (all/subscribed/unsubscribed) and "tag"
        // segments — those duplicate what the built-in segment list and the tags
        // cloud already show, so only user-created ("custom") segments are kept here.
        return list.filter((s) => s.type === 'custom').map(normalizeSegment)
      }),
  })
}

export function useAddContactsToSegment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ segmentId, contactIds }: { segmentId: string; contactIds: string[] }) =>
      api.patch(`/contacts/segments/${segmentId}`, { contactIds }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['segments'] })
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to add contacts to segment'),
  })
}

export function useCreateSegment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; color: string; filters: ContactFilters }) =>
      api.post('/contacts/segments', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['segments'] })
      toast.success('Segment created')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to create segment'),
  })
}

export function useImportContacts() {
  return useMutation({
    mutationFn: (payload: ImportPayload) =>
      api.post('/contacts/import', payload).then((r) => r.data?.data ?? r.data),
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Import failed'),
  })
}

export interface ImportProgress {
  processed: number
  total: number
  status: string
  imported?: number
  skipped?: number
  failed?: number
}

/** Purely reactive — populated by the `import:progress` socket handler in useSocket.ts, never fetched. */
export function useImportProgress(jobId: string | null) {
  return useQuery<ImportProgress | undefined>({
    queryKey: ['import-progress', jobId],
    queryFn: () => Promise.resolve(undefined),
    enabled: false,
    staleTime: Infinity,
  })
}
