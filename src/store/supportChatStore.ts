import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SearchResult } from '@/types'

export interface SupportChatMessage {
  id:        string
  role:      'user' | 'bot'
  text:      string
  timestamp: number
  type:      'text' | 'results' | 'escalation' | 'demo-cta'
  results?:  SearchResult[]
}

interface SupportChatState {
  messages: SupportChatMessage[]
  noAnswerCount: number
  addMessage: (msg: Omit<SupportChatMessage, 'id' | 'timestamp'>) => void
  setNoAnswerCount: (count: number) => void
  reset: (initial: SupportChatMessage[]) => void
}

export const useSupportChatStore = create<SupportChatState>()(
  persist(
    (set) => ({
      messages: [],
      noAnswerCount: 0,

      addMessage: (msg) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { ...msg, id: Math.random().toString(36).slice(2), timestamp: Date.now() },
          ],
        })),

      setNoAnswerCount: (noAnswerCount) => set({ noAnswerCount }),

      // Used on manual "start over" — keeps only the fresh greeting.
      reset: (initial) => set({ messages: initial, noAnswerCount: 0 }),
    }),
    {
      name: 'macropage-support-chat',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
