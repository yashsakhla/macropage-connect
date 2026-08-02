import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RememberMeState {
  rememberedEmail: string | null
  setRememberedEmail: (email: string | null) => void
}

export const useRememberMeStore = create<RememberMeState>()(
  persist(
    (set) => ({
      rememberedEmail: null,
      setRememberedEmail: (email) => set({ rememberedEmail: email }),
    }),
    { name: 'macropage-remember-me' }
  )
)
