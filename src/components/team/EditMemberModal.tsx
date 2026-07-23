import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Trash2, AlertTriangle } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import type { TeamMember } from '@/types'
import { useUpdateMemberRole, useRemoveMember } from '@/hooks/useTeam'
import RoleBadge from './RoleBadge'
import type { Role } from '@/lib/permissions'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  department: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean(),
})
type FormValues = z.infer<typeof schema>

interface EditMemberModalProps { member: TeamMember; onClose: () => void }

export default function EditMemberModal({ member, onClose }: EditMemberModalProps) {
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [removeInput, setRemoveInput] = useState('')

  const updateRole = useUpdateMemberRole()
  const remove = useRemoveMember()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: member.name,
      email: member.email,
      department: member.department ?? '',
      phone: member.phone ?? '',
      isActive: member.status === 'active',
    },
  })

  const isActive = watch('isActive')

  const onSubmit = (_data: FormValues) => {
    // In a real app: api.put(`/team/${member.id}`, data)
    onClose()
  }

  const handleRemove = () => {
    remove.mutate(member.id, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0b1220] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#e8ebe8] dark:border-white/10">
          <p className="text-base font-semibold text-gray-900 dark:text-white flex-1">Edit member</p>
          <button className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-[#f7f8f6] dark:hover:bg-white/5 transition-colors" onClick={onClose}><X size={16} /></button>
        </div>

        {!confirmRemove ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* avatar */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a5c3a] to-teal-600 flex items-center justify-center text-white text-2xl font-semibold cursor-pointer hover:opacity-80 transition-opacity" title="Change photo">
                  {getInitials(member.name)}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Full name *</label>
                <input {...register('name')} className="input" />
                {errors.name && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Email *</label>
                <input {...register('email')} type="email" className="input" />
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">⚠ Changing email will require re-verification</p>
                {errors.email && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Department</label>
                <input {...register('department')} className="input" placeholder="e.g. Sales, Support" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Phone</label>
                <input {...register('phone')} className="input font-mono" placeholder="+91 98765 43210" />
              </div>

              {/* role */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Role</label>
                <div className="flex items-center gap-3">
                  <RoleBadge role={member.role} onChangeRole={(r: Role) => updateRole.mutate({ id: member.id, role: r })} />
                  <span className="text-xs text-gray-400 dark:text-gray-500">Click badge to change role</span>
                </div>
              </div>

              {/* status */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Status</label>
                <label className={cn('flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all', isActive ? 'border-[#1a5c3a] bg-[#e8f5ee]/20' : 'border-red-200 bg-red-50/20')}>
                  <input type="checkbox" {...register('isActive')} className="sr-only" />
                  <div className={cn('relative h-5 w-9 rounded-full transition-colors', isActive ? 'bg-[#1a5c3a]' : 'bg-red-400')}>
                    <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', isActive ? 'translate-x-4' : 'translate-x-0.5')} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{isActive ? 'Active' : 'Inactive'}</p>
                    {!isActive && <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">This will immediately sign them out and revoke access</p>}
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 px-6 py-4 border-t border-[#e8ebe8] dark:border-white/10">
              <button type="button" className="text-red-500 dark:text-red-400 text-sm hover:underline flex items-center gap-1 mr-auto" onClick={() => setConfirmRemove(true)}>
                <Trash2 size={13} /> Delete
              </button>
              <button type="button" className="btn btn-outline h-9 px-4" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary h-9 px-5">Save changes</button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 rounded-xl">
              <AlertTriangle size={18} className="text-red-500 dark:text-red-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">Remove {member.name} from team?</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Their conversation history remains, but they'll lose all platform access.</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Type <strong>REMOVE</strong> to confirm</label>
              <input value={removeInput} onChange={e => setRemoveInput(e.target.value)} className="input font-mono" placeholder="REMOVE" />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-outline h-9 flex-1" onClick={() => { setConfirmRemove(false); setRemoveInput('') }}>Cancel</button>
              <button
                className="btn btn-danger h-9 flex-1 disabled:opacity-50"
                disabled={removeInput !== 'REMOVE' || remove.isPending}
                onClick={handleRemove}
              >
                {remove.isPending ? 'Removing...' : 'Remove member'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
