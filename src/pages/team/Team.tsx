import { useState, useRef, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Users, Search, SlidersHorizontal } from 'lucide-react'
import { differenceInCalendarDays } from 'date-fns'
import { cn } from '@/lib/utils'
import type { UserRole, PendingInvite } from '@/types'
import { useTeamMembers, usePendingInvites } from '@/hooks/useTeam'
import TeamMemberCard from '@/components/team/TeamMemberCard'
import InviteMemberModal from '@/components/team/InviteMemberModal'
import PendingInvites from '@/components/team/PendingInvites'
import RolePermissionsTable from '@/components/team/RolePermissionsTable'
import AgentStats from '@/components/team/AgentStats'
import TeamStats from '@/components/team/TeamStats'
import TeamActivityPanel from '@/components/team/TeamActivityPanel'
import teamHero from '@/assets/teams/5.svg'

type RoleFilter = UserRole | 'all' | 'pending'
type TabView = 'members' | 'performance' | 'permissions'

const CURRENT_USER_ID = 'tm1'

export default function Team() {
  const location = useLocation()
  const { data: teamData } = useTeamMembers()
  const members = teamData ?? []
  const { data: pendingInvitesData } = usePendingInvites()
  const pendingInvites = (pendingInvitesData as PendingInvite[]) ?? []
  const [showInvite, setShowInvite] = useState(false)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [activeTab, setActiveTab] = useState<TabView>('members')
  const [search, setSearch] = useState('')

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

  const newThisWeek = members.filter(m => m.joinedAt && differenceInCalendarDays(new Date(), new Date(m.joinedAt)) <= 7).length
  const activeNowCount = members.filter(m => m.onlineStatus === 'online').length
  const activePercent = counts.all > 0 ? Math.round((activeNowCount / counts.all) * 100) : 0

  const filtered = members.filter(m => {
    if (roleFilter === 'all') return m.status !== 'pending'
    if (roleFilter === 'pending') return m.status === 'pending'
    return normRole(m.role) === normRole(String(roleFilter)) && m.status !== 'pending'
  })

  const searched = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return filtered
    return filtered.filter(m => m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q))
  }, [filtered, search])

  return (
    <div className="p-3 sm:p-6 bg-[#f7f8f6] dark:bg-[#0f1724] min-h-screen">
      {/* header banner */}
      <div className="relative rounded-3xl overflow-hidden mb-4 sm:mb-6">
        <img src={teamHero} alt="" className="hidden sm:block w-full aspect-[2200/500] object-cover object-center" />
        <div className="hidden sm:block absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-[#d7f5e3] via-[#d7f5e3]/70 to-transparent pointer-events-none" />
        <div
          className="flex flex-col items-start gap-3 sm:gap-4 px-4 sm:px-10 py-5 sm:py-8 sm:absolute sm:inset-0 sm:justify-center bg-gradient-to-br from-[#d7f5e3] to-[#bdeccf] sm:bg-none"
        >
          <div>
            <h1 className="page-title">Team</h1>
            <p className="page-subtitle mt-0.5 text-gray-600 dark:text-gray-300">Manage who can access your Macropage Connect account</p>
          </div>
          <button className="btn btn-primary h-10 sm:h-11 px-5 sm:px-6 gap-2 rounded-full flex-shrink-0 w-full sm:w-auto justify-center shadow-sm hover:shadow-md transition-shadow" onClick={() => setShowInvite(true)}>
            <Plus size={16} /> Invite member
          </button>
        </div>
      </div>

      {/* stats */}
      <TeamStats
        totalMembers={counts.all}
        newThisWeek={newThisWeek}
        activeNow={activeNowCount}
        activePercent={activePercent}
        pendingInvites={counts.pending}
      />

      {/* tab navigation */}
      <div className="flex items-center gap-1 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl p-1 w-full sm:w-fit mb-4 sm:mb-5 overflow-x-auto no-scrollbar">
        {([['members', 'Members'], ['performance', 'Performance'], ['permissions', 'Permissions']] as const).map(([v, l]) => (
          <button key={v} onClick={() => setActiveTab(v)}
            className={cn('px-3 sm:px-4 h-8 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 flex-1 sm:flex-none', activeTab === v ? 'bg-[#1a5c3a] text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200')}>
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
        <div className="min-w-0">
          {activeTab === 'members' && (
            <>
              {/* role filter tabs + search */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-1 flex-wrap">
                  {([
                    ['all',     'All members'],
                    ['admin',   'Admins'],
                    ['manager', 'Managers'],
                    ['agent',   'Agents'],
                    ['pending', 'Pending'],
                  ] as const).map(([v, l]) => (
                    <button key={v} onClick={() => setRoleFilter(v)}
                      className={cn('flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-all',
                        roleFilter === v ? 'bg-[#1a5c3a] text-white' : 'bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-[#c8e6d4]')}>
                      {l}
                      <span className={cn('text-[10px] rounded-full px-1.5', roleFilter === v ? 'bg-white/20 text-white' : 'bg-[#f7f8f6] dark:bg-[#0f1724] text-gray-400 dark:text-gray-500')}>
                        {counts[v]}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="relative flex-1 sm:flex-none min-w-0">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search members..."
                      className="input h-9 pl-9 w-full sm:w-56 text-sm"
                    />
                  </div>
                  <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:border-[#c8e6d4] transition-colors flex-shrink-0">
                    <SlidersHorizontal size={14} />
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden">
                {/* table header — desktop only, mobile uses stacked cards (see TeamMemberCard) */}
                <div className="hidden sm:grid bg-[#f7f8f6] dark:bg-[#0f1724] border-b border-[#e8ebe8] dark:border-white/10 px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 80px' }}>
                  <span>Member</span>
                  <span>Role</span>
                  <span>Status</span>
                  <span>Conversations</span>
                  <span>Last active</span>
                  <span />
                </div>

                {searched.map(member => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    isCurrentUser={member.id === CURRENT_USER_ID}
                  />
                ))}

                {searched.length === 0 && (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <Users size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No members found</p>
                  </div>
                )}

                {/* pending section */}
                {roleFilter === 'all' && counts.pending > 0 && (
                  <>
                    <div className="bg-amber-50/30 border-y border-amber-100 px-4 py-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending invitations</p>
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
          {activeTab === 'members' && <PendingInvites />}
        </div>

        <TeamActivityPanel newMembers={newThisWeek} activeSessions={activeNowCount} pendingInvites={counts.pending} />
      </div>

      {showInvite && (
        <InviteMemberModal
          onClose={() => setShowInvite(false)}
          existingMemberEmails={members.filter(m => m.status !== 'pending').map(m => m.email).filter(Boolean) as string[]}
          pendingInviteEmails={[
            ...members.filter(m => m.status === 'pending').map(m => m.email),
            ...pendingInvites.map(i => i.email),
          ].filter(Boolean) as string[]}
        />
      )}
    </div>
  )
}
