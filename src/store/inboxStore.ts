import { create } from 'zustand'

type Filter = 'all' | 'open' | 'pending' | 'resolved' | 'mine' | 'unread'

interface AgentPresence {
  name:       string
  avatarUrl?: string
  status:     'online' | 'away' | 'offline'
}

interface InboxState {
  selectedConversationId: string | null
  setSelectedConversation: (id: string | null) => void
  activeFilter: Filter
  setFilter: (f: Filter) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  contactPanelOpen: boolean
  toggleContactPanel: () => void
  inputMode: 'reply' | 'note'
  setInputMode: (m: 'reply' | 'note') => void
  showQuickReplies: boolean
  setShowQuickReplies: (v: boolean) => void
  showTemplatePicker: boolean
  setShowTemplatePicker: (v: boolean) => void
  typingContactIds: string[]
  setTyping: (contactId: string, isTyping: boolean) => void

  // Agent-to-agent typing indicators { conversationId → { agentId → agentName } }
  typingAgents: Record<string, Record<string, string>>
  setAgentTyping: (conversationId: string, agentId: string, agentName: string) => void
  clearAgentTyping: (conversationId: string, agentId: string) => void

  // Online agents { userId → AgentPresence }
  onlineAgents: Record<string, AgentPresence>
  updateAgentPresence: (data: {
    userId:     string
    name:       string
    avatarUrl?: string
    status:     'online' | 'away' | 'offline'
  }) => void
}

export const useInboxStore = create<InboxState>((set, get) => ({
  selectedConversationId: null,
  setSelectedConversation: (id) => set({ selectedConversationId: id }),
  activeFilter: 'all',
  setFilter: (f) => set({ activeFilter: f }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  contactPanelOpen: true,
  toggleContactPanel: () => set({ contactPanelOpen: !get().contactPanelOpen }),
  inputMode: 'reply',
  setInputMode: (m) => set({ inputMode: m }),
  showQuickReplies: false,
  setShowQuickReplies: (v) => set({ showQuickReplies: v }),
  showTemplatePicker: false,
  setShowTemplatePicker: (v) => set({ showTemplatePicker: v }),
  typingContactIds: [],
  setTyping: (contactId, isTyping) =>
    set((state) => ({
      typingContactIds: isTyping
        ? Array.from(new Set([...state.typingContactIds, contactId]))
        : state.typingContactIds.filter((id) => id !== contactId),
    })),

  typingAgents: {},

  setAgentTyping: (conversationId, agentId, agentName) =>
    set((state) => ({
      typingAgents: {
        ...state.typingAgents,
        [conversationId]: {
          ...(state.typingAgents[conversationId] ?? {}),
          [agentId]: agentName,
        },
      },
    })),

  clearAgentTyping: (conversationId, agentId) =>
    set((state) => {
      const conv = { ...(state.typingAgents[conversationId] ?? {}) }
      delete conv[agentId]
      return {
        typingAgents: {
          ...state.typingAgents,
          [conversationId]: conv,
        },
      }
    }),

  onlineAgents: {},

  updateAgentPresence: (data) =>
    set((state) => {
      const updated = { ...state.onlineAgents }
      if (data.status === 'offline') {
        delete updated[data.userId]
      } else {
        updated[data.userId] = {
          name:      data.name,
          avatarUrl: data.avatarUrl,
          status:    data.status,
        }
      }
      return { onlineAgents: updated }
    }),
}))

export default useInboxStore
