import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreVertical, Shield, Users, Headphones } from 'lucide-react'
import { cn, getInitials, fromNow } from '@/lib/utils'
import type { TeamMember, UserRole } from '@/types'
import { useUpdateMemberRole, useRemoveMember } from '@/hooks/useTeam'
import { usePermissions } from '@/lib/permissions'

const ROLE_CONFIG: Record<string, { bg: string; text: string; icon: typeof Shield; label: string }> = {
  owner:   { bg: 'bg-rose-50',    text: 'text-rose-700',   icon: Shield,     label: 'Owner'   },
  admin:   { bg: 'bg-purple-50',  text: 'text-purple-700', icon: Shield,     label: 'Admin'   },
  manager: { bg: 'bg-blue-50',    text: 'text-blue-700',   icon: Users,      label: 'Manager' },
  agent:   { bg: 'bg-[#e8f5ee]',  text: 'text-[#1a5c3a]', icon: Headphones, label: 'Agent'   },
  OWNER:   { bg: 'bg-rose-50',    text: 'text-rose-700',   icon: Shield,     label: 'Owner'   },
  ADMIN:   { bg: 'bg-purple-50',  text: 'text-purple-700', icon: Shield,     label: 'Admin'   },
  MANAGER: { bg: 'bg-blue-50',    text: 'text-blue-700',   icon: Users,      label: 'Manager' },
  AGENT:   { bg: 'bg-[#e8f5ee]',  text: 'text-[#1a5c3a]', icon: Headphones, label: 'Agent'   },
}

const STATUS_CONFIG = {
  active:   { bg: 'bg-[#e8f5ee]', text: 'text-[#1a5c3a]', label: 'Active'         },
  pending:  { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Pending invite' },
  inactive: { bg: 'bg-gray-100',  text: 'text-gray-500',   label: 'Inactive'       },
}

interface TeamMemberCardProps {
  member: TeamMember
  isCurrentUser: boolean
}

export default function TeamMemberCard({ member, isCurrentUser }: TeamMemberCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const updateRole = useUpdateMemberRole()
  const removeMember = useRemoveMember()
  const { canChangeTeamRole, canRemoveTeamMember } = usePermissions()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) { setMenuOpen(false); setRoleMenuOpen(false) }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const role = ROLE_CONFIG[member.role]
  const status = STATUS_CONFIG[member.status]
  const RoleIcon = role.icon

  const handleChangeRole = (newRole: string) => {
    if (!window.confirm(`Change ${member.name}'s role to ${newRole}?`)) return
    updateRole.mutate({ id: member.id, role: newRole as import('@/lib/permissions').Role })
    setRoleMenuOpen(false)
  }

  const handleRemove = () => {
    if (!window.confirm(`Remove ${member.name} from the team?`)) return
    removeMember.mutate(member.id)
  }

  return (
    <div className="grid items-center gap-4 px-4 py-4 border-b border-[#f5f5f5] hover:bg-[#fafffe] transition-colors"
      style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 80px' }}>

      {/* member */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => member.status !== 'pending' && navigate(`/team/${member.id}`)}>
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a5c3a] to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
            {member.name ? getInitials(member.name) : '?'}
          </div>
          <span className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white', member.onlineStatus === 'online' ? 'bg-green-500' : 'bg-gray-300')} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900">{member.name || member.email}</p>
            {isCurrentUser && <span className="bg-[#e8f5ee] text-[#1a5c3a] text-[10px] rounded-full px-2 font-medium">You</span>}
          </div>
          <p className="text-xs text-gray-400">{member.email}</p>
          {member.status === 'pending' && member.invitedBy && (
            <p className="text-[10px] text-gray-400 mt-0.5">Invited by {member.invitedBy.name}</p>
          )}
        </div>
      </div>

      {/* role */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => canChangeTeamRole && !isCurrentUser ? setRoleMenuOpen(v => !v) : undefined}
          className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', role.bg, role.text, canChangeTeamRole && !isCurrentUser && 'cursor-pointer hover:opacity-80 transition-opacity')}
        >
          <RoleIcon size={11} /> {role.label}
        </button>
        {roleMenuOpen && canChangeTeamRole && (
          <div className="absolute left-0 top-8 z-20 bg-white border border-[#e8ebe8] rounded-xl shadow-lg py-1 w-32 text-sm">
            {(['admin', 'manager', 'agent'] as UserRole[]).map(r => (
              <button key={r} className={cn('w-full px-3 py-2 text-left hover:bg-[#f7f8f6] capitalize', member.role === r && 'text-[#1a5c3a] font-medium')} onClick={() => handleChangeRole(r)}>
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* status */}
      <div>
        <span className={cn('badge text-xs', status.bg, status.text)}>{status.label}</span>
        {member.status === 'pending' && (
          <div className="flex gap-2 mt-1">
            <button className="text-[10px] text-[#1a5c3a] hover:underline">Resend</button>
            <button className="text-[10px] text-red-500 hover:underline">Cancel</button>
          </div>
        )}
      </div>

      {/* conversations */}
      <div>
        {member.stats ? (
          <>
            <p className="text-sm font-medium text-gray-700">{member.stats.conversationsThisMonth} this month</p>
            <p className="text-xs text-gray-400">{member.stats.resolutionRate}% resolved</p>
          </>
        ) : <span className="text-gray-300 text-sm">—</span>}
      </div>

      {/* last active */}
      <div>
        {member.status === 'pending' ? (
          <p className="text-xs text-gray-400">Invited {member.invitedAt ? fromNow(member.invitedAt) : ''}</p>
        ) : (
          <p className="text-xs text-gray-500">{member.lastActiveAt ? fromNow(member.lastActiveAt) : '—'}</p>
        )}
      </div>

      {/* actions */}
      <div className="flex justify-end">
        {!isCurrentUser && (
          <div className="relative">
            <button className="btn-ghost w-8 h-8" onClick={() => setMenuOpen(v => !v)}>
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 bg-white border border-[#e8ebe8] rounded-xl shadow-lg py-1 w-44 text-sm">
                {canChangeTeamRole && (
                  <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6]" onClick={() => setRoleMenuOpen(v => !v)}>Change role</button>
                )}
                {canRemoveTeamMember && (
                  <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] text-red-500" onClick={handleRemove}>Remove member</button>
                )}
                {member.status === 'pending' && (
                  <>
                    <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6]">Resend invitation</button>
                    <button className="w-full px-3 py-2 text-left text-red-500 hover:bg-[#f7f8f6]">Cancel invitation</button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        {isCurrentUser && <span className="text-xs text-gray-300 pr-1">—</span>}
      </div>
    </div>
  )
}
