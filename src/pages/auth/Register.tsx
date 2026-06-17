import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRegister } from '@/hooks/useAuth'
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
  // Phone validation removed from UI — backend will normalize/append country code
  phone: z.string().optional(),
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
  const { register: r, handleSubmit, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const pw = watch('password') || ''
  const score = passwordScore(pw)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2 bg-white px-12 py-10 flex flex-col justify-between">
        <div>
          <img src={logo} alt="Macropage Connect" className="h-9" />
        </div>

        <div className="my-6">
          <h2 className="text-4xl font-black text-gray-900">Create your</h2>
          <h1 className="text-5xl font-black text-[var(--primary)] mt-1">FREE ACCOUNT</h1>
          <p className="text-sm text-gray-400 mt-2 mb-8">Start your 14-day free trial. No credit card required.</p>

          <form onSubmit={handleSubmit((d) => reg.mutate(d as any))} className="space-y-4 max-w-md">
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
                <div className="flex items-center gap-2 px-3 py-2 border border-[var(--card-border)] rounded-xl bg-white">🇮🇳</div>
                <input {...r('phone')} placeholder="9876543210" className={cn('h-11 px-4 bg-[var(--page-bg)] rounded-xl flex-1')} />
              </div>
              <p className="text-xs text-gray-500 mt-1">Used for account verification only; country code will be applied automatically</p>
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
              <label className="flex items-center gap-2"><input {...r('terms')} type="checkbox" className="w-4 h-4" /> <span className="text-sm">I agree to the <a href="#" className="text-[var(--primary)]">Terms of Service</a> and <a href="#" className="text-[var(--primary)]">Privacy Policy</a></span></label>
              <label className="flex items-center gap-2"><input {...r('updates')} type="checkbox" className="w-4 h-4" /> <span className="text-sm text-gray-600">I'd like to receive product updates and tips via email</span></label>
            </div>

            <button type="submit" disabled={reg.isPending} className="w-full h-11 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold">{reg.isPending ? <><Loader2 className="animate-spin mr-2" />Creating…</> : 'Create account'}</button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-100" />
              <div className="text-xs text-gray-400 px-3">or</div>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <button type="button" onClick={() => { window.location.href = `${import.meta.env.VITE_API_BASE_URL ?? 'https://macropage-connect.onrender.com/api/v1'}/auth/google` }} className="w-full h-11 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-[var(--page-bg)] flex items-center justify-center gap-3">Continue with Google</button>

            <p className="text-center text-sm text-gray-500 mt-6">Already have an account? <Link to="/login" className="text-[var(--primary)] font-semibold">Sign in →</Link></p>
            <p className="text-center text-xs text-gray-400 mt-2">By continuing you agree to our <Link to="#" className="underline">Terms</Link> and <Link to="#" className="underline">Privacy</Link></p>
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
