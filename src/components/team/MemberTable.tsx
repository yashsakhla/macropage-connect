import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, User, MoreHorizontal, Send, Link, UserMinus, Trash2, UserCheck, Key, ClipboardList, Edit } from 'lucide-react'
import { cn, getInitials, fromNow } from '@/lib/utils'
import type { TeamMember, UserRole } from '@/types'
import type { Role } from '@/lib/permissions'
import { useDeactivateMember, useRemoveMember } from '@/hooks/useTeam'
import RoleBadge from './RoleBadge'
import OnlineIndicator from './OnlineIndicator'
import EditMemberModal from './EditMemberModal'

const AVATAR_GRADIENTS: Record<string, string> = {
  'a-e': 'from-violet-500 to-purple-600',
  'f-j': 'from-blue-500 to-cyan-600',
  'k-o': 'from-[#1a5c3a] to-[#2d7a4f]',
  'p-t': 'from-orange-500 to-amber-600',
  'u-z': 'from-rose-500 to-pink-600',
}

function avatarGradient(name: string) {
  const c = name.toLowerCase().charCodeAt(0) - 97
  if (c < 5)  return AVATAR_GRADIENTS['a-e']
  if (c < 10) return AVATAR_GRADIENTS['f-j']
  if (c < 15) return AVATAR_GRADIENTS['k-o']
  if (c < 20) return AVATAR_GRADIENTS['p-t']
  return AVATAR_GRADIENTS['u-z']
}

function WorkloadBar({ open, max = 20 }: { open: number; max?: number }) {
  const pct = Math.min((open / max) * 100, 100)
  const color = open <= 5 ? 'bg-green-500' : open <= 15 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn('h-1.5 rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-700">{open} open</span>
    </div>
  )
}

function RowMenu({ member, currentUserId, onEdit }: { member: TeamMember; currentUserId: string; onEdit: (m: TeamMember) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const deactivate = useDeactivateMember()
  const remove = useRemoveMember()

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const isOwn = member.id === currentUserId

  return (
    <div className="relative" ref={ref}>
      <button className="w-8 h-8 rounded-lg hover:bg-[#f7f8f6] flex items-center justify-center text-gray-400" onClick={() => setOpen(v => !v)}>
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 bg-white border border-[#e8ebe8] shadow-lg rounded-xl p-1.5 w-52">
          {member.status === 'active' && (
            <>
              <MenuItem icon={User}          label="View profile"   onClick={() => navigate(`/team/${member.id}`)} />
              <MenuItem icon={Edit}          label="Edit details"   onClick={() => onEdit(member)} />
              <MenuItem icon={ClipboardList} label="View activity"  onClick={() => navigate(`/team/${member.id}?tab=activity`)} />
              <div className="my-1 h-px bg-[#f5f5f5]" />
              <MenuItem icon={Key}      label="Reset password"  onClick={() => {}} />
              <MenuItem icon={UserMinus} label="Deactivate"     danger="amber"
                disabled={isOwn} disabledTip="You cannot deactivate yourself"
                onClick={() => { if (!isOwn && window.confirm(`Deactivate ${member.name}?`)) deactivate.mutate(member.id); setOpen(false) }} />
              <div className="my-1 h-px bg-[#f5f5f5]" />
              <MenuItem icon={Trash2}    label="Remove member"  danger="red"
                disabled={isOwn} disabledTip="You cannot remove yourself"
                onClick={() => { onEdit(member); setOpen(false) }} />
            </>
          )}
          {member.status === 'pending' && (
            <>
              <MenuItem icon={Send} label="Resend invitation" onClick={() => {}} />
              <MenuItem icon={Link} label="Copy invite link"  onClick={() => {}} />
              <div className="my-1 h-px bg-[#f5f5f5]" />
              <MenuItem icon={Trash2} label="Cancel invitation" danger="red" onClick={() => {}} />
            </>
          )}
          {member.status === 'inactive' && (
            <>
              <MenuItem icon={UserCheck}     label="Reactivate account" danger="green" onClick={() => {}} />
              <MenuItem icon={ClipboardList} label="View history"       onClick={() => navigate(`/team/${member.id}`)} />
              <div className="my-1 h-px bg-[#f5f5f5]" />
              <MenuItem icon={Trash2} label="Delete permanently" danger="red" onClick={() => { if (window.confirm('Delete permanently?')) remove.mutate(member.id) }} />
            </>
          )}
        </div>
      )}
    </div>
  )
}

function MenuItem({ icon: Icon, label, onClick, danger, disabled, disabledTip }: {
  icon: React.ElementType; label: string; onClick: () => void
  danger?: 'red' | 'amber' | 'green'; disabled?: boolean; disabledTip?: string
}) {
  const colorClass = danger === 'red' ? 'hover:bg-red-50 hover:text-red-600'
    : danger === 'amber' ? 'hover:bg-amber-50 hover:text-amber-600'
    : danger === 'green' ? 'hover:bg-[#e8f5ee] hover:text-[#1a5c3a]'
    : 'hover:bg-[#f7f8f6]'
  return (
    <button
      disabled={disabled}
      title={disabledTip}
      onClick={e => { e.stopPropagation(); onClick() }}
      className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-700 transition-colors text-left', colorClass, disabled && 'opacity-40 cursor-not-allowed')}
    >
      <Icon size={14} />{label}
    </button>
  )
}

type RoleFilter = UserRole | 'all' | 'pending'

interface MemberTableProps {
  members: TeamMember[]
  currentUserId: string
  isAdmin: boolean
  onUpdateRole: (id: string, role: Role) => void
}

export default function MemberTable({ members, currentUserId, isAdmin, onUpdateRole }: MemberTableProps) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [search, setSearch] = useState('')
  const [editMember, setEditMember] = useState<TeamMember | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const navigate = useNavigate()

  const counts: Record<string, number> = {
    all:     members.filter(m => m.status !== 'pending').length,
    owner:   members.filter(m => m.role === 'owner'   && m.status !== 'pending').length,
    admin:   members.filter(m => m.role === 'admin'   && m.status !== 'pending').length,
    manager: members.filter(m => m.role === 'manager' && m.status !== 'pending').length,
    agent:   members.filter(m => m.role === 'agent'   && m.status !== 'pending').length,
    pending: members.filter(m => m.status === 'pending').length,
  }

  const filtered = members.filter(m => {
    if (roleFilter === 'pending') return m.status === 'pending'
    if (roleFilter === 'all') return m.status !== 'pending'
    return m.role === roleFilter && m.status !== 'pending'
  }).filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()))

  const allIds = filtered.map(m => m.id)
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id))

  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(allIds))
  const toggle = (id: string) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const ROLE_TABS: { value: RoleFilter; label: string }[] = [
    { value: 'all',     label: 'All'     },
    { value: 'owner',   label: 'Owner'   },
    { value: 'admin',   label: 'Admin'   },
    { value: 'manager', label: 'Manager' },
    { value: 'agent',   label: 'Agent'   },
    { value: 'pending', label: 'Pending' },
  ]

  return (
    <>
      {/* toolbar */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f5f5f5]">
        <div className="flex items-center gap-1">
          {ROLE_TABS.map(tab => (
            <button key={tab.value} onClick={() => setRoleFilter(tab.value)}
              className={cn('flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-medium transition-all',
                roleFilter === tab.value ? 'bg-[#1a5c3a] text-white' : 'text-gray-500 hover:text-gray-700')}>
              {tab.label}
              <span className={cn('text-[10px] rounded-full px-1.5', roleFilter === tab.value ? 'bg-white/20 text-white' : 'bg-[#f7f8f6] text-gray-400')}>
                {counts[tab.value] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="bg-[#f7f8f6] border-0 rounded-xl h-9 w-52 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20"
              placeholder="Search members..." />
          </div>
          <select className="bg-white border border-[#e8ebe8] rounded-xl h-9 px-3 text-sm text-gray-600 focus:outline-none flex items-center gap-1">
            <option>Name A-Z</option>
            <option>Name Z-A</option>
            <option>Role</option>
            <option>Date joined</option>
            <option>Last active</option>
          </select>
        </div>
      </div>

      {/* bulk bar */}
      {selected.size > 0 && (
        <div className="mx-5 mb-3 flex items-center gap-3 px-4 py-3 bg-[#1a3d2b] text-white rounded-xl">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-2 ml-2">
            <select className="bg-white/10 text-white text-xs h-8 rounded-lg px-2 border-0 focus:outline-none">
              <option value="">Change role...</option>
              <option>Admin</option><option>Manager</option><option>Agent</option>
            </select>
            <button className="bg-white/10 hover:bg-white/20 text-white text-xs h-8 px-3 rounded-lg transition-colors">Export</button>
            <button className="bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 text-xs h-8 px-3 rounded-lg transition-colors">Deactivate</button>
            <button className="bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs h-8 px-3 rounded-lg transition-colors">Remove</button>
          </div>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-white/60 hover:text-white text-xs">Deselect all ×</button>
        </div>
      )}

      {/* table */}
      <div>
        <div className="grid bg-[#f7f8f6] border-b border-[#e8ebe8] px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
          style={{ gridTemplateColumns: '40px 2fr 1fr 1fr 1fr 1fr 80px' }}>
          <span><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-[#1a5c3a] cursor-pointer" /></span>
          <span>Member</span>
          <span>Role</span>
          <span>Status</span>
          <span>Workload</span>
          <span>Last active</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No members match your search</p>
            {search && <button className="text-[#1a5c3a] text-sm mt-2 hover:underline" onClick={() => setSearch('')}>Clear search</button>}
          </div>
        ) : filtered.map(member => {
          const isOwn = member.id === currentUserId
          const grad = avatarGradient(member.name || member.email)
          return (
            <div key={member.id}
              className={cn('grid items-center px-5 py-4 border-b border-[#f5f5f5] hover:bg-[#fafffe] transition-colors', isOwn && 'bg-[#e8f5ee]/20')}
              style={{ gridTemplateColumns: '40px 2fr 1fr 1fr 1fr 1fr 80px' }}>
              <span><input type="checkbox" checked={selected.has(member.id)} onChange={() => toggle(member.id)} className="accent-[#1a5c3a] cursor-pointer" /></span>

              {/* member */}
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-sm font-semibold', grad)}>
                    {getInitials(member.name || member.email)}
                  </div>
                  <OnlineIndicator status={member.onlineStatus} lastActiveAt={member.lastActiveAt} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{member.name || member.email}</span>
                    {isOwn && <span className="bg-[#e8f5ee] text-[#1a5c3a] text-[10px] font-semibold rounded-full px-2 py-0.5">You</span>}
                  </div>
                  <p className="text-xs text-gray-400">{member.name ? member.email : ''}</p>
                  {member.department && <span className="bg-[#f7f8f6] text-gray-500 text-[10px] rounded-full px-2 py-0.5 mt-0.5 inline-block">{member.department}</span>}
                </div>
              </div>

              {/* role */}
              <RoleBadge
                role={member.role}
                onChangeRole={isAdmin && !isOwn && member.role !== 'owner' ? r => onUpdateRole(member.id, r) : undefined}
                disabled={isOwn || member.role === 'owner'}
                disabledReason={isOwn ? 'You cannot change your own role' : 'Owner role cannot be changed'}
              />

              {/* status */}
              <div>
                {member.status === 'active' && (
                  <span className="badge bg-[#e8f5ee] text-[#1a5c3a] text-xs">Active</span>
                )}
                {member.status === 'pending' && (
                  <div>
                    <span className="badge bg-amber-50 text-amber-700 text-xs">Pending invite</span>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Sent {member.invitedAt ? fromNow(member.invitedAt) : ''} · Expires in 5d
                    </p>
                    <div className="flex gap-2 mt-1">
                      <button className="text-[10px] text-[#1a5c3a] underline">Resend</button>
                      <span className="text-gray-300">·</span>
                      <button className="text-[10px] text-red-500 underline">Cancel</button>
                    </div>
                  </div>
                )}
                {member.status === 'inactive' && (
                  <div>
                    <span className="badge bg-gray-100 text-gray-500 text-xs">Inactive</span>
                  </div>
                )}
              </div>

              {/* workload */}
              {member.status !== 'pending' ? (
                <WorkloadBar open={member.openConversations} />
              ) : <span className="text-gray-300">—</span>}

              {/* last active */}
              <div>
                {member.onlineStatus === 'online' ? (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-[#1a5c3a]">Online now</span>
                  </div>
                ) : member.status === 'pending' ? (
                  <div>
                    <p className="text-xs text-gray-500">Invited {member.invitedAt ? fromNow(member.invitedAt) : ''}</p>
                    {member.invitedBy && <p className="text-[10px] text-gray-400">by {member.invitedBy.name}</p>}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">{member.lastActiveAt ? fromNow(member.lastActiveAt) : '—'}</p>
                )}
              </div>

              {/* actions */}
              <div className="flex items-center justify-end gap-1">
                {member.status !== 'pending' && (
                  <button className="w-8 h-8 rounded-lg hover:bg-[#f7f8f6] flex items-center justify-center text-gray-500"
                    onClick={() => navigate(`/team/${member.id}`)}>
                    <User size={14} />
                  </button>
                )}
                <RowMenu member={member} currentUserId={currentUserId} onEdit={setEditMember} />
              </div>
            </div>
          )
        })}
      </div>

      {editMember && <EditMemberModal member={editMember} onClose={() => setEditMember(null)} />}
    </>
  )
}
