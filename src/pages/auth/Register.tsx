import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Mail, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { useRegister, useFinalizeSignup, useVerifyOtp, useResendVerification, useGoogleAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import blackLogo from '@assets/macropage-connect-black.svg'
import whiteLogo from '@assets/macropage-connect-white.svg'

const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/;

const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  companyName: z.string().min(2, 'Company name is required'),
  phone: z.string().optional().refine((v) => !v || /^\d{10}$/.test(v), 'Enter a valid 10-digit number'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(passwordRegex, 'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z.string(),
  terms: z.boolean().refine((v) => v === true, 'You must accept the terms'),
  updates: z.boolean().optional(),
}).superRefine((val, ctx) => {
  if (val.password !== val.confirmPassword) {
    ctx.addIssue({ path: ['confirmPassword'], message: 'Passwords do not match', code: z.ZodIssueCode.custom })
  }
})

type FormData = z.infer<typeof schema>

function passwordScore(pw: string) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score = 1
  if (/[A-Z]/.test(pw)) score += 1
  if (/[a-z]/.test(pw)) score += 1
  if (/\d/.test(pw)) score += 1
  if (/[^A-Za-z0-9]/.test(pw)) score += 1
  return score
}

export default function Register() {
  const { isAuthenticated } = useAuthStore()
  const { theme } = useUIStore()
  const logo = theme === 'dark' ? whiteLogo : blackLogo
  const [showPassword, setShowPassword] = useState(false)
  const reg = useRegister()
  const googleAuth = useGoogleAuth()
  const { register: r, handleSubmit, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const pw = watch('password') || ''
  const score = passwordScore(pw)

  const finalizeSignup = useFinalizeSignup()
  const verifyOtp = useVerifyOtp()
  const resend = useResendVerification()

  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [pendingEmail, setPendingEmail] = useState('')
  const [pendingAuthData, setPendingAuthData] = useState<any>(null)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [cooldown, setCooldown] = useState(0)
  const otpCode = otpDigits.join('')

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const onSubmitForm = (d: FormData) => {
    reg.mutate(d as any, {
      onSuccess: (res: any) => {
        setPendingEmail(d.email)
        setPendingAuthData(res.data)
        setOtpDigits(['', '', '', '', '', ''])
        setCooldown(30)
        setStep('otp')
      },
    })
  }

  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(0, 1)
    const next = [...otpDigits]
    next[i] = digit
    setOtpDigits(next)
    if (digit && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus()
    }
  }

  const handleVerifyOtp = () => {
    if (otpCode.length !== 6) return
    verifyOtp.mutate({ email: pendingEmail, otp: otpCode }, {
      onSuccess: () => finalizeSignup(pendingAuthData),
    })
  }

  const handleResend = () => {
    if (cooldown > 0) return
    resend.mutate(pendingEmail, {
      onSuccess: () => {
        setOtpDigits(['', '', '', '', '', ''])
        setCooldown(30)
      },
    })
  }

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-[#f7f8f6] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-[var(--primary-light)] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail size={28} className="text-[var(--primary)]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Verify your email</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            We've sent a 6-digit code to <span className="font-semibold text-gray-700">{pendingEmail}</span>. Enter it below — it expires in 10 minutes.
          </p>

          <div className="flex gap-2 justify-center mt-6">
            {otpDigits.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                maxLength={1}
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                className="w-11 h-12 text-center text-lg font-bold border border-[var(--card-border)] rounded-xl"
              />
            ))}
          </div>

          <button
            onClick={handleVerifyOtp}
            disabled={otpCode.length !== 6 || verifyOtp.isPending}
            className="mt-6 w-full h-12 bg-[var(--primary)] text-white rounded-2xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {verifyOtp.isPending ? <><Loader2 size={16} className="animate-spin" />Verifying…</> : 'Verify & continue'}
          </button>

          <button
            onClick={handleResend}
            disabled={resend.isPending || cooldown > 0}
            className="mt-3 w-full h-11 border-2 border-[var(--primary)] text-[var(--primary)] rounded-2xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} className={cn(resend.isPending && 'animate-spin')} />
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </button>

          <p className="text-xs text-gray-300 mt-8">Macropage Connect · Email Verification</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2 bg-white px-12 py-10 flex flex-col justify-between">
        <div>
          <img src={logo} alt="Macropage Connect" className="h-9" />
        </div>

        <div className="my-6">
          <h2 className="text-4xl font-black text-gray-900">Create your</h2>
          <h1 className="text-5xl font-black text-[var(--primary)] mt-1">ACCOUNT</h1>
          <p className="text-sm text-gray-400 mt-2 mb-8">Start your 14-day free trial. No credit card required.</p>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 max-w-md">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">First name</div>
                <input {...r('firstName')} className={cn('h-11 px-4 bg-[var(--page-bg)] rounded-xl w-full', errors.firstName && 'border-red-400')} />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Last name</div>
                <input {...r('lastName')} className={cn('h-11 px-4 bg-[var(--page-bg)] rounded-xl w-full', errors.lastName && 'border-red-400')} />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Work email</div>
              <input {...r('email')} type="email" className={cn('h-11 px-4 bg-[var(--page-bg)] rounded-xl w-full', errors.email && 'border-red-400')} />
              <p className="text-xs text-gray-500 mt-1">Use your company email for better deliverability</p>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Company / Business name</div>
              <input {...r('companyName')} className={cn('h-11 px-4 bg-[var(--page-bg)] rounded-xl w-full', errors.companyName && 'border-red-400')} />
              <p className="text-xs text-gray-500 mt-1">This will appear on your WhatsApp business profile</p>
              {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>}
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Phone number</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-2 px-3 py-2 border border-[var(--card-border)] rounded-xl bg-white">🇮🇳 +91</div>
                <input
                  {...r('phone')}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10) }}
                  className={cn('h-11 px-4 bg-[var(--page-bg)] rounded-xl flex-1', errors.phone && 'border-red-400')}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              <p className="text-xs text-gray-500 mt-1">This is not your WhatsApp Business number — enter your business contact number, not the WhatsApp Business number you'll use for messaging</p>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Password</div>
              <div className="relative">
                <input {...r('password')} type={showPassword ? 'text' : 'password'} className={cn('h-11 px-4 bg-[var(--page-bg)] rounded-xl w-full pr-12', errors.password && 'border-red-400')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <div className="mt-2">
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 flex-1 bg-gray-100 rounded overflow-hidden">
                    <div style={{ width: `${Math.min(100, (score/5)*100)}%`, height: '100%', background: score <= 2 ? '#ef4444' : score === 3 ? '#f97316' : score === 4 ? '#eab308' : '#22c55e' }} />
                  </div>
                  <div className="text-xs text-gray-500 w-20 text-right">{score === 0 ? '' : score <= 2 ? 'Weak' : score === 3 ? 'Fair' : score === 4 ? 'Good' : 'Strong'}</div>
                </div>

                <div className="mt-3 text-xs text-gray-600 space-y-1">
                  <div className="flex items-center gap-2"><span className={pw.length >= 8 ? 'text-green-500' : 'text-gray-300'}>{pw.length >= 8 ? '✓' : '•'}</span> Minimum 8 characters</div>
                  <div className="flex items-center gap-2"><span className={/[A-Z]/.test(pw) ? 'text-green-500' : 'text-gray-300'}>{/[A-Z]/.test(pw) ? '✓' : '•'}</span> At least one uppercase letter</div>
                  <div className="flex items-center gap-2"><span className={/[a-z]/.test(pw) ? 'text-green-500' : 'text-gray-300'}>{/[a-z]/.test(pw) ? '✓' : '•'}</span> At least one lowercase letter</div>
                  <div className="flex items-center gap-2"><span className={/\d/.test(pw) ? 'text-green-500' : 'text-gray-300'}>{/\d/.test(pw) ? '✓' : '•'}</span> At least one number</div>
                  <div className="flex items-center gap-2"><span className={/[^A-Za-z0-9]/.test(pw) ? 'text-green-500' : 'text-gray-300'}>{/[^A-Za-z0-9]/.test(pw) ? '✓' : '•'}</span> At least one special character</div>
                </div>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Confirm password</div>
              <input {...r('confirmPassword')} type="password" className={cn('h-11 px-4 bg-[var(--page-bg)] rounded-xl w-full', errors.confirmPassword && 'border-red-400')} />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2"><input {...r('terms')} type="checkbox" className="w-4 h-4" /> <span className="text-sm">I agree to the <a href="https://www.macropageconnect.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)]">Terms of Service</a> and <a href="https://www.macropageconnect.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)]">Privacy Policy</a></span></label>
              <label className="flex items-center gap-2"><input {...r('updates')} type="checkbox" className="w-4 h-4" /> <span className="text-sm text-gray-600">I'd like to receive product updates and tips via email</span></label>
            </div>

            <button type="submit" disabled={reg.isPending} className="w-full h-11 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">{reg.isPending ? <><Loader2 className="animate-spin mr-2" />Creating…</> : 'Create account'}</button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-100" />
              <div className="text-xs text-gray-400 px-3">or</div>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="flex justify-center [&>div]:w-full">
              <GoogleLogin
                onSuccess={(cred) => {
                  if (cred.credential) googleAuth.mutate(cred.credential)
                  else toast.error('Google sign-in failed')
                }}
                onError={() => toast.error('Google sign-in failed')}
                width="384"
                text="signup_with"
                shape="pill"
              />
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">Already have an account? <Link to="/login" className="text-[var(--primary)] font-semibold">Sign in →</Link></p>
            <p className="text-center text-xs text-gray-400 mt-2">By continuing you agree to our <a href="https://www.macropageconnect.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline">Terms</a> and <a href="https://www.macropageconnect.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">Privacy</a></p>
          </form>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative bg-[var(--hero)] text-white p-12 overflow-hidden">
        <div style={{ position: 'absolute', top: -80, right: -80, width: 340, height: 340, borderRadius: '50%', background: 'var(--primary-light)', opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: '#0f2d1d', opacity: 0.6 }} />

        <div className="absolute top-10 left-12 max-w-xs">
          <h3 className="text-white font-bold text-lg">WhatsApp Setup Preview</h3>
          <p className="text-white/80 mt-2 text-sm">Connect your business number and start sending verified messages that reach customers' inboxes.</p>

          <div className="mt-4 bg-white rounded-2xl p-3 text-gray-800">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Onboarding progress</div>
              <div className="text-xs text-gray-500">2 / 4</div>
            </div>
            <div className="mt-3 bg-gray-100 h-2 rounded overflow-hidden">
              <div style={{ width: '50%', height: '100%', background: 'var(--primary)' }} />
            </div>
            <div className="mt-3 text-xs text-gray-600">Connect WABA → Verify business → Add template</div>
          </div>
        </div>
      </div>
    </div>
  )
}
