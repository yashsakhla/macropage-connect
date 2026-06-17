import { useQuery, useQueryClient, useMutation, keepPreviousData } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Conversation, ConversationStatus, Message } from '@/types'

function normalizeContact(raw: any) {
  if (!raw) return raw
  return {
    ...raw,
    id: raw._id ?? raw.id,
    tags: raw.tags ?? [],
    customFields: raw.customFields ?? {},
    status: raw.status ?? 'active',
  }
}

function normalizeConversation(raw: any): Conversation {
  const rawContact = raw.contact
  const contact = rawContact
    ? normalizeContact(rawContact)
    : { id: raw.contactId, name: raw.contactName ?? 'Unknown', phone: raw.contactPhone ?? '', tags: [], customFields: {}, status: 'active' as const }

  return {
    id: raw._id ?? raw.id,
    contact,
    status: ((raw.status ?? 'open') as string).toLowerCase() as ConversationStatus,
    assignedTo: raw.assignedTo,
    labels: raw.labels ?? [],
    lastMessage: raw.lastMessage,
    unreadCount: raw.unreadCount ?? 0,
    isBot: raw.botActive ?? raw.isBot ?? false,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

export function useConversations(filters?: Record<string, string | undefined>) {
  return useQuery({
    queryKey: ['conversations', filters],
    queryFn: () =>
      api.get('/conversations', { params: filters }).then((r) => {
        const raw = r.data
        const list: any[] = raw.data ?? raw
        return {
          ...raw,
          data: Array.isArray(list) ? list.map(normalizeConversation) : [],
        }
      }),
    staleTime: 30_000,
    refetchInterval: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function useConversation(id: string | null) {
  return useQuery<Conversation>({
    queryKey: ['conversation', id],
    queryFn: () =>
      api.get(`/conversations/${id}`).then((r) => {
        const raw = r.data.data ?? r.data
        return normalizeConversation(raw)
      }),
    enabled: !!id,
  })
}

export function useMessages(conversationId: string | null, page = 1) {
  return useQuery({
    queryKey: ['messages', conversationId, page],
    queryFn: () =>
      api
        .get(`/conversations/${conversationId}/messages`, { params: { page } })
        .then((r) => r.data),
    enabled: !!conversationId,
    staleTime: 0,
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      conversationId,
      data,
    }: {
      conversationId: string
      data: { type?: string; content: string }
    }) =>
      api
        .post(`/conversations/${conversationId}/messages`, data)
        .then((r) => r.data.data),
    onSuccess: (_msg: Message, { conversationId }) => {
      qc.invalidateQueries({ queryKey: ['messages', conversationId] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useAddNote() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, { conversationId: string; content: string }>({
    mutationFn: ({
      conversationId,
      content,
    }) =>
      api
        .post(`/conversations/${conversationId}/notes`, { content })
        .then((r) => r.data.data),
    onSuccess: (_: unknown, { conversationId }: { conversationId: string }) =>
      qc.invalidateQueries({ queryKey: ['messages', conversationId] }),
  })
}

export function useUpdateConversation() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, { id: string; data: Record<string, unknown> }>({
    mutationFn: ({ id, data }) =>
      api.patch(`/conversations/${id}`, data).then((r) => r.data),
    onSuccess: (_: unknown, { id }: { id: string }) => {
      qc.invalidateQueries({ queryKey: ['conversation', id] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useResolveConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/conversations/${id}/resolve`).then((r) => r.data),
    onSuccess: (_: unknown, id: string) => {
      qc.invalidateQueries({ queryKey: ['conversation', id] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useConversationByContact(contactId: string | null) {
  return useQuery({
    queryKey: ['conversation-by-contact', contactId],
    queryFn: () =>
      api
        .get('/conversations', { params: { contactId, limit: 1 } })
        .then(r => {
          const list = r.data?.data ?? r.data
          return Array.isArray(list) ? (list[0] ?? null) : null
        }),
    enabled: !!contactId,
    staleTime: 30_000,
  })
}

export function useCreateConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (contactId: string) =>
      api.post('/conversations/initiate', { contactId }).then(r => r.data.data ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export default useConversations
