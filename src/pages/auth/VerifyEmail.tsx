import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import {
  CheckCircle, XCircle, Loader2,
  Mail, ArrowRight, RefreshCw
} from 'lucide-react'
import { useVerifyEmail, useResendVerification } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'

type VerifyState = 'loading' | 'success' | 'error' | 'expired'

export default function VerifyEmail() {
  const { token: tokenParam } = useParams<{ token: string }>()
  const [searchParams] = useSearchParams()
  const token = tokenParam ?? searchParams.get('token') ?? undefined
  const navigate   = useNavigate()
  const [state, setState]         = useState<VerifyState>('loading')
  const [errorCode, setErrorCode] = useState('')

  const { mutate: verify } = useVerifyEmail()

  useEffect(() => {
    if (!token) { setState('error'); return }

    verify(token, {
      onSuccess: () => setState('success'),
      onError: (err: any) => {
        const code = err.response?.data?.error?.code ?? ''
        setErrorCode(code)
        setState(code === 'TOKEN_EXPIRED' ? 'expired' : 'error')
      },
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="min-h-screen bg-[#f7f8f6] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center">

        {/* ── LOADING ── */}
        {state === 'loading' && (
          <>
            <div className="w-16 h-16 bg-[#e8f5ee] rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Loader2 size={28} className="text-[#1a5c3a] animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Verifying your email...</h1>
            <p className="text-sm text-gray-400 mt-2">Just a moment</p>
          </>
        )}

        {/* ── SUCCESS ── */}
        {state === 'success' && (
          <>
            <div className="w-16 h-16 bg-[#e8f5ee] rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-[#1a5c3a]" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Email verified!</h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Your email address has been successfully verified.
              You now have full access to Macropage Connect.
            </p>
            <AutoRedirect seconds={3} onComplete={() => navigate('/dashboard')} />
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 w-full h-12 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              Go to dashboard
              <ArrowRight size={16} />
            </button>
          </>
        )}

        {/* ── EXPIRED ── */}
        {state === 'expired' && (
          <>
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Mail size={28} className="text-amber-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Link expired</h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              This verification link has expired.
              Verification links are valid for 24 hours.
              Request a new one below.
            </p>
            <ResendButton />
            <Link to="/dashboard" className="block mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Go to dashboard anyway
            </Link>
          </>
        )}

        {/* ── ERROR ── */}
        {state === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <XCircle size={28} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {errorCode === 'ALREADY_VERIFIED' ? 'Already verified' : 'Invalid link'}
            </h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              {errorCode === 'ALREADY_VERIFIED'
                ? "Your email address is already verified. You're all set!"
                : 'This verification link is invalid or has already been used.'}
            </p>
            {errorCode === 'ALREADY_VERIFIED' ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-6 w-full h-12 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                Go to dashboard
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <ResendButton />
                <Link to="/dashboard" className="block mt-3 text-sm text-gray-400 hover:text-gray-600">
                  Go to dashboard
                </Link>
              </>
            )}
          </>
        )}

        <p className="text-xs text-gray-300 mt-8">Macropage Connect · Email Verification</p>
      </div>
    </div>
  )
}

// ── Auto-redirect countdown ────────────────────────────────────────────────────

function AutoRedirect({ seconds, onComplete }: { seconds: number; onComplete: () => void }) {
  const [count, setCount] = useState(seconds)

  useEffect(() => {
    if (count <= 0) { onComplete(); return }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  return (
    <p className="text-xs text-gray-400 mt-4">
      Redirecting to dashboard in{' '}
      <span className="font-semibold text-[#1a5c3a]">{count}</span>
      {' '}seconds...
    </p>
  )
}

// ── Resend button ──────────────────────────────────────────────────────────────

function ResendButton() {
  const { user }                      = useAuthStore()
  const [sent, setSent]               = useState(false)
  const [cooldown, setCooldown]       = useState(0)
  const { mutate: resend, isPending } = useResendVerification()

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleResend = () => {
    if (!user?.email) return
    resend(user.email, {
      onSuccess: () => {
        setSent(true)
        setCooldown(60)
      },
    })
  }

  if (sent && cooldown > 0) {
    return (
      <div className="mt-6">
        <div className="bg-[#e8f5ee] border border-[#c8e6d4] rounded-2xl px-4 py-3 flex items-center gap-2">
          <CheckCircle size={16} className="text-[#1a5c3a]" />
          <span className="text-sm text-[#085041]">Email sent! Check your inbox.</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Resend again in {cooldown}s</p>
      </div>
    )
  }

  return (
    <button
      onClick={handleResend}
      disabled={isPending || cooldown > 0}
      className="mt-6 w-full h-12 border-2 border-[#1a5c3a] text-[#1a5c3a] hover:bg-[#e8f5ee] rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <><Loader2 size={15} className="animate-spin" /> Sending...</>
      ) : (
        <><RefreshCw size={15} /> Resend verification email</>
      )}
    </button>
  )
}
