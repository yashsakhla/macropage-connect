import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useUIStore } from '@/store/uiStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import { connectSocket, disconnectSocket } from '@/lib/socket'
import type { LoginPayload } from '@/types'

function decodeTokenRole(token: string): string | undefined {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role ?? payload.userRole ?? payload.claims?.role
  } catch {
    return undefined
  }
}

export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const setFullLoader = useUIStore.getState().setFullLoader

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      api.post('/auth/login', payload).then((r) => r.data),
    onMutate: () => setFullLoader(true),
    onSettled: () => setFullLoader(false),
    onSuccess: ({ data }) => {
      const token = data.accessToken ?? data.token
      const refreshToken = data.refreshToken ?? ''
      const user = {
        ...(data.user || {}),
        plan: (data.user?.plan ?? 'TRIAL') as string,
        role: data.user?.role ?? decodeTokenRole(token),
      }
      setAuth(user, token, refreshToken)
      connectSocket(token)

      if (!user.whatsappSetupDone && ['OWNER', 'ADMIN'].includes((user.role as string)?.toUpperCase())) {
        navigate('/setup/whatsapp')
      } else {
        navigate('/dashboard')
      }
    },
    onError: (err: any) => {
      const code = err.response?.data?.error?.code
      if (code === 'TWO_FACTOR_REQUIRED') {
        // 2FA not yet wired — show generic message
        toast.error('Two-factor authentication required')
      } else {
        toast.error(err.response?.data?.message ?? 'Invalid credentials')
      }
    },
  })
}

export function useGoogleAuth() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const setFullLoader = useUIStore.getState().setFullLoader

  return useMutation({
    mutationFn: (credential: string) =>
      api.post('/auth/google', { credential }).then((r) => r.data),
    onMutate: () => setFullLoader(true),
    onSettled: () => setFullLoader(false),
    onSuccess: ({ data }) => {
      const token = data.accessToken ?? data.token
      const refreshToken = data.refreshToken ?? ''
      const user = {
        ...(data.user || {}),
        plan: (data.user?.plan ?? 'TRIAL') as string,
        role: data.user?.role ?? decodeTokenRole(token),
        emailVerified: true,
      }
      setAuth(user, token, refreshToken)
      connectSocket(token)

      if (!user.whatsappSetupDone && ['OWNER', 'ADMIN'].includes((user.role as string)?.toUpperCase())) {
        navigate('/setup/whatsapp')
      } else {
        navigate('/dashboard')
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Google sign-in failed')
    },
  })
}

// Creates the account and triggers the automatic verification-code email.
// Does NOT log the user in — that happens once they confirm the OTP,
// via useFinalizeSignup below.
export function useRegister() {
  const setFullLoader = useUIStore.getState().setFullLoader

  return useMutation({
    mutationFn: (payload: any) => {
      const rawPhone = (payload.phone ?? '') + ''
      const digits = rawPhone.replace(/\D/g, '')
      let phone: string | undefined
      if (digits.length === 10) phone = `+91${digits}`
      else if (digits.length === 11 && digits.startsWith('0')) phone = `+91${digits.slice(1)}`
      else if (digits.length === 12 && digits.startsWith('91')) phone = `+${digits}`
      else if (rawPhone.startsWith('+')) phone = rawPhone
      else if (digits.length > 0) phone = `+${digits}`

      const body = {
        name: payload.name ?? `${payload.firstName ?? ''} ${payload.lastName ?? ''}`.trim(),
        company: payload.company ?? payload.companyName ?? undefined,
        email: payload.email,
        password: payload.password,
        phone,
        termsAccepted: payload.terms ?? payload.termsAccepted ?? false,
        marketingOptIn: payload.updates ?? payload.marketingOptIn ?? false,
      }
      return api.post('/auth/signup', body).then((r) => r.data)
    },
    onMutate: () => setFullLoader(true),
    onSettled: () => setFullLoader(false),
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Registration failed')
    },
  })
}

// Call once the user has confirmed their OTP after signup — logs them in
// using the token/user returned by the original /auth/signup response.
export function useFinalizeSignup() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return (data: any) => {
    const token = data.accessToken ?? data.token
    const refreshToken = data.refreshToken ?? ''
    const user = {
      ...(data.user || {}),
      plan: (data.user?.plan ?? 'TRIAL') as string,
      role: data.user?.role ?? decodeTokenRole(token),
      emailVerified: true,
    }
    setAuth(user, token, refreshToken)
    connectSocket(token)
    navigate('/setup/whatsapp')
  }
}

export function useLogout() {
  const { logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () =>
      api.post('/auth/logout', { refreshToken }).catch(() => {}),
    onSettled: () => {
      disconnectSocket()
      logout()
      qc.clear()
      navigate('/login')
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post('/auth/forgot-password', { email }).then((r) => r.data),
    onSuccess: () => toast.success('Reset link sent to your email'),
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Failed to send reset link')
    },
  })
}

export function useResetPassword() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (data: { token: string; newPassword: string; confirmPassword: string }) =>
      api.post('/auth/reset-password', data).then((r) => r.data),
    onSuccess: () => {
      toast.success('Password updated. Please log in.')
      navigate('/login')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Failed to reset password')
    },
  })
}

export function useGetMe() {
  const { setUser } = useAuthStore()
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then((r) => {
      const user = r.data?.data?.user ?? r.data?.data ?? r.data?.user
      if (user) setUser(user)
      return user
    }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

export function useRefreshToken() {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: () => api.post('/auth/refresh').then((r) => r.data),
    onSuccess: ({ data }) => {
      const token = data.accessToken ?? data.token
      if (token && data.user) {
        const user = {
          ...data.user,
          role: data.user.role ?? decodeTokenRole(token),
        }
        setAuth(user, token, data.refreshToken ?? '')
      }
    },
  })
}

export function useVerifyEmail() {
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (token: string) =>
      api.get(`/auth/verify-email/${token}`).then(r => r.data),

    onSuccess: () => {
      const cur = useAuthStore.getState().user
      if (cur) setUser({ ...cur, emailVerified: true })
      toast.success('Email verified successfully! 🎉')
      navigate('/dashboard')
    },

    onError: () => {
      // Error state handled on the page itself
    },
  })
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      api.post('/auth/verify-otp', { email, otp }).then(r => r.data),
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Invalid code. Try again.')
    },
  })
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post('/auth/resend-verification', { email }).then(r => r.data),

    onSuccess: () =>
      toast.success('Verification email sent! Check your inbox.'),

    onError: (err: any) => {
      const code = err.response?.data?.error?.code
      if (code === 'ALREADY_VERIFIED') {
        toast.success('Your email is already verified!')
      } else if (code === 'TOO_MANY_REQUESTS') {
        toast.error('Too many requests. Wait an hour and try again.')
      } else {
        toast.error('Could not send email. Try again.')
      }
    },
  })
}

export async function fetchMe() {
  try {
    const res = await api.get('/auth/me')
    const user = res.data?.data?.user ?? res.data?.data ?? res.data?.user
    if (user) useAuthStore.getState().setUser(user)
    return res.data
  } catch {
    return null
  }
}
