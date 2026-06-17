import { useRef } from 'react'
import { Camera, Zap, CalendarDays, Clock, AlertTriangle } from 'lucide-react'
import { format, differenceInDays, differenceInHours } from 'date-fns'
import type { User, Subscription } from '@/types'
import avatarMen from '@assets/avatar-men.webp'
import avatarWomen from '@assets/avatar-women.png'
import { useBillingSubscription } from '@/hooks/useBilling'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner', admin: 'Admin', manager: 'Manager', agent: 'Agent',
}

function PlanInfo({ subscription, user }: { subscription: Subscription; user: User }) {
  const endRaw   = subscription.trialEndsAt ?? subscription.currentPeriodEnd
  const startRaw = subscription.currentPeriodStart ?? user.createdAt

  if (!endRaw) return null

  const now   = new Date()
  const end   = new Date(endRaw)
  const start = startRaw ? new Date(startRaw) : now

  const totalDays   = Math.max(differenceInDays(end, start), 1)
  const daysLeft    = differenceInDays(end, now)
  const hoursLeft   = differenceInHours(end, now)
  const percentUsed = Math.min(100, Math.max(0, ((totalDays - daysLeft) / totalDays) * 100))

  const isTrial    = subscription.status === 'trial'
  const isActive   = subscription.status === 'active'
  const isPastDue  = subscription.status === 'past_due'
  const willCancel = subscription.cancelAtPeriodEnd

  const urgency = hoursLeft <= 0 ? 'expired' : daysLeft <= 3 ? 'critical' : daysLeft <= 7 ? 'warning' : 'ok'

  const planLabel = subscription.planName
    ? subscription.planName.charAt(0).toUpperCase() + subscription.planName.slice(1).toLowerCase()
    : 'Trial'

  const statusLabel = isTrial ? 'Trial' : isActive ? 'Active' : isPastDue ? 'Past Due' : 'Cancelled'

  const timeLeft =
    urgency === 'expired' ? 'Expired' :
    hoursLeft < 24        ? `${hoursLeft}h remaining` :
    daysLeft === 1        ? '1 day remaining' :
                            `${daysLeft} days remaining`

  const periodLabel = isTrial
    ? `Expires ${format(end, 'MMM d, yyyy')}`
    : willCancel
    ? `Access until ${format(end, 'MMM d, yyyy')}`
    : `Renews ${format(end, 'MMM d, yyyy')}`

  const barColor =
    urgency === 'expired'  ? 'bg-red-400' :
    urgency === 'critical' ? 'bg-red-400' :
    urgency === 'warning'  ? 'bg-amber-400' :
                             'bg-[#1a5c3a]'

  const timeColor =
    urgency === 'expired'  ? 'text-red-500' :
    urgency === 'critical' ? 'text-red-500' :
    urgency === 'warning'  ? 'text-amber-600' :
                             'text-[#1a5c3a]'

  const clockColor =
    urgency === 'expired'  ? 'text-red-400' :
    urgency === 'critical' ? 'text-red-400' :
    urgency === 'warning'  ? 'text-amber-500' :
                             'text-[#1a5c3a]'

  return (
    <div className="mt-2.5">

      {/* Row 1: plan name + status badge */}
      <div className="flex items-center gap-2">
        <Zap size={11} className="text-[#1a5c3a]" />
        <span className="text-xs font-semibold text-gray-700">{planLabel} Plan</span>
        <span className={cn(
          'text-2xs font-semibold px-1.5 py-0.5 rounded-full',
          isTrial   ? 'bg-amber-50 text-amber-600 border border-amber-200'   :
          isActive  ? 'bg-[#e8f5ee] text-[#1a5c3a] border border-[#c8e6d4]' :
          isPastDue ? 'bg-red-50 text-red-500 border border-red-200'         :
                      'bg-gray-100 text-gray-500 border border-gray-200'
        )}>
          {statusLabel}
        </span>
      </div>

      {/* Row 2: date range */}
      <div className="flex items-center gap-1.5 mt-1">
        <CalendarDays size={9} className="text-gray-400" />
        <span className="text-2xs text-gray-400">
          {format(start, 'MMM d, yyyy')}
          <span className="mx-1 text-gray-300">→</span>
          {format(end, 'MMM d, yyyy')}
        </span>
      </div>

      {/* Row 3: thin progress bar */}
      <div className="mt-1.5 h-0.5 w-44 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      {/* Row 4: time remaining + period label */}
      <div className="flex items-center gap-1.5 mt-1">
        <Clock size={9} className={clockColor} />
        <span className={cn('text-2xs font-semibold', timeColor)}>{timeLeft}</span>
        <span className="text-gray-300 text-2xs">·</span>
        <span className="text-2xs text-gray-400 flex items-center gap-1">
          {willCancel && <AlertTriangle size={9} className="text-amber-500" />}
          {periodLabel}
        </span>
      </div>

    </div>
  )
}

interface Props { user: User; onEditClick: () => void }

export default function ProfileHeader({ user, onEditClick }: Props) {
  const coverRef = useRef<HTMLInputElement>(null)
  const defaultAvatar = user.gender === 'female' ? avatarWomen : avatarMen

  const { data: subscription } = useBillingSubscription()

  return (
    <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden mb-6">
      {/* Cover */}
      <div className="relative h-28 group" style={{ background: 'linear-gradient(135deg, #1a3d2b, #1a5c3a, #2d7a4f)' }}>
        <button
          onClick={() => coverRef.current?.click()}
          className="absolute top-3 right-3 bg-white/80 backdrop-blur rounded-xl h-8 px-3 text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5"
        >
          <Camera size={12} /> Edit cover
        </button>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" />
      </div>

      {/* Info row */}
      <div className="px-6 pb-5">
        <div className="relative -mt-10 mb-3 w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-[#1a3d2b] flex items-center justify-center group">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <img src={defaultAvatar} alt={user.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <Camera size={16} className="text-white" />
          </div>
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs bg-[#e8f5ee] text-[#1a5c3a] rounded-full px-2.5 py-0.5 font-medium capitalize">{ROLE_LABELS[user.role] ?? user.role}</span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
            {subscription && <PlanInfo subscription={subscription} user={user} />}
          </div>
          <button onClick={onEditClick} className="btn-outline h-9 text-sm">Edit profile</button>
        </div>
      </div>
    </div>
  )
}
