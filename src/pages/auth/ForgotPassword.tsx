import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Loader2, ArrowLeft, CheckCircle2, Mail } from 'lucide-react'
import { useState } from 'react'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormData = z.infer<typeof schema>

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', data)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <CheckCircle2 size={40} className="text-brand-300" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Check your email</h1>
        <p className="text-sm text-gray-500">
          We sent a reset link to <span className="font-medium text-gray-700 dark:text-gray-300">{getValues('email')}</span>
        </p>
        <p className="text-xs text-gray-400">Didn't receive it? Check your spam folder or try again in a few minutes.</p>
        <Link to="/login" className="btn-outline w-full h-10 flex items-center justify-center gap-2 mt-2">
          <ArrowLeft size={15} /> Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Forgot your password?</h1>
        <p className="text-sm text-gray-500 mt-0.5">Enter your email and we'll send you a reset link</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Email address</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={16} /></div>
            <input {...register('email')} type="email" placeholder="you@company.com"
              className={cn('input pl-10', errors.email && 'border-red-400')} />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full h-10">
          {loading ? <><Loader2 size={15} className="animate-spin" />Sending…</> : 'Send reset link'}
        </button>
      </form>
      <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={14} /> Back to sign in
      </Link>
    </div>
  )
}
