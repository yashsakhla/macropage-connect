import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (!token) {
      navigate('/login')
      return
    }

    ;(async () => {
      try {
        const res = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        const user = res.data
        setAuth(user, token, '')
        navigate('/dashboard')
      } catch (err) {
        console.error(err)
        navigate('/login')
      }
    })()
  }, [navigate, setAuth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--page-bg)]">
      <div className="card p-6 flex items-center gap-3">
        <Loader2 className="animate-spin" />
        <div>
          <div className="text-sm font-medium">Signing you in…</div>
          <div className="text-xs text-gray-500">Finishing authentication and redirecting to your dashboard</div>
        </div>
      </div>
    </div>
  )
}
