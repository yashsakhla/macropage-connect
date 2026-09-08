import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Loader2, ArrowLeft, CheckCircle2, Mail, AlertCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { AxiosError } from 'axios'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'
import type { ApiErrorResponse } from '@/types'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormData = z.infer<typeof schema>

const COOLDOWN_SECONDS = 60

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  const sendResetLink = (email: string) => api.post('/auth/forgot-password', { email })

  const onSubmit = async (data: FormData) => {
    if (cooldown > 0) return
    setLoading(true)
    setSubmitError('')
    try {
      await sendResetLink(data.email)
      setSent(true)
      startCooldown()
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      const code = error.response?.data?.code ?? error.response?.data?.error?.code
      setSubmitError(
        code === 'EMAIL_NOT_FOUND'
          ? '😕 No registered account found with this email.'
          : error.response?.data?.message ?? 'Something went wrong. Please try again.'
      )
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
        <p className="text-xs text-gray-400">Didn't receive it? Check your spam folder or resend the link.</p>
        {resent && !submitError && (
          <p className="text-xs text-brand-300 font-medium">A new reset link is on its way.</p>
        )}
        {submitError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 text-left">
            <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 leading-snug">{submitError}</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <button
            type="button"
            disabled={resending || cooldown > 0}
            onClick={async () => {
              if (cooldown > 0) return
              setResending(true)
              setSubmitError('')
              setResent(false)
              try {
                await sendResetLink(getValues('email'))
                setResent(true)
                startCooldown()
              } catch (err) {
                const error = err as AxiosError<ApiErrorResponse>
                setSubmitError(error.response?.data?.message ?? 'Something went wrong. Please try again.')
              } finally {
                setResending(false)
              }
            }}
            className="btn-primary flex-1 h-10"
          >
            {resending
              ? <><Loader2 size={15} className="animate-spin" />Resending…</>
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : 'Resend reset link'}
          </button>
          <Link to="/login" className="btn-outline flex-1 h-10 flex items-center justify-center gap-2">
            <ArrowLeft size={15} /> Back to sign in
          </Link>
        </div>
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
        <button type="submit" disabled={loading || cooldown > 0} className="btn-primary w-full h-10">
          {loading
            ? <><Loader2 size={15} className="animate-spin" />Sending…</>
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : 'Send reset link'}
        </button>

        {submitError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
            <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 leading-snug">{submitError}</p>
          </div>
        )}
      </form>
      <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={14} /> Back to sign in
      </Link>
    </div>
  )
}
