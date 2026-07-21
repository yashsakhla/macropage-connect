import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Users, Zap, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'
import { useTeamMembers } from '@/hooks/useTeam'
import TeamMemberCard from '@/components/team/TeamMemberCard'
import InviteMemberModal from '@/components/team/InviteMemberModal'
import PendingInvites from '@/components/team/PendingInvites'
import RolePermissionsTable from '@/components/team/RolePermissionsTable'
import AgentStats from '@/components/team/AgentStats'

type RoleFilter = UserRole | 'all' | 'pending'
type TabView = 'members' | 'performance' | 'permissions'

const CURRENT_USER_ID = 'tm1'

export default function Team() {
  const location = useLocation()
  const { data: teamData } = useTeamMembers()
  const members = teamData ?? []
  const [showInvite, setShowInvite] = useState(false)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [activeTab, setActiveTab] = useState<TabView>('members')

  // Opened via a deep link (e.g. global search quick actions), which pass
  // this through router state — mirrors the pattern used on the Templates page.
  const consumedDeepLinkKey = useRef<string | null>(null)
  useEffect(() => {
    const state = location.state as { openInvite?: boolean } | null
    if (!state || consumedDeepLinkKey.current === location.key) return
    consumedDeepLinkKey.current = location.key
    if (state.openInvite) setShowInvite(true)
  }, [location.key, location.state])

  const normRole = (r: string) => r.toLowerCase()
  const counts = {
    all:     members.filter(m => m.status !== 'pending').length,
    admin:   members.filter(m => normRole(m.role) === 'admin' && m.status === 'active').length,
    manager: members.filter(m => normRole(m.role) === 'manager' && m.status === 'active').length,
    agent:   members.filter(m => normRole(m.role) === 'agent' && m.status === 'active').length,
    pending: members.filter(m => m.status === 'pending').length,
  }

  const filtered = members.filter(m => {
    if (roleFilter === 'all') return m.status !== 'pending'
    if (roleFilter === 'pending') return m.status === 'pending'
    return normRole(m.role) === normRole(String(roleFilter)) && m.status !== 'pending'
  })

  const statCards = [
    { label: 'Total members', value: counts.all, icon: Users, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Active now', value: members.filter(m => m.onlineStatus === 'online').length, icon: Zap, bg: 'bg-[#e8f5ee]', color: 'text-[#1a5c3a]' },
    { label: 'Pending invites', value: counts.pending, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
  ]

  return (
    <div className="p-6 bg-[#f7f8f6] min-h-screen">
      {/* header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-subtitle mt-0.5">Manage who can access your Macropage Connect account</p>
        </div>
        <button className="btn btn-primary h-9 gap-2" onClick={() => setShowInvite(true)}>
          <Plus size={16} /> Invite member
        </button>
      </div>

      {/* stats */}
      <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5 flex items-center mb-6">
        {statCards.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center flex-1">
              <div className="flex items-center gap-4 flex-1">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg)}>
                  <Icon size={18} className={s.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              </div>
              {i < statCards.length - 1 && <div className="h-10 w-px bg-[#e8ebe8] mx-4" />}
            </div>
          )
        })}
      </div>

      {/* tab navigation */}
      <div className="flex items-center gap-1 bg-white border border-[#e8ebe8] rounded-xl p-1 w-fit mb-5">
        {([['members', 'Members'], ['performance', 'Performance'], ['permissions', 'Permissions']] as const).map(([v, l]) => (
          <button key={v} onClick={() => setActiveTab(v)}
            className={cn('px-4 h-8 rounded-lg text-sm font-medium transition-all', activeTab === v ? 'bg-[#1a5c3a] text-white' : 'text-gray-500 hover:text-gray-700')}>
            {l}
          </button>
        ))}
      </div>

      {activeTab === 'members' && (
        <>
          {/* role filter tabs */}
          <div className="flex items-center gap-1 mb-4">
            {([
              ['all',     'All members'],
              ['admin',   'Admins'],
              ['manager', 'Managers'],
              ['agent',   'Agents'],
              ['pending', 'Pending'],
            ] as const).map(([v, l]) => (
              <button key={v} onClick={() => setRoleFilter(v)}
                className={cn('flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-all',
                  roleFilter === v ? 'bg-[#1a5c3a] text-white' : 'bg-white border border-[#e8ebe8] text-gray-500 hover:border-[#c8e6d4]')}>
                {l}
                <span className={cn('text-[10px] rounded-full px-1.5', roleFilter === v ? 'bg-white/20 text-white' : 'bg-[#f7f8f6] text-gray-400')}>
                  {counts[v]}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden">
            {/* table header */}
            <div className="grid bg-[#f7f8f6] border-b border-[#e8ebe8] px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
              style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 80px' }}>
              <span>Member</span>
              <span>Role</span>
              <span>Status</span>
              <span>Conversations</span>
              <span>Last active</span>
              <span />
            </div>

            {filtered.map(member => (
              <TeamMemberCard
                key={member.id}
                member={member}
                isCurrentUser={member.id === CURRENT_USER_ID}
                              />
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No members found</p>
              </div>
            )}

            {/* pending section */}
            {roleFilter === 'all' && counts.pending > 0 && (
              <>
                <div className="bg-amber-50/30 border-y border-amber-100 px-4 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending invitations</p>
                </div>
                {members.filter(m => m.status === 'pending').map(member => (
                  <TeamMemberCard key={member.id} member={member} isCurrentUser={false} />
                ))}
              </>
            )}
          </div>
        </>
      )}

      {activeTab === 'performance' && <AgentStats members={members} />}
      {activeTab === 'permissions' && <RolePermissionsTable />}

      {/* Pending invites section */}
      <PendingInvites />

      {showInvite && <InviteMemberModal onClose={() => setShowInvite(false)} />}
    </div>
  )
}
