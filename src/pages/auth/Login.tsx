import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { useLogin, useGoogleAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import blackLogo from '@assets/macropage-connect-black-icon.svg'
import whiteLogo from '@assets/macropage-connect-white-icon.svg'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

export default function Login() {
  const { isAuthenticated } = useAuthStore()
  const { theme } = useUIStore()
  const logo = theme === 'dark' ? whiteLogo : blackLogo
  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()
  const googleAuth = useGoogleAuth()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel - form */}
      <div className="w-full lg:w-1/2 bg-white px-12 py-10 flex flex-col justify-between">
        <div>
          <img src={logo} alt="Macropage Connect" className="h-9" />
        </div>

        <div className="my-6">
          <h2 className="text-4xl font-black text-gray-900">Welcome to</h2>
          <h1 className="text-5xl font-black text-[var(--primary)] mt-1">MACROPAGE CONNECT</h1>
          <p className="text-sm text-gray-400 mt-2 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit((d) => login.mutate({ email: d.email, password: d.password }))} className="space-y-4 max-w-md">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Email address</div>
              <input {...register('email')} type="email" placeholder="you@company.com" autoComplete="email"
                className="h-11 px-4 text-sm bg-[var(--page-bg)] border-0 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:bg-white transition-all placeholder:text-gray-300 w-full" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Password</div>
              </div>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Enter your password"
                  className="h-11 px-4 text-sm bg-[var(--page-bg)] border-0 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:bg-white transition-all placeholder:text-gray-300 w-full pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-xs text-gray-500">
                <input {...register('remember')} type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-xs text-[var(--primary)] font-medium hover:underline">Forgot password?</Link>
            </div>

            <button type="submit" disabled={login.isPending} className="w-full h-11 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--primary-light)] active:scale-[0.98] transition-all mt-6">
              {login.isPending ? <><Loader2 className="animate-spin mr-2" />Signing in…</> : 'Sign in'}
            </button>

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
                text="continue_with"
                shape="pill"
              />
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">Don't have an account? <Link to="/register" className="text-[var(--primary)] font-semibold">Create your free account →</Link></p>
            <p className="text-center text-xs text-gray-400 mt-2">By continuing you agree to our <Link to="#" className="underline">Terms of Service</Link> and <Link to="#" className="underline">Privacy Policy</Link></p>
          </form>
        </div>

        <div className="text-center">
          {/* bottom small text handled above inside form area for alignment */}
        </div>
      </div>

      {/* Right panel - decorative and visual (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[var(--hero)] text-white p-12 overflow-hidden">
        <div style={{ position: 'absolute', top: -80, right: -80, width: 340, height: 340, borderRadius: '50%', background: 'var(--primary-light)', opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: '#0f2d1d', opacity: 0.6 }} />
        <div style={{ position: 'absolute', top: '45%', right: '8%', width: 120, height: 120, borderRadius: '50%', background: 'var(--accent)', opacity: 0.15 }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 0 100px 100px', borderColor: 'transparent transparent #0f2d1d transparent' }} />

        <div className="absolute top-8 right-12 text-right">
          <div className="text-sm text-white/80">Powerful WhatsApp marketing,</div>
          <div className="text-white font-semibold text-base">made simple for your business</div>
          <div className="flex items-center gap-2 mt-4">
            <div className="px-3 py-1.5 bg-white/10 rounded-full text-xs text-white/80">support@macropage.in</div>
            <div className="px-3 py-1.5 bg-white/10 rounded-full text-xs text-white/80">+91 98765 43210</div>
          </div>
        </div>

        {/* Floating white card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-5 w-[340px] text-gray-800 z-10">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Campaign Analytics</div>
            <div className="flex items-center gap-2 text-gray-400">
              <svg width="14" height="14"><circle cx="7" cy="7" r="6" stroke="#d1d5db" strokeWidth="1" fill="none"/></svg>
              <svg width="14" height="14"><circle cx="7" cy="7" r="6" stroke="#d1d5db" strokeWidth="1" fill="none"/></svg>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <div className="bg-[var(--page-bg)] rounded-xl px-3 py-2 text-center flex-1">
              <div className="text-lg font-bold text-[var(--primary)]">24.6k</div>
              <div className="text-2xs text-gray-400">Messages Sent</div>
            </div>
            <div className="bg-[var(--page-bg)] rounded-xl px-3 py-2 text-center">
              <div className="text-lg font-bold text-blue-600">91.2%</div>
              <div className="text-2xs text-gray-400">Delivered</div>
            </div>
            <div className="bg-[var(--page-bg)] rounded-xl px-3 py-2 text-center">
              <div className="text-lg font-bold text-orange-500">68.4%</div>
              <div className="text-2xs text-gray-400">Read Rate</div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="45" fill="none" stroke="#e8ebe8" strokeWidth="14"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#1a5c3a" strokeWidth="14" strokeDasharray="192 84" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 60 60)"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#3b82f6" strokeWidth="14" strokeDasharray="62 214" strokeDashoffset="-192" strokeLinecap="round" transform="rotate(-90 60 60)"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#f97316" strokeWidth="14" strokeDasharray="28 248" strokeDashoffset="-254" strokeLinecap="round" transform="rotate(-90 60 60)"/>
              <text x="60" y="56" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1a1a1a">91%</text>
              <text x="60" y="70" textAnchor="middle" fontSize="9" fill="#9ca3af">Delivery</text>
            </svg>

            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)]" /> <span>Delivered</span> <span className="ml-2 font-medium">68%</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> <span>Read</span> <span className="ml-2 font-medium">22%</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> <span>Failed</span> <span className="ml-2 font-medium">10%</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-col divide-y divide-gray-100 text-sm">
              <div className="flex items-center justify-between py-1.5"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--primary)]"/> <span className="font-medium text-gray-700">Diwali Offer Campaign</span></div><div className="badge badge-green">Completed</div></div>
              <div className="flex items-center justify-between py-1.5"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"/> <span className="font-medium text-gray-700">New User Welcome Series</span></div><div className="badge badge-blue">Running</div></div>
              <div className="flex items-center justify-between py-1.5"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"/> <span className="font-medium text-gray-700">Cart Abandonment Follow-up</span></div><div className="badge badge-yellow">Scheduled</div></div>
            </div>
            <div className="text-xs text-[var(--primary)] font-semibold mt-3 cursor-pointer hover:underline">Set up WhatsApp campaign →</div>
          </div>
        </div>

        {/* Bottom feature pills */}
        <div className="absolute bottom-8 left-12 right-12 flex items-center justify-between gap-3">
          <div className="bg-white/10 backdrop-blur rounded-full px-4 py-2 text-xs text-white/80">💬 Live Chat Inbox</div>
          <div className="bg-white/10 backdrop-blur rounded-full px-4 py-2 text-xs text-white/80">📢 Bulk Campaigns</div>
          <div className="bg-white/10 backdrop-blur rounded-full px-4 py-2 text-xs text-white/80">🤖 Chatbot Automation</div>
        </div>
      </div>
    </div>
  )
}
