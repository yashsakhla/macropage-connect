import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain number'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ['confirm'] })
type FormData = z.infer<typeof schema>

export default function ResetPassword() {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    if (!token) { toast.error('Invalid reset link'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password: data.password })
      toast.success('Password updated — please sign in')
      navigate('/login')
    } finally { setLoading(false) }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--page-bg)] p-6">
        <div className="card p-6 text-center">
          <h2 className="text-lg font-semibold">This reset link is invalid or has expired</h2>
          <p className="text-sm text-gray-500 mt-2">Request a new link to reset your password</p>
          <div className="mt-4">
            <Link to="/forgot-password" className="btn btn-outline">Request a new link</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--page-bg)] p-6">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-lg font-semibold">Set new password</h1>
          <p className="text-sm text-gray-500 mt-1">Choose a strong password for your account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700">New password</label>
              <div className="relative mt-1">
                <input {...register('password')} type={show ? 'text' : 'password'} placeholder="••••••••" className={cn('input pr-10', errors.password && 'border-red-400')} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Confirm password</label>
              <input {...register('confirm')} type={show ? 'text' : 'password'} placeholder="••••••••" className={cn('input mt-1', errors.confirm && 'border-red-400')} />
              {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full h-10">{loading ? <><Loader2 className="animate-spin" /> Updating…</> : 'Update password'}</button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">Remembered it? <Link to="/login" className="text-[var(--primary)] font-medium">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}
