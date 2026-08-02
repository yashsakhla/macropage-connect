import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/types'

function decodeRoleFromToken(token: string): string | undefined {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role ?? payload.userRole ?? payload.claims?.role
  } catch {
    return undefined
  }
}

// Normalise role + plan to UPPERCASE so permission lookups always work
// regardless of whether the backend returns 'owner' or 'OWNER'
function normaliseUser(incoming: User): User {
  const activePlan = incoming.billingPlan ?? incoming.plan ?? 'TRIAL'

  return {
    whatsappSetupDone: false,
    emailVerified: false,
    ...incoming,
    role: (incoming.role as string)?.toUpperCase() as User['role'],
    billingPlan: incoming.billingPlan ?? incoming.plan,
    plan: activePlan ? (activePlan as string).toUpperCase() : 'TRIAL',
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
  isPlanExpired: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token, refreshToken) => {
        const resolvedRole = (user.role as string)?.toUpperCase()
          ?? (token ? decodeRoleFromToken(token)?.toUpperCase() : undefined)
        set({
          user: normaliseUser({ ...user, role: resolvedRole as User['role'] }),
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      setUser: (user) => set((state) => ({ user: normaliseUser({ ...state.user, ...user }) })),

      setToken: (token) => set({ token }),

      setRefreshToken: (refreshToken) => set({ refreshToken }),

      logout: () => set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),

      setLoading: (isLoading) => set({ isLoading }),

      isInTrial: () => {
        // Prefer the current billing plan when present; /auth/me may still be stale
        // in persisted storage while the backend has already moved the account forward.
        const plan = ((get().user?.billingPlan ?? get().user?.plan ?? 'TRIAL') as string).toUpperCase()
        return plan === 'TRIAL' || plan === 'FREE'
      },

      trialDaysLeft: () => {
        const trialEndsAt = get().user?.trialEndsAt
        if (!trialEndsAt) return 14
        const diff = Math.ceil(
          (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
        return Math.max(0, diff)
      },

      effectivePlan: () => get().user?.billingPlan ?? get().user?.plan ?? 'TRIAL',

      isPlanExpired: () => {
        const u = get().user
        if (!u) return false
        const status = (u.status as string ?? '').toUpperCase()
        if (status === 'SUSPENDED') return true
        if (u.subscriptionActive === false) return true
        // Prefer the active billing plan; the stale persisted plan may still say FREE.
        const plan = ((u.billingPlan ?? u.plan ?? 'TRIAL') as string).toUpperCase()
        if (plan === 'TRIAL' || plan === 'FREE') {
          const daysLeft = get().trialDaysLeft()
          return daysLeft <= 0
        }
        return false
      },
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
