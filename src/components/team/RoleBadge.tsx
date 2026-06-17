import { useState, useRef, useEffect } from 'react'
import { Crown, Shield, Users, Headphones, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'
import type { Role } from '@/lib/permissions'

type RoleStyleKey = string

export const ROLE_STYLE: Record<RoleStyleKey, { bg: string; text: string; border: string; icon: React.ElementType; label: string }> = {
  owner:   { bg: 'bg-gradient-to-r from-amber-50 to-orange-50', text: 'text-amber-700', border: 'border-amber-200', icon: Crown,      label: 'Owner'   },
  admin:   { bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200', icon: Shield,     label: 'Admin'   },
  manager: { bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200',   icon: Users,      label: 'Manager' },
  agent:   { bg: 'bg-[#e8f5ee]',  text: 'text-[#1a5c3a]', border: 'border-[#c8e6d4]',  icon: Headphones, label: 'Agent'   },
  OWNER:   { bg: 'bg-gradient-to-r from-amber-50 to-orange-50', text: 'text-amber-700', border: 'border-amber-200', icon: Crown,      label: 'Owner'   },
  ADMIN:   { bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200', icon: Shield,     label: 'Admin'   },
  MANAGER: { bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200',   icon: Users,      label: 'Manager' },
  AGENT:   { bg: 'bg-[#e8f5ee]',  text: 'text-[#1a5c3a]', border: 'border-[#c8e6d4]',  icon: Headphones, label: 'Agent'   },
}

interface RoleBadgeProps {
  role: UserRole
  size?: 'sm' | 'md' | 'lg'
  /** if provided, clicking badge shows role-change popover */
  onChangeRole?: (newRole: Role) => void
  disabled?: boolean
  disabledReason?: string
}

export default function RoleBadge({ role, size = 'md', onChangeRole, disabled, disabledReason }: RoleBadgeProps) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState<Role | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const s = ROLE_STYLE[role]
  const Icon = s.icon

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setConfirm(null) }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const sizeClass = size === 'sm'
    ? 'text-[10px] px-2 py-0.5'
    : size === 'lg'
      ? 'text-sm px-4 py-1.5'
      : 'text-xs px-3 py-1'

  const badge = (
    <span
      className={cn(
        'inline-flex items-center border rounded-full font-semibold transition-all',
        s.bg, s.text, s.border, sizeClass,
        onChangeRole && !disabled && 'cursor-pointer hover:opacity-80'
      )}
      title={disabled ? disabledReason : undefined}
      onClick={() => onChangeRole && !disabled && setOpen(v => !v)}
    >
      <Icon size={size === 'lg' ? 13 : 11} className="mr-1.5" />
      {s.label}
    </span>
  )

  if (!onChangeRole) return badge

  const ROLE_OPTIONS: { value: Role; icon: React.ElementType; label: string; disabled?: boolean }[] = [
    { value: 'OWNER',   icon: Crown,      label: 'Owner',   disabled: true },
    { value: 'ADMIN',   icon: Shield,     label: 'Admin' },
    { value: 'MANAGER', icon: Users,      label: 'Manager' },
    { value: 'AGENT',   icon: Headphones, label: 'Agent' },
  ]

  return (
    <div className="relative inline-block" ref={ref}>
      {badge}

      {open && (
        <div className="absolute left-0 top-8 z-50 bg-white border border-[#e8ebe8] rounded-xl shadow-lg p-2 w-48">
          {confirm ? (
            <div className="px-2 py-1">
              <p className="text-xs text-gray-600 mb-3">
                Change role to <strong>{confirm}</strong>?
              </p>
              <div className="flex gap-2">
                <button
                  className="btn btn-primary h-7 px-3 text-xs flex-1"
                  onClick={() => { onChangeRole(confirm); setOpen(false); setConfirm(null) }}
                >Confirm</button>
                <button className="btn btn-outline h-7 px-3 text-xs" onClick={() => setConfirm(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[10px] text-gray-400 px-3 py-2 uppercase tracking-wider">Change role</p>
              {ROLE_OPTIONS.map(opt => {
                const OIcon = opt.icon
                const isActive = opt.value === role
                return (
                  <button
                    key={opt.value}
                    disabled={opt.disabled}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors',
                      isActive ? 'bg-[#e8f5ee] text-[#1a5c3a] font-medium' : 'text-gray-700 hover:bg-[#f7f8f6]',
                      opt.disabled && 'opacity-40 cursor-not-allowed'
                    )}
                    title={opt.disabled ? 'Cannot assign Owner role' : undefined}
                    onClick={() => !opt.disabled && !isActive && setConfirm(opt.value)}
                  >
                    <OIcon size={14} />
                    <span>{opt.label}</span>
                    {isActive && <Check size={13} className="ml-auto" />}
                  </button>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
