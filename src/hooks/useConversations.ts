import { useQuery, useQueryClient, useMutation, keepPreviousData } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import type { Conversation, ConversationStatus, Message } from '@/types'
import { useAuthStore } from '@/store/authStore'

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
    assignedTo: raw.assignedAgent
      ? { id: raw.assignedAgent._id ?? raw.assignedAgent.id, name: raw.assignedAgent.name, avatarUrl: raw.assignedAgent.avatarUrl }
      : undefined,
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
    staleTime: 30_000,
    refetchOnWindowFocus: false,
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
      data: {
        type?: string
        content: string
        templateId?: string
        templateName?: string
        variables?: Record<string, string>
      }
    }) =>
      api
        .post(`/conversations/${conversationId}/messages`, data)
        .then((r) => r.data.data),
    onMutate: async ({ conversationId, data }) => {
      await qc.cancelQueries({ queryKey: ['messages', conversationId, 1] })
      const { user } = useAuthStore.getState()
      const tempId = `temp-${Date.now()}`
      const optimisticMsg: Message = {
        id: tempId,
        conversationId,
        direction: 'outbound',
        type: data.type === 'TEMPLATE' ? 'template' : 'text',
        status: 'SENDING',
        content: data.content,
        templateName: data.templateName,
        agentId: user?.id,
        agentName: user?.name,
        createdAt: new Date().toISOString(),
      }
      qc.setQueryData(['messages', conversationId, 1], (old: any) => {
        if (!old) return old
        return { ...old, data: [...(old.data ?? []), optimisticMsg] }
      })
      return { tempId }
    },
    onSuccess: (realMsg: Message, { conversationId }, context: any) => {
      if (!realMsg) {
        qc.invalidateQueries({ queryKey: ['messages', conversationId] })
        qc.invalidateQueries({ queryKey: ['conversations'] })
        return
      }
      qc.setQueryData(['messages', conversationId, 1], (old: any) => {
        if (!old) return old
        const filtered = (old.data ?? []).filter((m: any) => m && m.id !== context?.tempId)
        const alreadyPresent = filtered.some(
          (m: any) =>
            (realMsg.metaMessageId && m.metaMessageId === realMsg.metaMessageId) ||
            ((realMsg as any)._id && m._id === (realMsg as any)._id) ||
            (realMsg.id && m.id === realMsg.id)
        )
        return { ...old, data: alreadyPresent ? filtered : [...filtered, realMsg] }
      })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (_err, { conversationId }, context: any) => {
      qc.setQueryData(['messages', conversationId, 1], (old: any) => {
        if (!old) return old
        return { ...old, data: (old.data ?? []).filter((m: Message) => m.id !== context?.tempId) }
      })
      toast.error('Failed to send message')
    },
  })
}

export function useAddNote() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  return useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string
      content: string
    }) =>
      api
        .post(`/conversations/${conversationId}/notes`, { content })
        .then((r) => r.data.data),
    onSuccess: (note: any, { conversationId }) => {
      if (!note) {
        qc.invalidateQueries({ queryKey: ['messages', conversationId] })
        return
      }
      // Directly inject the note into the cache instead of invalidating.
      // The messages API endpoint does not return internal notes, so a refetch
      // would wipe any note the socket handler already added to the cache.
      const normalized = {
        ...note,
        id: note.id ?? note._id,
        type: 'note',
        direction: 'outbound',
        content: note.content ?? '',
        agentName: note.agentName ?? user?.name,
        createdAt: note.createdAt ?? new Date().toISOString(),
      }
      qc.setQueryData(['messages', conversationId, 1], (old: any) => {
        const base = old ?? { data: [], total: 0 }
        const data: any[] = base.data ?? []
        const alreadyExists = data.some(
          (m: any) =>
            (normalized._id && m._id === normalized._id) ||
            (normalized.id && m.id === normalized.id)
        )
        if (alreadyExists) return base
        return { ...base, data: [...data, normalized] }
      })
    },
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
        .get('/conversations', { params: { contactId, limit: 50 } })
        .then(r => {
          const list = r.data?.data ?? r.data
          const candidates = Array.isArray(list) ? list : []
          // Don't trust the contactId filter blindly — if the backend ignores it
          // and just returns the most recently active conversation, list[0] can
          // belong to a different contact entirely. Match on the contact id ourselves.
          return candidates.find((c: any) => {
            const cId = c.contact?._id ?? c.contact?.id ?? c.contactId
            return cId === contactId
          }) ?? null
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

export function useAssignConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      conversationId,
      userId,
    }: { conversationId: string; userId: string }) =>
      api.put(`/conversations/${conversationId}/assign`, {
        assignToUserId: userId,
      }).then(r => r.data?.data ?? r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['conversations'] })
      qc.invalidateQueries({ queryKey: ['conversation'] })
      toast.success(data?.message ?? 'Conversation assigned')
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ??
        err?.response?.data?.error?.message ??
        'Could not assign conversation'
      )
    },
  })
}

export function useUnassignConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) =>
      api.delete(`/conversations/${conversationId}/assign`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] })
      qc.invalidateQueries({ queryKey: ['conversation'] })
      toast.success('Conversation unassigned')
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ?? 'Could not unassign conversation'
      )
    },
  })
}

export default useConversations
