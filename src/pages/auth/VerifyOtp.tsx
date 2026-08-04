import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Loader2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'
import { useVerifyOtp, useResendVerification } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { connectSocket } from '@/lib/socket'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import type { ApiResponse, RawAuthResponseDTO, ApiErrorResponse, User } from '@/types'

type VerifyErrorResponse = ApiErrorResponse & { code?: string; error?: { code?: string; message?: string } }
import blackLogo from '@assets/macropage-connect-black.svg'
import whiteLogo from '@assets/macropage-connect-white.svg'

export default function VerifyOtp() {
  const { user, setAuth, logout } = useAuthStore()
  const { theme } = useUIStore()
  const logo = theme === 'dark' ? whiteLogo : blackLogo
  const navigate = useNavigate()
  const location = useLocation()

  // Reached either already-authenticated (emailVerified:false on the stored
  // user) or straight from a failed login that returned EMAIL_NOT_VERIFIED
  // (no session yet — only the email survives, via navigation state).
  const email = user?.email ?? (location.state as { email?: string } | null)?.email

  const goTo = (path: string) => {
    logout()
    navigate(path)
  }
  const verifyOtp = useVerifyOtp()
  const resend = useResendVerification()

  const [otpSent, setOtpSent] = useState(false)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [cooldown, setCooldown] = useState(0)
  const [resendNotice, setResendNotice] = useState<{ kind: 'error' | 'info'; message: string } | null>(null)
  const otpCode = otpDigits.join('')

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(0, 1)
    const next = [...otpDigits]
    next[i] = digit
    setOtpDigits(next)
    if (digit && i < 5) {
      document.getElementById(`login-otp-${i + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
      document.getElementById(`login-otp-${i - 1}`)?.focus()
    }
  }

  const handleVerify = () => {
    if (otpCode.length !== 6 || !email) return
    verifyOtp.mutate({ email, otp: otpCode }, {
      onSuccess: (res: ApiResponse<RawAuthResponseDTO>) => {
        const data = res?.data
        const token = data?.accessToken ?? data?.token
        if (token && data?.user) {
          setAuth(data.user as unknown as User, token, data.refreshToken ?? '')
          connectSocket(token)
          useUIStore.getState().setJustLoggedIn(true)
          toast.success(res?.message ?? 'Email verified successfully')

          if (!data.user.whatsappSetupDone && ['OWNER', 'ADMIN'].includes((data.user.role as string)?.toUpperCase())) {
            navigate('/setup/whatsapp')
          } else {
            navigate('/dashboard')
          }
        } else {
          toast.success('Email verified! Please sign in.')
          navigate('/login')
        }
      },
    })
  }

  const handleSendOtp = () => {
    if (resend.isPending || cooldown > 0 || !email) return
    setResendNotice(null)
    resend.mutate(email, {
      onSuccess: () => {
        setOtpDigits(['', '', '', '', '', ''])
        setCooldown(30)
        setOtpSent(true)
      },
      onError: (err: AxiosError<VerifyErrorResponse>) => {
        const code = err.response?.data?.code ?? err.response?.data?.error?.code
        const message = err.response?.data?.message ?? ''
        if (code === 'ALREADY_VERIFIED' || /already verified/i.test(message)) {
          setResendNotice({ kind: 'info', message: '✅ This email is already verified. You can sign in now.' })
        } else if (code === 'TOO_MANY_REQUESTS') {
          setResendNotice({ kind: 'error', message: '⏳ Too many requests. Wait an hour and try again.' })
        } else {
          setResendNotice({ kind: 'error', message: `😕 ${message || 'Could not send the code. Please try again.'}` })
        }
      },
    })
  }

  if (!email) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-[#f7f8f6] flex flex-col items-center justify-center p-4">
      <img src={logo} alt="Macropage Connect" className="h-8 mb-6" />
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-[var(--primary-light)] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Mail size={28} className="text-[var(--primary)]" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Verify your email</h1>

        {!otpSent ? (
          <>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              We need to confirm{' '}
              <span className="font-semibold text-gray-700">{email}</span> before you can continue.
            </p>

            <button
              onClick={handleSendOtp}
              disabled={resend.isPending}
              className="mt-6 w-full h-12 bg-[var(--primary)] text-white rounded-2xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {resend.isPending ? <><Loader2 size={16} className="animate-spin" />Sending…</> : 'Send OTP'}
            </button>

            {resendNotice && (
              <div
                className={cn(
                  'flex items-start gap-2 rounded-xl px-3.5 py-2.5 mt-4 text-left',
                  resendNotice.kind === 'info' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                )}
              >
                {resendNotice.kind === 'info'
                  ? <CheckCircle2 size={15} className="text-[#1a5c3a] shrink-0 mt-0.5" />
                  : <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                }
                <p className={cn('text-sm leading-snug', resendNotice.kind === 'info' ? 'text-[#1a5c3a]' : 'text-red-700')}>
                  {resendNotice.message}
                </p>
              </div>
            )}

            {resendNotice?.kind === 'info' && (
              <button
                onClick={() => goTo('/login')}
                className="mt-3 w-full h-11 border-2 border-[var(--primary)] text-[var(--primary)] rounded-2xl font-semibold text-sm"
              >
                Go to sign in
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Enter the 6-digit code sent to{' '}
              <span className="font-semibold text-gray-700">{email}</span> to continue.
            </p>

            <div className="flex gap-2 justify-center mt-6">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  id={`login-otp-${i}`}
                  maxLength={1}
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-12 text-center text-lg font-bold border border-[var(--card-border)] rounded-xl"
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={otpCode.length !== 6 || verifyOtp.isPending}
              className="mt-6 w-full h-12 bg-[var(--primary)] text-white rounded-2xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifyOtp.isPending ? <><Loader2 size={16} className="animate-spin" />Verifying…</> : 'Verify & continue'}
            </button>

            <button
              onClick={handleSendOtp}
              disabled={resend.isPending || cooldown > 0}
              className="mt-3 w-full h-11 border-2 border-[var(--primary)] text-[var(--primary)] rounded-2xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} className={cn(resend.isPending && 'animate-spin')} />
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
            </button>

            {resendNotice && (
              <div
                className={cn(
                  'flex items-start gap-2 rounded-xl px-3.5 py-2.5 mt-4 text-left',
                  resendNotice.kind === 'info' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                )}
              >
                {resendNotice.kind === 'info'
                  ? <CheckCircle2 size={15} className="text-[#1a5c3a] shrink-0 mt-0.5" />
                  : <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                }
                <p className={cn('text-sm leading-snug', resendNotice.kind === 'info' ? 'text-[#1a5c3a]' : 'text-red-700')}>
                  {resendNotice.message}
                </p>
              </div>
            )}
          </>
        )}

        <p className="text-sm text-gray-500 mt-6">
          Wrong account?{' '}
          <button onClick={() => goTo('/login')} className="text-[var(--primary)] font-semibold hover:underline">
            Sign in
          </button>
          {' '}or{' '}
          <button onClick={() => goTo('/register')} className="text-[var(--primary)] font-semibold hover:underline">
            Sign up
          </button>
        </p>

        <p className="text-xs text-gray-600 mt-8">Macropage Connect · Email Verification</p>
      </div>
    </div>
  )
}
