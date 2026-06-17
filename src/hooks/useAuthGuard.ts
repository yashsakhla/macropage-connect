import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export function useAuthGuard() {
  const { token, logout } = useAuthStore()
  const navigate = useNavigate()
  useEffect(() => {
    if (!token) return
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp * 1000 < Date.now()) {
        logout()
        navigate('/login')
        toast.error('Session expired, please sign in again')
      }
    } catch {
      logout()
      navigate('/login')
    }
  }, [token, logout, navigate])
}
