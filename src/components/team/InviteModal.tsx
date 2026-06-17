import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, UserPlus, Shield, Users, Headphones, CheckCircle, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInviteMember } from '@/hooks/useTeam'
import { ROLE_PERMISSIONS, type Role } from '@/lib/permissions'
import { ROLE_STYLE } from './RoleBadge'
import toast from 'react-hot-toast'

const ROLE_CARDS: { value: string; icon: React.ElementType; title: string; can: string[]; cannot: string[] }[] = [
  {
    value: 'admin', icon: Shield, title: 'Admin',
    can: ['Manage team', 'All conversations', 'Create campaigns', 'Platform settings'],
    cannot: ['Billing access'],
  },
  {
    value: 'manager', icon: Users, title: 'Manager',
    can: ['All conversations', 'Create campaigns', 'Invite agents'],
    cannot: ['Platform settings', 'Billing'],
  },
  {
    value: 'agent', icon: Headphones, title: 'Agent',
    can: ['Assigned conversations', 'View contacts'],
    cannot: ['Create campaigns', 'Team management', 'Analytics'],
  },
]

const EXPIRY_OPTIONS = [
  { value: '24h', label: '24 hours' },
  { value: '3d',  label: '3 days' },
  { value: '7d',  label: '7 days' },
  { value: 'never', label: 'Never' },
] as const

const stepOneSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Valid email required'),
  department: z.string().optional(),
})

const stepTwoSchema = z.object({
  role: z.enum(['admin', 'manager', 'agent']),
  message: z.string().max(200).optional(),
  expiresIn: z.enum(['24h', '3d', '7d', 'never']),
})

type Step1Values = z.infer<typeof stepOneSchema>
type Step2Values = z.infer<typeof stepTwoSchema>

interface InviteModalProps { onClose: () => void }

export default function InviteModal({ onClose }: InviteModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [mode, setMode] = useState<'single' | 'bulk'>('single')
  const [step1Data, setStep1Data] = useState<Step1Values | null>(null)
  const [bulkEmails, setBulkEmails] = useState('')
  const [copied, setCopied] = useState(false)

  const invite = useInviteMember()

  const form1 = useForm<Step1Values>({ resolver: zodResolver(stepOneSchema), defaultValues: { name: '', email: '', department: '' } })
  const form2 = useForm<Step2Values>({ resolver: zodResolver(stepTwoSchema), defaultValues: { role: 'agent', message: '', expiresIn: '3d' } })

  const selectedRole = form2.watch('role')
  const msgLen = form2.watch('message')?.length ?? 0

  const parsedBulk = bulkEmails
    .split(/[\n,;]+/)
    .map(e => e.trim())
    .filter(e => e.length > 0)

  const validBulk = parsedBulk.filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))

  const handleStep1 = form1.handleSubmit(data => { setStep1Data(data); setStep(2) })

  const handleInvite = form2.handleSubmit(data => {
    const email = mode === 'single' ? step1Data!.email : validBulk[0]
    invite.mutate(
      { emails: [email], role: data.role, message: data.message, expiresIn: data.expiresIn },
      { onSuccess: onClose }
    )
  })

  const copyLink = () => {
    navigator.clipboard.writeText('https://app.macropage.in/invite/abc123xyz')
    setCopied(true)
    toast.success('Invite link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const permCount = ROLE_PERMISSIONS[(selectedRole as string).toUpperCase() as Role]?.length ?? 0

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* header */}
        <div className="flex items-center gap-4 px-6 pt-6 pb-5 border-b border-[#e8ebe8]">
          <div className="w-10 h-10 bg-[#e8f5ee] rounded-xl flex items-center justify-center flex-shrink-0">
            <UserPlus size={18} className="text-[#1a5c3a]" />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-gray-900">Invite team member</p>
            <p className="text-sm text-gray-400">They'll get an email to join your account</p>
          </div>
          <button className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-[#f7f8f6] transition-colors" onClick={onClose}><X size={16} /></button>
        </div>

        {/* step indicator */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f5f5f5]">
          {[['1. Details', 1], ['2. Role & Permissions', 2]].map(([label, s]) => (
            <div key={s} className={cn('flex items-center gap-1.5 text-xs font-medium', step >= Number(s) ? 'text-[#1a5c3a]' : 'text-gray-400')}>
              <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px]',
                step >= Number(s) ? 'bg-[#1a5c3a] text-white' : 'bg-gray-100 text-gray-400')}>
                {step > Number(s) ? <Check size={10} /> : s}
              </div>
              {label}
            </div>
          ))}
        </div>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              {/* mode toggle */}
              <div className="flex bg-[#f7f8f6] p-1 rounded-xl w-fit">
                {[['single', 'Single invite'], ['bulk', 'Bulk invite']].map(([v, l]) => (
                  <button key={v} onClick={() => setMode(v as 'single' | 'bulk')}
                    className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all', mode === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}>
                    {l}
                  </button>
                ))}
              </div>

              {mode === 'single' ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Full name <span className="text-gray-400">(optional)</span></label>
                    <input {...form1.register('name')} className="input" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                    <input {...form1.register('email')} type="email" className={cn('input', form1.formState.errors.email && 'border-red-300')} placeholder="john@company.com" />
                    {form1.formState.errors.email && <p className="text-xs text-red-500 mt-1">{form1.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Department <span className="text-gray-400">(optional)</span></label>
                    <input {...form1.register('department')} className="input" placeholder="e.g. Sales, Support" />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email addresses</label>
                  <textarea
                    value={bulkEmails} onChange={e => setBulkEmails(e.target.value)}
                    className="input h-auto py-2 resize-none text-sm font-mono"
                    rows={5}
                    placeholder={"john@company.com\njane@company.com, mike@company.com"}
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {parsedBulk.map(email => {
                      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                      return (
                        <span key={email} className={cn('text-xs rounded-full px-3 py-1.5 font-medium', valid ? 'bg-[#e8f5ee] text-[#1a5c3a]' : 'bg-red-50 text-red-600')}>
                          {email}
                        </span>
                      )
                    })}
                  </div>
                  {parsedBulk.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">{validBulk.length} valid email{validBulk.length !== 1 ? 's' : ''}</p>
                  )}
                </div>
              )}

              <button type="button" className="btn btn-primary w-full h-10"
                onClick={mode === 'single' ? handleStep1 : () => { if (validBulk.length > 0) setStep(2) }}>
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <button type="button" className="btn-ghost text-sm flex items-center gap-1 text-gray-500" onClick={() => setStep(1)}>← Back</button>

              {/* role cards */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Assign role *</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLE_CARDS.map(r => {
                    const Icon = r.icon
                    const isSelected = selectedRole === r.value
                    const rs = ROLE_STYLE[r.value]
                    return (
                      <div key={r.value} onClick={() => form2.setValue('role', r.value as 'admin' | 'manager' | 'agent')}
                        className={cn('border-2 rounded-xl p-3 cursor-pointer transition-all relative', isSelected ? 'border-[#1a5c3a] bg-[#e8f5ee]/30' : 'border-[#e8ebe8] hover:border-[#c8e6d4]')}>
                        {isSelected && <CheckCircle size={13} className="absolute top-2 right-2 text-[#1a5c3a]" />}
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', rs.bg)}>
                          <Icon size={15} className={rs.text} />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{r.title}</p>
                        <div className="mt-2 space-y-0.5">
                          {r.can.map(p => <p key={p} className="text-[10px] text-[#1a5c3a]">✓ {p}</p>)}
                          {r.cannot.map(p => <p key={p} className="text-[10px] text-gray-400">✗ {p}</p>)}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">{permCount} permissions enabled for this role</p>
              </div>

              {/* message */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Personal note <span className="text-gray-400">(optional)</span></label>
                <textarea {...form2.register('message')} className="input h-auto py-2 resize-none" rows={2} placeholder="Welcome to the team! We're excited to have you." maxLength={200} />
                <p className="text-[10px] text-gray-400 text-right mt-1">{msgLen}/200</p>
              </div>

              {/* expiry */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Invitation expires after</label>
                <div className="flex gap-2 flex-wrap">
                  {EXPIRY_OPTIONS.map(opt => (
                    <label key={opt.value} className={cn('flex items-center gap-1.5 border rounded-xl px-3 py-2 cursor-pointer text-sm transition-all', form2.watch('expiresIn') === opt.value ? 'border-[#1a5c3a] bg-[#e8f5ee]/30 text-[#1a5c3a]' : 'border-[#e8ebe8] text-gray-600')}>
                      <input type="radio" {...form2.register('expiresIn')} value={opt.value} className="sr-only" />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <button type="button" className="btn btn-primary w-full h-10" onClick={handleInvite} disabled={invite.isPending}>
                {invite.isPending ? 'Sending...' : 'Send invitation'}
              </button>
            </div>
          )}
        </div>

        {/* footer invite link */}
        <div className="px-6 pb-5 border-t border-[#f5f5f5] pt-4">
          <p className="text-xs text-gray-500 mb-2">Or share invite link</p>
          <div className="bg-[#f7f8f6] rounded-xl px-3 py-2.5 flex items-center gap-2">
            <span className="font-mono text-xs text-gray-600 flex-1 truncate">https://app.macropage.in/invite/abc123xyz</span>
            <button className="btn-ghost text-xs h-7 px-3 flex items-center gap-1" onClick={copyLink}>
              {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Link valid for 7 days</p>
        </div>
      </div>
    </div>
  )
}
