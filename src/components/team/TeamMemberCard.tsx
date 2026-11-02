import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { MoreVertical, Shield, Users, Headphones, Check } from 'lucide-react'
import { cn, getInitials, fromNow } from '@/lib/utils'
import type { TeamMember, UserRole } from '@/types'
import { useUpdateMemberRole, useRemoveMember } from '@/hooks/useTeam'
import { usePermissions } from '@/lib/permissionsConstants'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const ROLE_CONFIG: Record<string, { bg: string; text: string; icon: typeof Shield; label: string }> = {
  owner:   { bg: 'bg-rose-50',    text: 'text-rose-700',   icon: Shield,     label: 'Owner'   },
  admin:   { bg: 'bg-purple-50 dark:bg-purple-950/30',  text: 'text-purple-700 dark:text-purple-400', icon: Shield,     label: 'Admin'   },
  manager: { bg: 'bg-blue-50 dark:bg-blue-950/30',    text: 'text-blue-700 dark:text-blue-400',   icon: Users,      label: 'Manager' },
  agent:   { bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30',  text: 'text-[#1a5c3a]', icon: Headphones, label: 'Agent'   },
  OWNER:   { bg: 'bg-rose-50',    text: 'text-rose-700',   icon: Shield,     label: 'Owner'   },
  ADMIN:   { bg: 'bg-purple-50 dark:bg-purple-950/30',  text: 'text-purple-700 dark:text-purple-400', icon: Shield,     label: 'Admin'   },
  MANAGER: { bg: 'bg-blue-50 dark:bg-blue-950/30',    text: 'text-blue-700 dark:text-blue-400',   icon: Users,      label: 'Manager' },
  AGENT:   { bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30',  text: 'text-[#1a5c3a]', icon: Headphones, label: 'Agent'   },
}

const STATUS_CONFIG = {
  active:   { bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30', text: 'text-[#1a5c3a]', label: 'Active'         },
  pending:  { bg: 'bg-amber-50 dark:bg-amber-950/30',  text: 'text-amber-700 dark:text-amber-400',  label: 'Pending invite' },
  inactive: { bg: 'bg-gray-100 dark:bg-white/10',  text: 'text-gray-500 dark:text-gray-400',   label: 'Inactive'       },
}

interface TeamMemberCardProps {
  member: TeamMember
  isCurrentUser: boolean
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Full access to team, billing & settings',
  manager: 'Manages conversations, campaigns & agents',
  agent: 'Handles conversations assigned to them',
}

// Renders in a portal with fixed positioning so the table's overflow-hidden can't clip it.
// Flips above the anchor when there is no room below (e.g. last row).
function FloatingMenu({ anchorRef, onClose, align = 'right', className, children }: {
  anchorRef: React.RefObject<HTMLElement>
  onClose: () => void
  align?: 'left' | 'right'
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({ position: 'fixed', visibility: 'hidden' })

  useLayoutEffect(() => {
    const a = anchorRef.current?.getBoundingClientRect()
    const m = ref.current
    // anchor is display:none (the other breakpoint's copy) — keep hidden
    if (!a || !m || (a.width === 0 && a.height === 0)) return
    const { offsetHeight: h, offsetWidth: w } = m
    const top = window.innerHeight - a.bottom < h + 8 && a.top > h + 8 ? a.top - h - 4 : a.bottom + 4
    const left = align === 'right' ? a.right - w : a.left
    setStyle({ position: 'fixed', top, left: Math.max(8, Math.min(left, window.innerWidth - w - 8)) })
  }, [anchorRef, align])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (ref.current?.contains(t) || anchorRef.current?.contains(t)) return
      onClose()
    }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('scroll', onClose, true)
    window.addEventListener('resize', onClose)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', onClose, true)
      window.removeEventListener('resize', onClose)
    }
  }, [anchorRef, onClose])

  return createPortal(<div ref={ref} style={style} className={className}>{children}</div>, document.body)
}

export default function TeamMemberCard({ member, isCurrentUser }: TeamMemberCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const [pendingRole, setPendingRole] = useState<string | null>(null)
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false)
  const mobileActionsRef = useRef<HTMLButtonElement>(null)
  const mobileRoleRef = useRef<HTMLButtonElement>(null)
  const desktopActionsRef = useRef<HTMLButtonElement>(null)
  const desktopRoleRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()
  const updateRole = useUpdateMemberRole()
  const removeMember = useRemoveMember()
  const { canChangeTeamRole, canRemoveTeamMember } = usePermissions()

  const closeMenus = () => { setMenuOpen(false); setRoleMenuOpen(false) }
  const closeActions = () => setMenuOpen(false)
  const closeRole = () => setRoleMenuOpen(false)

  const role = ROLE_CONFIG[member.role]
  const status = STATUS_CONFIG[member.status]
  const RoleIcon = role.icon

  const handleChangeRole = (newRole: string) => {
    setPendingRole(newRole)
    setRoleMenuOpen(false)
  }

  const confirmChangeRole = () => {
    if (!pendingRole) return
    updateRole.mutate({ id: member.id, role: pendingRole as import('@/lib/permissionsConstants').Role })
    setPendingRole(null)
  }

  const handleRemove = () => {
    closeMenus()
    setRemoveConfirmOpen(true)
  }

  const confirmRemove = () => {
    removeMember.mutate(member.id)
    setRemoveConfirmOpen(false)
  }

  return (
    <>
      {/* mobile card layout */}
      <div className="sm:hidden px-4 py-4 border-b border-[#f5f5f5] hover:bg-[#fafffe] dark:hover:bg-white/5 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => member.status !== 'pending' && navigate(`/team/${member.id}`)}>
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a5c3a] to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                {member.name ? getInitials(member.name) : '?'}
              </div>
              <span className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white', member.onlineStatus === 'online' ? 'bg-green-500' : 'bg-gray-300')} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name || member.email}</p>
                {isCurrentUser && <span className="bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] text-[10px] rounded-full px-2 font-medium shrink-0">You</span>}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{member.email}</p>
              {member.status === 'pending' && member.invitedBy && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">Invited by {member.invitedBy.name}</p>
              )}
            </div>
          </div>

          {!isCurrentUser ? (
            <div className="relative shrink-0">
              <button ref={mobileActionsRef} className="btn-ghost w-8 h-8 !px-0" onClick={() => setMenuOpen(v => !v)}>
                <MoreVertical size={14} />
              </button>
              {menuOpen && (
                <FloatingMenu anchorRef={mobileActionsRef} onClose={closeActions} className="z-50 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl shadow-lg py-1 w-44 text-sm">
                  {canChangeTeamRole && (
                    <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5" onClick={() => { closeActions(); setRoleMenuOpen(true) }}>Change role</button>
                  )}
                  {canRemoveTeamMember && (
                    <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5 text-red-500 dark:text-red-400" onClick={handleRemove}>Remove member</button>
                  )}
                  {member.status === 'pending' && (
                    <>
                      <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5">Resend invitation</button>
                      <button className="w-full px-3 py-2 text-left text-red-500 dark:text-red-400 hover:bg-[#f7f8f6] dark:hover:bg-white/5">Cancel invitation</button>
                    </>
                  )}
                </FloatingMenu>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-300 dark:text-gray-600 shrink-0">—</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-2.5">
          <div className="relative">
            <button
              ref={mobileRoleRef}
              onClick={() => canChangeTeamRole && !isCurrentUser ? setRoleMenuOpen(v => !v) : undefined}
              className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', role.bg, role.text, canChangeTeamRole && !isCurrentUser && 'cursor-pointer hover:opacity-80 transition-opacity')}
            >
              <RoleIcon size={11} /> {role.label}
            </button>
            {roleMenuOpen && canChangeTeamRole && (
              <FloatingMenu anchorRef={mobileRoleRef} align="left" onClose={closeRole} className="z-50 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl shadow-[0_20px_40px_-8px_rgba(0,0,0,0.2),0_8px_16px_-6px_rgba(0,0,0,0.1)] py-2 w-60 text-sm overflow-hidden">
                <p className="px-3 pb-1.5 text-2xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Change role to</p>
                {(['admin', 'manager', 'agent'] as UserRole[]).map(r => {
                  const opt = ROLE_CONFIG[r]
                  const OptIcon = opt.icon
                  const active = member.role === r
                  return (
                    <button key={r} className={cn('w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5 transition-colors', active && 'bg-[#f0faf5] dark:bg-emerald-950/20')} onClick={() => handleChangeRole(r)}>
                      <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', opt.bg, opt.text)}>
                        <OptIcon size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block capitalize font-medium', active ? 'text-[#1a5c3a] dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200')}>{r}</span>
                        <span className="block text-2xs text-gray-400 dark:text-gray-500 truncate">{ROLE_DESCRIPTIONS[r]}</span>
                      </span>
                      {active && <Check size={14} className="text-[#1a5c3a] dark:text-emerald-400 shrink-0" />}
                    </button>
                  )
                })}
              </FloatingMenu>
            )}
          </div>
          <span className={cn('badge text-xs', status.bg, status.text)}>{status.label}</span>
          {member.status === 'pending' && (
            <div className="flex gap-2">
              <button className="text-[10px] text-[#1a5c3a] hover:underline">Resend</button>
              <button className="text-[10px] text-red-500 dark:text-red-400 hover:underline">Cancel</button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#f5f5f5] dark:border-white/10">
          <div className="min-w-0">
            {member.stats ? (
              <>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{member.stats.conversationsThisMonth} conversations this month</p>
                <p className="text-2xs text-gray-400 dark:text-gray-500">{member.stats.resolutionRate}% resolved</p>
              </>
            ) : <span className="text-gray-300 dark:text-gray-600 text-xs">No stats yet</span>}
          </div>
          <div className="text-right shrink-0 ml-2">
            {member.status === 'pending' ? (
              <p className="text-2xs text-gray-400 dark:text-gray-500">Invited {member.invitedAt ? fromNow(member.invitedAt) : ''}</p>
            ) : (
              <p className="text-2xs text-gray-500 dark:text-gray-400">{member.lastActiveAt ? fromNow(member.lastActiveAt) : '—'}</p>
            )}
          </div>
        </div>
      </div>

      {/* desktop table row */}
      <div className="hidden sm:grid items-center gap-4 px-4 py-4 border-b border-[#f5f5f5] hover:bg-[#fafffe] dark:hover:bg-white/5 transition-colors"
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
            <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name || member.email}</p>
            {isCurrentUser && <span className="bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] text-[10px] rounded-full px-2 font-medium">You</span>}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">{member.email}</p>
          {member.status === 'pending' && member.invitedBy && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Invited by {member.invitedBy.name}</p>
          )}
        </div>
      </div>

      {/* role */}
      <div className="relative">
        <button
          ref={desktopRoleRef}
          onClick={() => canChangeTeamRole && !isCurrentUser ? setRoleMenuOpen(v => !v) : undefined}
          className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', role.bg, role.text, canChangeTeamRole && !isCurrentUser && 'cursor-pointer hover:opacity-80 transition-opacity')}
        >
          <RoleIcon size={11} /> {role.label}
        </button>
        {roleMenuOpen && canChangeTeamRole && (
          <FloatingMenu anchorRef={desktopRoleRef} align="left" onClose={closeRole} className="z-50 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl shadow-lg py-1 w-32 text-sm">
            {(['admin', 'manager', 'agent'] as UserRole[]).map(r => (
              <button key={r} className={cn('w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5 capitalize', member.role === r && 'text-[#1a5c3a] font-medium')} onClick={() => handleChangeRole(r)}>
                {r}
              </button>
            ))}
          </FloatingMenu>
        )}
      </div>

      {/* status */}
      <div>
        <span className={cn('badge text-xs', status.bg, status.text)}>{status.label}</span>
        {member.status === 'pending' && (
          <div className="flex gap-2 mt-1">
            <button className="text-[10px] text-[#1a5c3a] hover:underline">Resend</button>
            <button className="text-[10px] text-red-500 dark:text-red-400 hover:underline">Cancel</button>
          </div>
        )}
      </div>

      {/* conversations */}
      <div>
        {member.stats ? (
          <>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{member.stats.conversationsThisMonth} this month</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{member.stats.resolutionRate}% resolved</p>
          </>
        ) : <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>}
      </div>

      {/* last active */}
      <div>
        {member.status === 'pending' ? (
          <p className="text-xs text-gray-400 dark:text-gray-500">Invited {member.invitedAt ? fromNow(member.invitedAt) : ''}</p>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">{member.lastActiveAt ? fromNow(member.lastActiveAt) : '—'}</p>
        )}
      </div>

      {/* actions */}
      <div className="flex justify-end">
        {!isCurrentUser && (
          <div className="relative">
            <button ref={desktopActionsRef} className="btn-ghost w-8 h-8 p-0" onClick={() => setMenuOpen(v => !v)}>
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <FloatingMenu anchorRef={desktopActionsRef} onClose={closeActions} className="z-50 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl shadow-lg py-1 w-44 text-sm">
                {canChangeTeamRole && (
                  <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5" onClick={() => { closeActions(); setRoleMenuOpen(true) }}>Change role</button>
                )}
                {canRemoveTeamMember && (
                  <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5 text-red-500 dark:text-red-400" onClick={handleRemove}>Remove member</button>
                )}
                {member.status === 'pending' && (
                  <>
                    <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5">Resend invitation</button>
                    <button className="w-full px-3 py-2 text-left text-red-500 dark:text-red-400 hover:bg-[#f7f8f6] dark:hover:bg-white/5">Cancel invitation</button>
                  </>
                )}
              </FloatingMenu>
            )}
          </div>
        )}
        {isCurrentUser && <span className="text-xs text-gray-300 dark:text-gray-600 pr-1">—</span>}
      </div>
      </div>

      {pendingRole && (
        <ConfirmDialog
          title="Change role"
          message={`Change ${member.name || member.email}'s role to ${pendingRole}?`}
          confirmLabel="Change role"
          danger={false}
          onConfirm={confirmChangeRole}
          onCancel={() => setPendingRole(null)}
        />
      )}
      {removeConfirmOpen && (
        <ConfirmDialog
          title="Remove member"
          message={`Remove ${member.name || member.email} from the team? They will lose access immediately.`}
          confirmLabel="Remove member"
          danger
          onConfirm={confirmRemove}
          onCancel={() => setRemoveConfirmOpen(false)}
        />
      )}
    </>
  )
}
