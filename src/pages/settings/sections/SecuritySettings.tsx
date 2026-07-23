import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, CheckCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import SettingsSection from '@/components/settings/SettingsSection'
import TwoFactorSetup from '@/components/settings/TwoFactorSetup'
import SessionsTable from '@/components/settings/SessionsTable'
import { useChangePassword, useActiveSessions, useRevokeSession, useRevokeAllSessions } from '@/hooks/useProfile'
import type { ActiveSession } from '@/types'

const schema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type FormValues = z.infer<typeof schema>

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={cn('flex items-center gap-1.5 text-xs', met ? 'text-[#1a5c3a]' : 'text-gray-400 dark:text-gray-500')}>
      {met ? <CheckCircle size={12} /> : <Circle size={12} />}
      {label}
    </div>
  )
}

export default function SecuritySettings() {
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [twoFaEnabled, setTwoFaEnabled] = useState(false)

  const changePassword = useChangePassword()
  const { data: sessionsData } = useActiveSessions()
  const revokeSession = useRevokeSession()
  const revokeAll = useRevokeAllSessions()

  const sessions = ((sessionsData as any) ?? []) as ActiveSession[]

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const newPw = watch('newPassword') ?? ''

  function onSubmit(values: FormValues) {
    changePassword.mutate({ currentPassword: values.currentPassword, newPassword: values.newPassword }, { onSuccess: () => reset() })
  }

  const reqs = [
    { met: newPw.length >= 8, label: 'At least 8 characters' },
    { met: /[A-Z]/.test(newPw), label: 'One uppercase letter' },
    { met: /[0-9]/.test(newPw), label: 'One number' },
    { met: /[^A-Za-z0-9]/.test(newPw), label: 'One special character' },
  ]

  const strength = reqs.filter(r => r.met).length

  return (
    <SettingsSection title="Security" subtitle="Protect your account with additional security">
      {/* Password */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-6">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-5">Password</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          {([
            { field: 'currentPassword', label: 'Current password', key: 'current' },
            { field: 'newPassword', label: 'New password', key: 'new' },
            { field: 'confirmPassword', label: 'Confirm new password', key: 'confirm' },
          ] as const).map(({ field, label, key }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  {...register(field)}
                  type={showPw[key] ? 'text' : 'password'}
                  className={cn('input w-full h-9 text-sm pr-10', errors[field] && 'border-red-400')}
                />
                <button type="button" onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))} className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500">
                  {showPw[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors[field] && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors[field]?.message}</p>}
            </div>
          ))}

          {newPw && (
            <div>
              <div className="flex gap-1 mb-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className={cn('flex-1 h-1.5 rounded-full transition-all', i <= strength ? strength <= 1 ? 'bg-red-400' : strength <= 2 ? 'bg-amber-400' : strength <= 3 ? 'bg-blue-500' : 'bg-[#1a5c3a]' : 'bg-gray-200 dark:bg-white/10')} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {reqs.map(r => <PasswordRequirement key={r.label} met={r.met} label={r.label} />)}
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary h-10 text-sm" disabled={changePassword.isPending}>
            {changePassword.isPending ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>

      {/* 2FA */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-6 mt-6">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-5">Two-factor authentication</p>
        <TwoFactorSetup isEnabled={twoFaEnabled} onEnable={() => setTwoFaEnabled(true)} onDisable={() => setTwoFaEnabled(false)} />
      </div>

      {/* Sessions */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-6 mt-6">
        <SessionsTable sessions={sessions} onRevoke={id => revokeSession.mutate(id)} onRevokeAll={() => revokeAll.mutate()} />
      </div>
    </SettingsSection>
  )
}
