import { Star, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import type { TeamMember } from '@/types'
import { getInitials } from '@/lib/utils'
import { ROLE_STYLE } from './RoleBadge'

const MOCK_PERF_DATA: { name: string; conversations: number; avgResponse: number }[] = []
const MOCK_RADAR_DATA: { subject: string; B: number; C: number; D: number }[] = []
import OnlineIndicator from './OnlineIndicator'

function ResponseBar({ secs }: { secs: number }) {
  const mins = secs / 60
  const color = mins < 5 ? 'bg-[#1a5c3a]' : mins < 15 ? 'bg-amber-500' : 'bg-red-500'
  const textColor = mins < 5 ? 'text-[#1a5c3a]' : mins < 15 ? 'text-amber-600' : 'text-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className={cn('text-sm font-semibold', textColor)}>
        {mins < 1 ? `${secs}s` : `${Math.floor(mins)}m ${secs % 60}s`}
      </div>
      <div className="bg-gray-100 rounded-full h-1.5 w-20 overflow-hidden">
        <div className={cn('h-1.5 rounded-full', color)} style={{ width: `${Math.min((mins / 20) * 100, 100)}%` }} />
      </div>
    </div>
  )
}

function ResolutionBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? 'bg-[#1a5c3a]' : pct >= 75 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-900">{pct}%</span>
      <div className="bg-gray-100 rounded-full h-1.5 w-20 overflow-hidden">
        <div className={cn('h-1.5 rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const MEDALS = ['🥇', '🥈', '🥉']

interface PerformanceStatsProps { members: TeamMember[] }

export default function PerformanceStats({ members }: PerformanceStatsProps) {
  const active = members.filter(m => m.status === 'active' && m.stats)
    .sort((a, b) => (b.stats?.conversationsThisMonth ?? 0) - (a.stats?.conversationsThisMonth ?? 0))

  return (
    <div className="space-y-6 px-5 py-6">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-gray-900">Team Performance</p>
        <select className="bg-white border border-[#e8ebe8] rounded-xl h-9 px-3 text-sm text-gray-600 focus:outline-none focus:border-[#1a5c3a]">
          <option>This month</option>
          <option>Last month</option>
          <option>This week</option>
          <option>Last 3 months</option>
        </select>
      </div>

      {/* charts row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">Conversations handled</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MOCK_PERF_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e8ebe8' }} />
              <Bar dataKey="conversations" fill="#1a5c3a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">Avg response time (min)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MOCK_PERF_DATA} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e8ebe8' }} />
              <Bar dataKey="avgResponse" radius={[0, 4, 4, 0]}
                fill="#1a5c3a"
                label={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">Agent comparison</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={MOCK_RADAR_DATA} cx="50%" cy="50%" outerRadius={60}>
              <PolarGrid stroke="#e8ebe8" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <Radar name="Anjali" dataKey="C" stroke="#1a5c3a" fill="#1a5c3a" fillOpacity={0.2} />
              <Radar name="Rahul" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
              <Radar name="Mohammed" dataKey="D" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* leaderboard */}
      <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8ebe8]">
          <p className="text-sm font-semibold text-gray-800">Agent Performance</p>
          <button className="btn btn-outline h-8 text-xs flex items-center gap-1.5">
            <Download size={12} /> Export CSV
          </button>
        </div>

        <div className="grid bg-[#f7f8f6] border-b border-[#e8ebe8] px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
          style={{ gridTemplateColumns: '40px 2fr 100px 130px 110px 110px 100px' }}>
          <span>#</span>
          <span>Agent</span>
          <span>Convos</span>
          <span>Avg response</span>
          <span>Resolution</span>
          <span>CSAT</span>
          <span>Status</span>
        </div>

        {active.map((member, idx) => {
          const s = member.stats!
          const rs = ROLE_STYLE[member.role]
          return (
            <div key={member.id} className="grid items-center px-5 py-4 border-b border-[#f5f5f5] hover:bg-[#fafffe] transition-colors"
              style={{ gridTemplateColumns: '40px 2fr 100px 130px 110px 110px 100px' }}>
              <span className="text-lg">{MEDALS[idx] ?? <span className="text-sm text-gray-500">{idx + 1}</span>}</span>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a5c3a] to-teal-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {getInitials(member.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <span className={cn('text-[10px] font-medium', rs.text)}>{rs.label}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900">{s.conversationsThisMonth}</p>
                <p className="text-[10px] text-[#1a5c3a]">↑ 12% vs last</p>
              </div>

              <ResponseBar secs={s.avgResponseTimeSeconds} />

              <ResolutionBar pct={s.resolutionRate} />

              <div>
                {s.csatScore && s.csatCount && s.csatCount >= 5 ? (
                  <>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" /> {s.csatScore.toFixed(1)}
                    </p>
                    <p className="text-[10px] text-gray-400">({s.csatCount} ratings)</p>
                  </>
                ) : <span className="text-sm text-gray-300">N/A</span>}
              </div>

              <OnlineIndicator status={member.onlineStatus} lastActiveAt={member.lastActiveAt} showLabel />
            </div>
          )
        })}
      </div>
    </div>
  )
}
