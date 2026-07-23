import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, MoreVertical, Mail, CheckCircle, XCircle } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { cn, getInitials, fromNow } from '@/lib/utils'
import { useTeamMember } from '@/hooks/useTeam'
import { ROLE_PERMISSIONS, type Role } from '@/lib/permissions'
import { useTeamActivity } from '@/hooks/useTeamActivity'
import RoleBadge from '@/components/team/RoleBadge'
import OnlineIndicator from '@/components/team/OnlineIndicator'
import EditMemberModal from '@/components/team/EditMemberModal'
import { format } from 'date-fns'

const AVATAR_GRADIENTS: Record<string, string> = {
  'a-e': 'from-violet-500 to-purple-600',
  'f-j': 'from-blue-500 to-cyan-600',
  'k-o': 'from-[#1a5c3a] to-[#2d7a4f]',
  'p-t': 'from-orange-500 to-amber-600',
  'u-z': 'from-rose-500 to-pink-600',
}
function avatarGradient(name: string) {
  const c = name.toLowerCase().charCodeAt(0) - 97
  if (c < 5) return AVATAR_GRADIENTS['a-e']
  if (c < 10) return AVATAR_GRADIENTS['f-j']
  if (c < 15) return AVATAR_GRADIENTS['k-o']
  if (c < 20) return AVATAR_GRADIENTS['p-t']
  return AVATAR_GRADIENTS['u-z']
}

const TYPE_CHIP: Record<string, { bg: string; text: string }> = {
  conversation: { bg: 'bg-blue-50 dark:bg-blue-950/30',   text: 'text-blue-600 dark:text-blue-400'   },
  campaign:     { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400' },
  contact:      { bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30', text: 'text-[#1a5c3a]' },
  template:     { bg: 'bg-amber-50 dark:bg-amber-950/30',  text: 'text-amber-600 dark:text-amber-400'  },
  team:         { bg: 'bg-rose-50',   text: 'text-rose-600'   },
  settings:     { bg: 'bg-gray-100 dark:bg-white/10',  text: 'text-gray-500 dark:text-gray-400'   },
}

export default function MemberProfile() {
  const { memberId = '' } = useParams<{ memberId: string }>()
  const navigate = useNavigate()
  const { data: member, isLoading } = useTeamMember(memberId)
  const [showEdit, setShowEdit] = useState(false)
  const [showAllPerms, setShowAllPerms] = useState(false)

  if (isLoading || !member) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-32 animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-white/10 rounded-2xl animate-pulse" />
      </div>
    )
  }

  const grad = avatarGradient(member.name || member.email)
  const role = member.role as Role
  const perms = ROLE_PERMISSIONS[role]
  const { data: activityData } = useTeamActivity({ memberId: member.id })
  const memberActivity = ((activityData as any)?.data ?? []).slice(0, 10)

  const KEY_PERMS = [
    'view_all_conversations', 'assign_conversations', 'create_campaigns',
    'launch_campaigns', 'edit_member_roles', 'manage_billing', 'manage_api_keys',
  ]

  return (
    <div className="p-6 bg-[#f7f8f6] dark:bg-[#0f1724] min-h-screen">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <button className="btn-ghost h-8 px-3 text-sm flex items-center gap-1" onClick={() => navigate('/team')}>
          <ArrowLeft size={15} /> Team
        </button>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline h-9 gap-2" onClick={() => setShowEdit(true)}>
            <Edit2 size={14} /> Edit member
          </button>
          <button className="btn-ghost w-9 h-9"><MoreVertical size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="col-span-1 space-y-4">
          {/* profile card */}
          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-6 text-center">
            <div className="flex justify-center">
              <div className={cn('w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white text-2xl font-semibold', grad)}>
                {getInitials(member.name || member.email)}
              </div>
            </div>
            <div className="flex items-center justify-center mt-2">
              <OnlineIndicator status={member.onlineStatus} lastActiveAt={member.lastActiveAt} showLabel />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-3">{member.name || member.email}</p>
            <div className="flex justify-center mt-2">
              <RoleBadge role={member.role} size="md" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{member.email}</p>
            {member.joinedAt && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Member since {format(new Date(member.joinedAt), 'MMMM dd, yyyy')}</p>}
            {member.department && (
              <span className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-full px-3 py-1 text-xs text-gray-600 dark:text-gray-400 inline-block mt-2">{member.department}</span>
            )}
            <div className="flex gap-2 mt-5">
              <a href={`mailto:${member.email}`} className="btn btn-primary flex-1 h-9 text-sm gap-1.5 flex items-center justify-center">
                <Mail size={14} /> Email
              </a>
              <button className="btn btn-outline flex-1 h-9 text-sm gap-1.5" onClick={() => setShowEdit(true)}>
                <Edit2 size={14} /> Edit
              </button>
            </div>
          </div>

          {/* permissions card */}
          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Access & Permissions</p>
            <div className="flex justify-center mb-3">
              <RoleBadge role={member.role} size="lg" />
            </div>
            <div className={cn('grid grid-cols-2 gap-x-4 gap-y-1.5', !showAllPerms && 'max-h-32 overflow-hidden')}>
              {KEY_PERMS.map(p => {
                const has = perms.includes(p as never)
                return (
                  <div key={p} className={cn('flex items-center gap-1.5 text-xs', has ? 'text-[#1a5c3a]' : 'text-gray-300 dark:text-gray-600')}>
                    {has ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    <span className="capitalize">{p.replace(/_/g, ' ')}</span>
                  </div>
                )
              })}
            </div>
            <button className="text-xs text-[#1a5c3a] hover:underline mt-2 block" onClick={() => setShowAllPerms(v => !v)}>
              {showAllPerms ? 'Show less' : `View all ${perms.length} permissions`}
            </button>
          </div>

          {/* quick stats */}
          {member.stats && (
            <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">This month</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Conversations', value: member.stats.conversationsThisMonth },
                  { label: 'Messages',      value: member.stats.messagesThisMonth },
                  { label: 'Avg response',  value: `${Math.floor(member.stats.avgResponseTimeSeconds / 60)}m` },
                  { label: 'Resolution',    value: `${member.stats.resolutionRate}%` },
                ].map(s => (
                  <div key={s.label} className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="col-span-2 space-y-4">
          {/* performance chart */}
          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Performance</p>
              <select className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl h-8 px-3 text-xs text-gray-600 dark:text-gray-400 focus:outline-none">
                <option>Last 30 days</option><option>Last 7 days</option><option>This month</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={[]} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e8ebe8' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="conversations" stroke="#3b82f6" strokeWidth={2} dot={false} name="Conversations" />
                <Line type="monotone" dataKey="messages"      stroke="#1a5c3a" strokeWidth={2} dot={false} name="Messages" />
                <Line type="monotone" dataKey="resolved"      stroke="#7c3aed" strokeWidth={2} dot={false} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* current conversations */}
          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e8ebe8] dark:border-white/10">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Assigned conversations ({member.openConversations})
              </p>
            </div>
            {member.openConversations === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No assigned conversations</p>
            ) : (
              <div className="divide-y divide-[#f5f5f5]">
                {Array.from({ length: Math.min(member.openConversations, 5) }, (_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#fafffe] dark:hover:bg-white/5 cursor-pointer transition-colors" onClick={() => navigate('/inbox')}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {['RS', 'AM', 'KP', 'DN', 'SF'][i] ?? 'U'}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex-1 truncate">Latest message from contact {i + 1}...</p>
                    <span className="badge bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] text-[10px]">Open</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{fromNow(new Date(Date.now() - i * 3600000).toISOString())}</span>
                  </div>
                ))}
              </div>
            )}
            <button className="w-full text-xs text-[#1a5c3a] font-medium p-4 border-t border-[#f5f5f5] hover:bg-[#f7f8f6] dark:hover:bg-white/5 text-left transition-colors"
              onClick={() => navigate('/inbox')}>
              View all conversations →
            </button>
          </div>

          {/* activity timeline */}
          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8ebe8] dark:border-white/10">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Recent activity</p>
              <button className="text-xs text-[#1a5c3a] font-medium hover:underline">View full log →</button>
            </div>
            <div className="divide-y divide-[#f5f5f5]">
              {memberActivity.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No recent activity</p>
              ) : (memberActivity as import('@/types').ActivityLog[]).map(log => {
                const ts = TYPE_CHIP[log.actionType as keyof typeof TYPE_CHIP]
                return (
                  <div key={log.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-[#fafffe] dark:hover:bg-white/5 transition-colors">
                    <div className={cn('mt-0.5 text-[10px] rounded-full px-2 py-0.5 font-medium flex-shrink-0', ts.bg, ts.text)}>{log.actionType}</div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">
                      {log.action} <span className="text-[#1a5c3a] font-medium">{log.targetName}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">{fromNow(log.createdAt)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {showEdit && <EditMemberModal member={member} onClose={() => setShowEdit(false)} />}
    </div>
  )
}
