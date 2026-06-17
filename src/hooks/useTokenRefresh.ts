import { useEffect } from 'react'
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const REFRESH_INTERVAL_MS = 12 * 60 * 1000 // 12 min — 3 min before 15 min expiry

export function useTokenRefresh() {
  const { token, refreshToken, setAuth, user } = useAuthStore()

  useEffect(() => {
    if (!token || !refreshToken) return

    const interval = setInterval(async () => {
      try {
        const baseURL =
          import.meta.env.VITE_API_BASE_URL ??
          'https://macropage-connect.onrender.com/api/v1'

        const { data } = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )

        const newAccessToken = data?.data?.accessToken ?? data?.accessToken ?? data?.token
        const newRefreshToken = data?.data?.refreshToken ?? data?.refreshToken ?? refreshToken

        if (newAccessToken && user) {
          setAuth(user, newAccessToken, newRefreshToken)
        }
      } catch {
        // Don't force logout here — the reactive interceptor handles it
        // on the next actual API call failure
      }
    }, REFRESH_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [token, refreshToken])
}
