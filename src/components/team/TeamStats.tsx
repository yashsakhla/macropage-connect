import { ArrowUp, Diamond, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import totalMembersIcon from '@/assets/teams/1.svg'
import activeNowIcon from '@/assets/teams/2.svg'
import pendingInvitesIcon from '@/assets/teams/3.svg'

interface Props {
  totalMembers: number
  newThisWeek: number
  activeNow: number
  activePercent: number
  pendingInvites: number
}

function TileIcon({ src }: { src: string }) {
  return (
    <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded-xl">
      <img src={src} alt="" className="w-full h-full object-cover" style={{ transform: 'scale(1.55)' }} />
    </div>
  )
}

function Sparkline({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 300 40" className="w-full h-9 mt-3" preserveAspectRatio="none">
      <polyline
        points="0,30 25,26 50,29 75,18 100,22 125,12 150,17 175,7 200,13 225,4 250,10 275,5 300,8"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function TeamStats({ totalMembers, newThisWeek, activeNow, activePercent, pendingInvites }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="card p-5 relative overflow-hidden">
        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#e8f5ee] dark:bg-emerald-950/30 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-[#1a5c3a]" />
        </div>
        <div className="flex items-center gap-3">
          <TileIcon src={totalMembersIcon} />
          <div>
            <p className="text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total members</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalMembers}</p>
          </div>
        </div>
        <p className="text-xs text-[#1a5c3a] font-medium mt-2.5 flex items-center gap-1">
          <ArrowUp size={11} /> +{newThisWeek} this week
        </p>
        <Sparkline color="#1a5c3a" />
      </div>

      <div className="card p-5 relative overflow-hidden">
        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
          <Diamond size={11} className="text-purple-500 dark:text-purple-400" />
        </div>
        <div className="flex items-center gap-3">
          <TileIcon src={activeNowIcon} />
          <div>
            <p className="text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Active now</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeNow}</p>
          </div>
        </div>
        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-2.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> {activePercent}% of team
        </p>
        <Sparkline color="#a855f7" />
      </div>

      <div className="card p-5 relative overflow-hidden">
        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
          <Square size={11} className="text-amber-500 dark:text-amber-400" />
        </div>
        <div className="flex items-center gap-3">
          <TileIcon src={pendingInvitesIcon} />
          <div>
            <p className="text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Pending invites</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingInvites}</p>
          </div>
        </div>
        <p className={cn('text-xs font-medium mt-2.5 flex items-center gap-1.5', pendingInvites > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500')}>
          <span className={cn('w-1.5 h-1.5 rounded-full', pendingInvites > 0 ? 'bg-amber-500' : 'bg-gray-300')} /> {pendingInvites} awaiting action
        </p>
        <Sparkline color="#f59e0b" />
      </div>
    </div>
  )
}
