import { useState, useEffect } from 'react'
import { Mail, X, RefreshCw, CheckCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useResendVerification } from '@/hooks/useAuth'

export default function EmailVerificationBanner() {
  const { user }                      = useAuthStore()
  const [dismissed, setDismissed]     = useState(false)
  const [sent, setSent]               = useState(false)
  const [cooldown, setCooldown]       = useState(0)
  const { mutate: resend, isPending } = useResendVerification()

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  if (!user) return null
  if (user.emailVerified) return null
  if (dismissed) return null
  if (user.provider === 'google') return null

  const handleResend = () => {
    resend(user.email, {
      onSuccess: () => {
        setSent(true)
        setCooldown(60)
      },
    })
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 px-4 py-2.5 flex items-center gap-3 flex-wrap">
      <Mail size={15} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />

      <p className="text-sm text-blue-800 dark:text-blue-300 flex-1 min-w-0">
        {sent ? (
          <span className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
            Verification email sent to{' '}
            <strong className="truncate">{user.email}</strong>
          </span>
        ) : (
          <>
            Please verify your email address{' '}
            <strong className="hidden sm:inline">{user.email}</strong>
          </>
        )}
      </p>

      {!sent ? (
        <button
          onClick={handleResend}
          disabled={isPending}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-900 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <><Loader2 size={12} className="animate-spin" /> Sending...</>
          ) : (
            <><RefreshCw size={12} /> Resend email</>
          )}
        </button>
      ) : cooldown > 0 ? (
        <span className="text-xs text-blue-500 dark:text-blue-400 flex-shrink-0">Resend in {cooldown}s</span>
      ) : (
        <button
          onClick={handleResend}
          className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-900 flex-shrink-0"
        >
          Resend again
        </button>
      )}

      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 text-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-0.5"
      >
        <X size={14} />
      </button>
    </div>
  )
}
