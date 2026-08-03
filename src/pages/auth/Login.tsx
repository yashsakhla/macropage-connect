import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { useLogin, useGoogleAuth } from '@/hooks/useAuth'
import { useElementWidth } from '@/hooks/useElementWidth'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useRememberMeStore } from '@/store/rememberMeStore'
import { stripEmojis } from '@/lib/utils'
import FormError from '@/components/shared/FormError'
import blackLogo from '@assets/macropage-connect-black-icon.svg'
import whiteLogo from '@assets/macropage-connect-white-icon.svg'
import loginVideo from '@/assets/login/marketing.mp4'

const schema = z.object({
  email:    z.string().min(1, 'Email is required').max(254, 'Email must be at most 254 characters').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(64, 'Password must be at most 64 characters'),
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
  const { rememberedEmail, setRememberedEmail } = useRememberMeStore()
  const { ref: googleBtnRef, width: googleBtnWidth } = useElementWidth<HTMLDivElement>()
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { email: rememberedEmail ?? '', remember: !!rememberedEmail },
  })

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel - form */}
      <div className="w-full lg:w-1/2 bg-white px-5 py-6 sm:px-10 sm:py-8 lg:px-12 lg:py-10 flex flex-col justify-between">
        <div>
          <img src={logo} alt="Macropage Connect" className="h-8 sm:h-9" />
        </div>

        <div className="my-4 sm:my-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">Welcome to</h2>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--primary)] mt-1">MACROPAGE CONNECT</h1>
          <p className="text-sm text-gray-400 mt-2 mb-5 sm:mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit((d) => {
            setRememberedEmail(d.remember ? d.email : null)
            login.mutate({ email: d.email, password: d.password })
          })} className="space-y-4 max-w-md">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Email address</div>
              <input {...register('email')} type="email" placeholder="you@company.com" autoComplete="email" maxLength={254}
                onInput={(e) => { e.currentTarget.value = stripEmojis(e.currentTarget.value) }}
                className="h-11 px-4 text-sm bg-[var(--page-bg)] border-0 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:bg-white transition-all placeholder:text-gray-300 w-full" />
              <FormError message={errors.email?.message} />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Password</div>
              </div>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Enter your password" maxLength={64}
                  onInput={(e) => { e.currentTarget.value = stripEmojis(e.currentTarget.value) }}
                  className="h-11 px-4 text-sm bg-[var(--page-bg)] border-0 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:bg-white transition-all placeholder:text-gray-300 w-full pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <FormError message={errors.password?.message} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-xs text-gray-500">
                <input {...register('remember')} type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[var(--primary)]" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-xs text-[var(--primary)] font-medium hover:underline">Forgot password?</Link>
            </div>

            <button type="submit" disabled={login.isPending || !isValid} className="w-full h-11 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--primary-light)] active:scale-[0.98] transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
              {login.isPending ? <><Loader2 className="animate-spin mr-2" />Signing in…</> : 'Sign in'}
            </button>

            <div className="flex items-center gap-3 my-4">
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
                  text="continue_with"
                  shape="pill"
                />
              )}
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">Don't have an account? <Link to="/register" className="text-[var(--primary)] font-semibold">Create your free account →</Link></p>
            <p className="text-center text-xs text-gray-400 mt-2">By continuing you agree to our <a href="https://www.macropageconnect.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline">Terms of Service</a> and <a href="https://www.macropageconnect.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a></p>
          </form>
        </div>

        <div className="text-center">
          {/* bottom small text handled above inside form area for alignment */}
        </div>
      </div>

      {/* Right panel - marketing video (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black text-white overflow-hidden items-center justify-center">
        <video
          src={loginVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/70" />

        <div className="absolute top-8 left-12 right-12 flex items-center justify-between">
          <div>
            <div className="text-sm text-white/80">Powerful WhatsApp marketing,</div>
            <div className="text-white font-semibold text-base">made simple for your business</div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur rounded-full text-xs text-white/80">contact@macropageconnect.com</div>
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur rounded-full text-xs text-white/80">+91 98765 43210</div>
          </div>
        </div>

        {/* Bottom feature pills */}
        <div className="absolute bottom-8 left-12 right-12 flex items-center justify-between gap-3">
          <div className="bg-white/10 backdrop-blur rounded-full px-4 py-2 text-xs text-white/80 whitespace-nowrap">💬 Live Chat Inbox</div>
          <div className="bg-white/10 backdrop-blur rounded-full px-4 py-2 text-xs text-white/80 whitespace-nowrap">📢 Bulk Campaigns</div>
          <div className="bg-white/10 backdrop-blur rounded-full px-4 py-2 text-xs text-white/80 whitespace-nowrap">🤖 Chatbot Automation</div>
        </div>
      </div>
    </div>
  )
}
