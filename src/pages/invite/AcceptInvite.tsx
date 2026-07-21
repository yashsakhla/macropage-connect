import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import {
  useVerifyInviteToken,
  useAcceptInvite,
} from '@/hooks/useTeam'
import {
  Eye, EyeOff, Lock, User,
  CheckCircle, XCircle, Loader2,
  AlertCircle, ArrowRight, Mail,
  UserCheck, MessageSquare,
} from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  password: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Must include uppercase, lowercase and number'
    ),
  confirmPassword: z.string(),
}).refine(
  data => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
)

type FormData = z.infer<typeof schema>

export default function AcceptInvite() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    data: inviteData,
    isLoading: verifying,
    isError: tokenError,
    error: tokenErr,
  } = useVerifyInviteToken(token)

  const {
    mutate: accept,
    isPending: accepting,
    isError: acceptError,
    error: acceptErr,
  } = useAcceptInvite()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: (inviteData as any)?.name ?? '',
    },
  })

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token])

  const onSubmit = (data: FormData) => {
    if (!token) return
    accept({
      token,
      name: data.name,
      password: data.password,
      confirmPassword: data.confirmPassword,
    })
  }

  const password = watch('password') ?? ''

  const strength = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  }
  const strengthScore = Object.values(strength).filter(Boolean).length

  const tokenErrAny = tokenErr as any

  return (
    <div className="min-h-screen bg-[#f7f8f6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1a3d2b] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <MessageSquare size={22} className="text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Macropage Connect</h1>
        </div>

        {/* Loading */}
        {verifying && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <Loader2 size={28} className="animate-spin text-[#1a5c3a] mx-auto mb-4" />
            <p className="text-sm text-gray-500">Verifying your invite link...</p>
          </div>
        )}

        {/* Token error */}
        {tokenError && !verifying && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle size={28} className="text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {(() => {
                const code = tokenErrAny?.response?.data?.code
                if (code === 'INVITE_EXPIRED') return 'Invite link expired'
                if (code === 'INVITE_ALREADY_ACCEPTED') return 'Already accepted'
                if (code === 'INVITE_CANCELLED') return 'Invite cancelled'
                return 'Invalid invite link'
              })()}
            </h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              {tokenErrAny?.response?.data?.message ?? 'This invite link is not valid.'}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full h-11 bg-[#1a5c3a] text-white rounded-2xl font-semibold text-sm"
            >
              Go to login
            </button>
          </div>
        )}

        {/* Valid token — show form */}
        {!verifying && !tokenError && inviteData && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

            {/* Invite info header */}
            <div className="bg-gradient-to-br from-[#1a3d2b] to-[#2d7a4f] px-6 py-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center">
                  <UserCheck size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs">You've been invited by</p>
                  <p className="text-white font-bold text-sm">
                    {(inviteData as any).invitedByName}
                  </p>
                </div>
              </div>

              <h2 className="text-xl font-black text-white">
                Join {(inviteData as any).tenantName}
              </h2>
              <p className="text-white/70 text-sm mt-1">
                You'll join as a{' '}
                <span className="text-white font-semibold">
                  {(inviteData as any).role}
                </span>
              </p>

              {/* Email badge */}
              <div className="mt-4 bg-white/15 border border-white/20 rounded-xl px-3 py-2 flex items-center gap-2 w-fit">
                <Mail size={13} className="text-white/70" />
                <span className="text-white text-xs font-medium">
                  {(inviteData as any).email}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-4">
              <p className="text-sm font-semibold text-gray-700">Set up your account</p>

              {/* Accept error */}
              {acceptError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  <AlertCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600">
                    {(acceptErr as any)?.response?.data?.message ??
                     'Could not create account. Try again.'}
                  </p>
                </div>
              )}

              {/* Full name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Your full name
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="Rahul Sharma"
                    defaultValue={(inviteData as any).name ?? ''}
                    className={cn(
                      'w-full h-11 pl-9 pr-4 rounded-xl',
                      'border text-sm focus:outline-none',
                      'focus:ring-2 focus:ring-[#1a5c3a]/20',
                      'focus:border-[#1a5c3a]',
                      'placeholder:text-gray-300',
                      errors.name ? 'border-red-300 bg-red-50' : 'border-[#e8ebe8]'
                    )}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Create password
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    className={cn(
                      'w-full h-11 pl-9 pr-10 rounded-xl',
                      'border text-sm focus:outline-none',
                      'focus:ring-2 focus:ring-[#1a5c3a]/20',
                      'focus:border-[#1a5c3a]',
                      'placeholder:text-gray-300',
                      errors.password ? 'border-red-300 bg-red-50' : 'border-[#e8ebe8]'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Password strength */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1.5">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className={cn(
                            'flex-1 h-1 rounded-full transition-colors',
                            i <= strengthScore
                              ? strengthScore <= 1
                                ? 'bg-red-400'
                                : strengthScore <= 2
                                ? 'bg-amber-400'
                                : strengthScore <= 3
                                ? 'bg-blue-400'
                                : 'bg-[#1a5c3a]'
                              : 'bg-gray-100'
                          )}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { key: 'length',    label: '8+ characters' },
                        { key: 'uppercase', label: 'Uppercase letter' },
                        { key: 'lowercase', label: 'Lowercase letter' },
                        { key: 'number',    label: 'Number' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-1">
                          <CheckCircle
                            size={11}
                            className={cn(
                              strength[key as keyof typeof strength]
                                ? 'text-[#1a5c3a]'
                                : 'text-gray-200'
                            )}
                          />
                          <span className={cn(
                            'text-2xs',
                            strength[key as keyof typeof strength]
                              ? 'text-gray-500'
                              : 'text-gray-300'
                          )}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirm password
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    {...register('confirmPassword')}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat password"
                    className={cn(
                      'w-full h-11 pl-9 pr-10 rounded-xl',
                      'border text-sm focus:outline-none',
                      'focus:ring-2 focus:ring-[#1a5c3a]/20',
                      'focus:border-[#1a5c3a]',
                      'placeholder:text-gray-300',
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-[#e8ebe8]'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={accepting}
                className="w-full h-12 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors mt-2"
              >
                {accepting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Join {(inviteData as any).tenantName}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                By joining you agree to our{' '}
                <a href="https://www.macropageconnect.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-[#1a5c3a] underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="https://www.macropageconnect.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#1a5c3a] underline">
                  Privacy Policy
                </a>
              </p>
            </form>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Macropage Connect · Team Invitation
        </p>
      </div>
    </div>
  )
}
