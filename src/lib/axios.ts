import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const DEFAULT_BASE = 'https://macropage-connect.onrender.com/api/v1'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// ── REQUEST — attach access token ────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Refresh queue — prevents duplicate refresh calls ─────────────────────────

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

function handleLogout() {
  useAuthStore.getState().logout()
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// ── Error → toast message classification ─────────────────────────────────────
// Single source of truth for "what should the user see when this request fails".
// Actual toasting happens in the QueryClient's queryCache/mutationCache onError
// (see main.tsx) — NOT here — so a request that's retried by React Query only
// ever shows one toast (once it finally settles as an error), instead of one
// per retry attempt, and mutations that already handle their own onError don't
// get a second, duplicate toast layered on top of this one.
export function getErrorToastMessage(error: any): string | null {
  const status = error?.response?.status
  if (status === 401) return null // handled by the refresh/logout flow below
  if (status === 422) return null // validation — let the calling UI handle it
  if (status === 404) return null // not found — let the calling UI handle it
  if (status === 403) {
    return (
      error.response?.data?.error?.message ??
      error.response?.data?.message ??
      'You do not have permission to do this'
    )
  }
  if (status && status >= 500) return 'Server error. Please try again later.'
  return error.response?.data?.message ?? 'Something went wrong'
}

// ── RESPONSE — handle 401 with token refresh ─────────────────────────────────

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    // Non-401 errors — classification/toasting is handled by the QueryClient
    if (status !== 401) {
      return Promise.reject(error)
    }

    // 401 on the refresh endpoint itself — refresh token expired → logout
    if (originalRequest.url?.includes('/auth/refresh')) {
      handleLogout()
      return Promise.reject(error)
    }

    // 401 on auth endpoints — wrong credentials, not a token expiry
    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/signup') ||
      originalRequest.url?.includes('/auth/register')
    ) {
      return Promise.reject(error)
    }

    // Already retried once → refresh failed → logout
    if (originalRequest._retry) {
      handleLogout()
      return Promise.reject(error)
    }

    // Another refresh is in progress — queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    // ── Start refresh ─────────────────────────────────────────────────────────

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = useAuthStore.getState().refreshToken

    if (!refreshToken) {
      isRefreshing = false
      handleLogout()
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      )

      const newAccessToken = data.accessToken ?? data.token
      const newRefreshToken = data.refreshToken ?? refreshToken

      if (!newAccessToken) throw new Error('No access token in refresh response')

      const { user } = useAuthStore.getState()
      useAuthStore.getState().setAuth(user!, newAccessToken, newRefreshToken)

      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
      processQueue(null, newAccessToken)

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      handleLogout()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
