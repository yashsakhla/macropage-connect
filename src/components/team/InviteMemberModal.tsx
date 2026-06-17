import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Shield, Users, Headphones, CheckCircle, XCircle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'
import { useInviteMember } from '@/hooks/useTeam'

const schema = z.object({
  email: z.string().email('Valid email required'),
  role: z.enum(['admin', 'manager', 'agent']),
  message: z.string().max(200).optional(),
})
type FormValues = z.infer<typeof schema>

const ROLES: { value: UserRole; icon: React.ElementType; label: string; desc: string; iconBg: string; iconColor: string }[] = [
  { value: 'admin',   icon: Shield,     label: 'Admin',   desc: 'Full access — manage everything',          iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  { value: 'manager', icon: Users,      label: 'Manager', desc: 'Manage team, view all conversations',      iconBg: 'bg-blue-50',   iconColor: 'text-blue-600'   },
  { value: 'agent',   icon: Headphones, label: 'Agent',   desc: 'Handle assigned conversations',            iconBg: 'bg-[#e8f5ee]', iconColor: 'text-[#1a5c3a]' },
]

const PERMISSIONS: Record<string, { can: string[]; cannot: string[] }> = {
  owner: {
    can:    ['Full platform access'],
    cannot: [],
  },
  admin: {
    can:    ['Manage team members', 'Access billing', 'View all conversations', 'Create/delete campaigns', 'Connect WhatsApp account'],
    cannot: [],
  },
  manager: {
    can:    ['View all conversations', 'Manage agents', 'Create campaigns', 'View analytics'],
    cannot: ['Access billing', 'Add team members'],
  },
  agent: {
    can:    ['View assigned conversations', 'Reply to messages', 'View contacts'],
    cannot: ['Create campaigns', "View other agents' conversations", 'Access settings'],
  },
}

interface InviteMemberModalProps { onClose: () => void }

export default function InviteMemberModal({ onClose }: InviteMemberModalProps) {
  const [multiOpen, setMultiOpen] = useState(false)
  const invite = useInviteMember()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: 'agent', message: '' },
  })

  const selectedRole = watch('role')
  const perms = PERMISSIONS[selectedRole]

  const onSubmit = (data: FormValues) => {
    invite.mutate(
      { emails: [data.email], role: data.role.toUpperCase(), message: data.message || undefined, expiresIn: '7d' },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-2xl flex flex-col max-h-[calc(100vh-32px)] overflow-y-auto">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#e8ebe8]">
          <div className="flex-1">
            <p className="text-base font-semibold text-gray-900">Invite team member</p>
            <p className="text-xs text-gray-500 mt-0.5">They'll receive an email to create their account</p>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-[#f7f8f6] transition-colors" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          {/* email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email address *</label>
            <input {...register('email')} type="email" className="input" placeholder="colleague@company.com" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* role cards */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => {
                const Icon = r.icon
                const selected = selectedRole === r.value
                return (
                  <div key={r.value} onClick={() => setValue('role', r.value as 'admin' | 'manager' | 'agent')}
                    className={cn('border-2 rounded-xl p-3 cursor-pointer transition-all relative', selected ? 'border-[#1a5c3a] bg-[#fafffe]' : 'border-[#e8ebe8] hover:border-[#c8e6d4]')}>
                    {selected && <CheckCircle size={13} className="absolute top-2 right-2 text-[#1a5c3a]" />}
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', r.iconBg)}>
                      <Icon size={16} className={r.iconColor} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{r.label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{r.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* permissions preview */}
          <div className="bg-[#f7f8f6] rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Role permissions</p>
            <div className="space-y-1.5">
              {perms.can.map(p => (
                <div key={p} className="flex items-center gap-2 text-xs text-[#1a5c3a]">
                  <CheckCircle size={12} className="flex-shrink-0" /> {p}
                </div>
              ))}
              {perms.cannot.map(p => (
                <div key={p} className="flex items-center gap-2 text-xs text-gray-400">
                  <XCircle size={12} className="flex-shrink-0" /> {p}
                </div>
              ))}
            </div>
          </div>

          {/* personal message */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Personal message (optional)</label>
            <textarea {...register('message')} className="input h-auto py-2 resize-none" rows={3} placeholder="Add a personal note to the invitation..." maxLength={200} />
            <p className="text-[10px] text-gray-400 text-right mt-1">{watch('message')?.length ?? 0}/200</p>
          </div>

          {/* multi-invite toggle */}
          <div>
            <button type="button" onClick={() => setMultiOpen(v => !v)}
              className="flex items-center gap-1.5 text-sm text-[#1a5c3a] font-medium hover:underline">
              Invite multiple people
              <ChevronDown size={14} className={cn('transition-transform', multiOpen && 'rotate-180')} />
            </button>
            {multiOpen && (
              <div className="mt-3">
                <textarea className="input h-auto py-2 resize-none text-xs font-mono" rows={3} placeholder="email1@co.com, email2@co.com, email3@co.com" />
                <p className="text-xs text-gray-500 mt-1">Paste multiple emails separated by commas</p>
              </div>
            )}
          </div>
        </form>

        <div className="flex items-center gap-2 px-6 py-4 border-t border-[#e8ebe8]">
          <button type="button" className="btn btn-ghost h-9 px-4" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary h-9 px-5 ml-auto" onClick={handleSubmit(onSubmit)} disabled={invite.isPending}>
            {invite.isPending ? 'Sending...' : 'Send invitation'}
          </button>
        </div>
      </div>
    </div>
  )
}
