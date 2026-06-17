import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TeamMember } from '@/types'
import { getInitials } from '@/lib/utils'

function ResponseBar({ ms }: { ms: number }) {
  const color = ms < 5 ? 'bg-[#1a5c3a]' : ms < 15 ? 'bg-amber-500' : 'bg-red-500'
  const width = Math.min((ms / 30) * 100, 100)
  return (
    <div className="bg-gray-100 rounded-full h-1.5 w-20 overflow-hidden">
      <div className={cn('h-1.5 rounded-full', color)} style={{ width: `${width}%` }} />
    </div>
  )
}

function ResolutionBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? 'bg-[#1a5c3a]' : pct >= 75 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="bg-gray-100 rounded-full h-1.5 w-20 overflow-hidden">
        <div className={cn('h-1.5 rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-gray-800">{pct}%</span>
    </div>
  )
}

const STATUS_BADGE = {
  active:   { bg: 'bg-[#e8f5ee]', text: 'text-[#1a5c3a]', label: 'Online' },
  pending:  { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Pending' },
  inactive: { bg: 'bg-gray-100',  text: 'text-gray-500',   label: 'Offline' },
}

interface AgentStatsProps { members: TeamMember[] }

export default function AgentStats({ members }: AgentStatsProps) {
  const active = members.filter(m => m.status === 'active')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">Agent performance</p>
        <select className="bg-white border border-[#e8ebe8] rounded-xl h-8 px-3 text-xs text-gray-600 focus:outline-none">
          <option>This month</option>
          <option>Last month</option>
          <option>This week</option>
        </select>
      </div>

      <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-6 bg-[#f7f8f6] border-b border-[#e8ebe8] px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span className="col-span-2">Agent</span>
          <span>Conversations</span>
          <span>Avg response</span>
          <span>Resolution</span>
          <span>Status</span>
        </div>

        {active.map(member => {
          const s = member.stats
          const badge = STATUS_BADGE[member.onlineStatus === 'online' ? 'active' : 'inactive']
          return (
            <div key={member.id} className="grid grid-cols-6 px-4 py-4 border-t border-[#f5f5f5] items-center hover:bg-[#fafffe] transition-colors">
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a5c3a] to-teal-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {getInitials(member.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-400">{member.role}</p>
                </div>
              </div>

              <div>
                {s ? (
                  <>
                    <p className="text-sm font-semibold text-gray-800">{s.conversationsThisMonth}</p>
                    <p className="text-[10px] text-gray-400">this month</p>
                  </>
                ) : <span className="text-gray-300 text-sm">—</span>}
              </div>

              <div>
                {s ? (
                  <>
                    <p className="text-sm font-semibold text-gray-800">{Math.floor(s.avgResponseTimeSeconds / 60)}m</p>
                    <ResponseBar ms={Math.floor(s.avgResponseTimeSeconds / 60)} />
                  </>
                ) : <span className="text-gray-300 text-sm">—</span>}
              </div>

              <div>
                {s ? <ResolutionBar pct={s.resolutionRate} /> : <span className="text-gray-300 text-sm">—</span>}
              </div>

              <div>
                <span className={cn('badge text-xs', badge.bg, badge.text)}>{badge.label}</span>
                {s?.csatScore && (
                  <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-0.5">
                    <Star size={9} className="text-amber-400 fill-amber-400" /> {s.csatScore}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
