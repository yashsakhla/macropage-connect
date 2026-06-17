import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/types'

// Normalise role + plan to UPPERCASE so permission lookups always work
// regardless of whether the backend returns 'owner' or 'OWNER'
function normaliseUser(incoming: User): User {
  return {
    whatsappSetupDone: false,
    emailVerified: false,
    ...incoming,
    role: (incoming.role as string)?.toUpperCase() as User['role'],
    plan: incoming.plan
      ? (incoming.plan as string).toUpperCase()
      : 'TRIAL',
  }
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  setAuth: (user: User, token: string, refreshToken: string) => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  setRefreshToken: (refreshToken: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void

  // Plan / trial helpers
  isInTrial: () => boolean
  trialDaysLeft: () => number
  effectivePlan: () => string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token, refreshToken) =>
        set({
          user: normaliseUser(user),
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),

      setUser: (user) => set({ user: normaliseUser(user) }),

      setToken: (token) => set({ token }),

      setRefreshToken: (refreshToken) => set({ refreshToken }),

      logout: () => set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),

      setLoading: (isLoading) => set({ isLoading }),

      isInTrial: () => {
        const plan = get().user?.plan ?? 'TRIAL'
        return plan === 'TRIAL'
      },

      trialDaysLeft: () => {
        const trialEndsAt = get().user?.trialEndsAt
        if (!trialEndsAt) return 14
        const diff = Math.ceil(
          (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
        return Math.max(0, diff)
      },

      effectivePlan: () => get().user?.plan ?? 'TRIAL',
    }),
    {
      name: 'macropage-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
