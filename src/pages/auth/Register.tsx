import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Mail, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { useRegister, useFinalizeSignup, useVerifyOtp, useResendVerification, useGoogleAuth } from '@/hooks/useAuth'
import { useElementWidth } from '@/hooks/useElementWidth'
import { cn, stripEmojis } from '@/lib/utils'
import type { RegisterFormPayload, RawAuthResponseDTO, ApiResponse } from '@/types'
import FormError from '@/components/shared/FormError'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import blackLogo from '@assets/macropage-connect-black.svg'
import whiteLogo from '@assets/macropage-connect-white.svg'
import signup1 from '@/assets/signup/1.svg'
import signup2 from '@/assets/signup/2.svg'
import signup3 from '@/assets/signup/3.svg'
import signup4 from '@/assets/signup/4.svg'
import signup5 from '@/assets/signup/5.svg'

const signupImages = [signup1, signup2, signup3, signup4, signup5]

const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/;
const nameRegex = /^[A-Za-z][A-Za-z' -]*$/;
const companyNameRegex = /^[A-Za-z0-9][A-Za-z0-9&.,'\- ]*$/;

const schema = z.object({
  firstName: z.string().min(2, 'First name is required').max(50, 'First name must be at most 50 characters').regex(nameRegex, 'First name can only contain letters, spaces, hyphens and apostrophes'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be at most 50 characters').regex(nameRegex, 'Last name can only contain letters, spaces, hyphens and apostrophes'),
  email: z.string().min(1, 'Email is required').max(254, 'Email must be at most 254 characters').email('Enter a valid email'),
  companyName: z.string().min(2, 'Company name is required').max(100, 'Company name must be at most 100 characters').regex(companyNameRegex, 'Company name contains invalid characters'),
  phone: z.string().optional().refine((v) => !v || /^\d{10}$/.test(v), 'Enter a valid 10-digit number'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(64, 'Password must be at most 64 characters').regex(passwordRegex, 'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z.string().max(64, 'Password must be at most 64 characters'),
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [heroImage] = useState(() => signupImages[Math.floor(Math.random() * signupImages.length)])
  const reg = useRegister()
  const googleAuth = useGoogleAuth()
  const { ref: googleBtnRef, width: googleBtnWidth } = useElementWidth<HTMLDivElement>()
  const { register: r, handleSubmit, watch, formState: { errors, isValid } } = useForm<FormData>({ resolver: zodResolver(schema), mode: 'onChange' })
  const pw = watch('password') || ''
  const score = passwordScore(pw)

  const finalizeSignup = useFinalizeSignup()
  const verifyOtp = useVerifyOtp()
  const resend = useResendVerification()

  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [pendingEmail, setPendingEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [cooldown, setCooldown] = useState(0)
  const otpCode = otpDigits.join('')

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const onSubmitForm = (d: FormData) => {
    reg.mutate(d as RegisterFormPayload, {
      onSuccess: () => {
        setPendingEmail(d.email)
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

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus()
    }
  }

  const handleVerifyOtp = () => {
    if (otpCode.length !== 6) return
    verifyOtp.mutate({ email: pendingEmail, otp: otpCode }, {
      onSuccess: (res: ApiResponse<RawAuthResponseDTO>) => finalizeSignup(res.data),
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
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
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

          <p className="text-xs text-gray-600 mt-8">Macropage Connect · Email Verification</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2 bg-white px-5 py-6 sm:px-10 lg:px-12 flex flex-col overflow-y-auto">
        <div className="mb-4 lg:mb-8">
          <img src={logo} alt="Macropage Connect" className="h-8 sm:h-9" />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-2xl font-black text-gray-900">Create your <span className="text-[var(--primary)]">account</span></h2>
          <p className="text-sm text-gray-400 mt-1 mb-4">Start your 14-day free trial. No credit card required.</p>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-3 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">First name</div>
                <input {...r('firstName')} maxLength={50}
                  onInput={(e) => { const v = e.currentTarget.value; const s = stripEmojis(v); if (s !== v) e.currentTarget.value = s }}
                  className={cn('h-10 px-4 bg-[var(--page-bg)] rounded-xl w-full', errors.firstName && 'border-red-400')} />
                <FormError message={errors.firstName?.message} />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Last name</div>
                <input {...r('lastName')} maxLength={50}
                  onInput={(e) => { const v = e.currentTarget.value; const s = stripEmojis(v); if (s !== v) e.currentTarget.value = s }}
                  className={cn('h-10 px-4 bg-[var(--page-bg)] rounded-xl w-full', errors.lastName && 'border-red-400')} />
                <FormError message={errors.lastName?.message} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Work email</div>
                <input {...r('email')} type="email" maxLength={254}
                  onInput={(e) => { const v = e.currentTarget.value; const s = stripEmojis(v); if (s !== v) e.currentTarget.value = s }}
                  className={cn('h-10 px-4 bg-[var(--page-bg)] rounded-xl w-full', errors.email && 'border-red-400')} />
                <FormError message={errors.email?.message} />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Company name</div>
                <input {...r('companyName')} maxLength={100}
                  onInput={(e) => { const v = e.currentTarget.value; const s = stripEmojis(v); if (s !== v) e.currentTarget.value = s }}
                  className={cn('h-10 px-4 bg-[var(--page-bg)] rounded-xl w-full', errors.companyName && 'border-red-400')} />
                <FormError message={errors.companyName?.message} />
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Phone number</div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2.5 h-10 border border-[var(--card-border)] rounded-xl bg-white text-sm shrink-0">🇮🇳 +91</div>
                <input
                  {...r('phone')}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10) }}
                  className={cn('h-10 px-4 bg-[var(--page-bg)] rounded-xl flex-1 min-w-0', errors.phone && 'border-red-400')}
                />
              </div>
              <FormError message={errors.phone?.message} />
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Password</div>
              <div className="relative">
                <input {...r('password')} type={showPassword ? 'text' : 'password'} maxLength={64}
                  onInput={(e) => { const v = e.currentTarget.value; const s = stripEmojis(v); if (s !== v) e.currentTarget.value = s }}
                  className={cn('h-10 px-4 bg-[var(--page-bg)] rounded-xl w-full pr-10', errors.password && 'border-red-400')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <FormError message={errors.password?.message} />
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Confirm password</div>
              <div className="relative">
                <input {...r('confirmPassword')} type={showConfirmPassword ? 'text' : 'password'} maxLength={64}
                  onInput={(e) => { const v = e.currentTarget.value; const s = stripEmojis(v); if (s !== v) e.currentTarget.value = s }}
                  className={cn('h-10 px-4 bg-[var(--page-bg)] rounded-xl w-full pr-10', errors.confirmPassword && 'border-red-400')} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <FormError message={errors.confirmPassword?.message} />
            </div>

            {pw && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-gray-100 rounded overflow-hidden">
                  <div style={{ width: `${Math.min(100, (score/5)*100)}%`, height: '100%', background: score <= 2 ? '#ef4444' : score === 3 ? '#f97316' : score === 4 ? '#eab308' : '#22c55e' }} />
                </div>
                <div className="text-xs text-gray-500 w-16 text-right">{score <= 2 ? 'Weak' : score === 3 ? 'Fair' : score === 4 ? 'Good' : 'Strong'}</div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2"><input {...r('terms')} type="checkbox" className="w-4 h-4" /> <span className="text-xs">I agree to the <a href="https://www.macropageconnect.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)]">Terms of Service</a> and <a href="https://www.macropageconnect.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)]">Privacy Policy</a></span></label>
              <label className="flex items-center gap-2"><input {...r('updates')} type="checkbox" className="w-4 h-4" /> <span className="text-xs text-gray-600">I'd like to receive product updates and tips via email</span></label>
            </div>

            <button type="submit" disabled={reg.isPending || !isValid} className="w-full h-10 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">{reg.isPending ? <><Loader2 className="animate-spin mr-2" />Creating…</> : 'Create account'}</button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-gray-100" />
              <div className="text-xs text-gray-400 px-3">or</div>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div ref={googleBtnRef} className="flex justify-center w-full">
              {googleBtnWidth > 0 && (
                <GoogleLogin
                  onSuccess={(cred) => {
                    if (cred.credential) googleAuth.mutate(cred.credential)
                    else toast.error('Google sign-in failed')
                  }}
                  onError={() => toast.error('Google sign-in failed')}
                  width={String(Math.min(448, Math.floor(googleBtnWidth)))}
                  text="signup_with"
                  shape="pill"
                />
              )}
            </div>

            <p className="text-center text-sm text-gray-500 mt-3">Already have an account? <Link to="/login" className="text-[var(--primary)] font-semibold">Sign in →</Link></p>
          </form>

          <div className="mt-6 max-w-xl text-center">
            <h3 className="font-bold text-gray-900">Reach customers on WhatsApp</h3>
            <p className="text-gray-500 mt-2 text-sm">Connect your business number and start sending verified messages that land straight in their inbox.</p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img src={heroImage} alt="Macropage Connect" className="absolute inset-0 w-full h-full object-cover" />
      </div>
    </div>
  )
}
