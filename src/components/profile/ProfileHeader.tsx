import { Zap, CalendarDays, Clock, AlertTriangle } from 'lucide-react'
import { format, differenceInDays, differenceInHours } from 'date-fns'
import type { User, Subscription } from '@/types'
import avatarMen from '@assets/avatar-men.webp'
import avatarWomen from '@assets/avatar-women.png'
import { useBillingSubscription } from '@/hooks/useBilling'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner', admin: 'Admin', manager: 'Manager', agent: 'Agent',
}

// Cover design per plan tier — Starter gets a flat, calm cover; every paid
// tier above it gets an animated gradient to visually signal "upgraded".
const COVER_BY_PLAN: Record<string, string> = {
  starter: 'linear-gradient(135deg, #37503f, #23402f)',
  growth:  'linear-gradient(120deg, #1a3d2b, #1a5c3a, #2d7a4f, #1a5c3a)',
  pro:     'linear-gradient(120deg, #1a2e5c, #2d4f9e, #6b3fa0, #2d4f9e)',
  enterprise: 'linear-gradient(120deg, #3d2b1a, #7a5a2d, #a0783f, #7a5a2d)',
}

function PlanInfo({ subscription, user }: { subscription: Subscription; user: User }) {
  const endRaw   = subscription.currentPeriodEnd
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

  const urgency = hoursLeft <= 0 ? 'expired' : 'ok'

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

  return (
    <div className="relative w-full sm:w-64">

      {/* Row 1: plan name + status badge */}
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
          <Zap size={13} className="text-white/90" /> {planLabel} Plan
        </span>
        <span className={cn(
          'text-2xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 backdrop-blur',
          isTrial   ? 'bg-amber-400/20 text-amber-100 border border-amber-200/40'   :
          isActive  ? 'bg-white/15 text-white border border-white/25' :
          isPastDue ? 'bg-red-400/20 text-red-100 border border-red-200/40'         :
                      'bg-white/10 text-white/70 border border-white/20'
        )}>
          {statusLabel}
        </span>
      </div>

      {/* Row 2: thin progress bar */}
      <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-white transition-all duration-500"
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      {/* Row 3: time remaining + renewal date */}
      <div className="flex items-center gap-1.5 mt-2">
        <Clock size={10} className="text-white/70" />
        <span className="text-2xs font-semibold text-white">{timeLeft}</span>
        <span className="text-white/40 text-2xs">·</span>
        <CalendarDays size={10} className="text-white/70" />
        <span className="text-2xs text-white/70 flex items-center gap-1">
          {willCancel && <AlertTriangle size={9} className="text-amber-300" />}
          {periodLabel}
        </span>
      </div>

    </div>
  )
}

interface Props { user: User; onEditClick: () => void }

export default function ProfileHeader({ user, onEditClick }: Props) {
  const defaultAvatar = user.gender === 'female' ? avatarWomen : avatarMen

  const { data: subscription } = useBillingSubscription()

  const planKey   = (subscription?.planName ?? 'starter').toLowerCase()
  const isStarter = planKey === 'starter'
  const planLabel = subscription?.planName
    ? subscription.planName.charAt(0).toUpperCase() + subscription.planName.slice(1).toLowerCase()
    : 'Starter'
  const cover = COVER_BY_PLAN[planKey] ?? COVER_BY_PLAN.starter

  return (
    <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden mb-6">
      {/* Cover */}
      <div
        className={cn('relative h-32 flex items-center justify-end px-6 overflow-hidden', !isStarter && 'animate-gradient-shift bg-[length:200%_200%]')}
        style={{ background: cover }}
      >
        {!isStarter && (
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white, transparent 40%), radial-gradient(circle at 80% 70%, white, transparent 35%)' }} />
        )}
        {subscription ? (
          <PlanInfo subscription={subscription} user={user} />
        ) : (
          <span className="relative text-white/90 text-sm font-semibold tracking-wide flex items-center gap-1.5">
            <Zap size={13} /> {planLabel} Plan
          </span>
        )}
      </div>

      {/* Info row */}
      <div className="px-6 pb-5">
        <div className="relative -mt-10 mb-3 w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-[#1a3d2b] flex items-center justify-center">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <img src={defaultAvatar} alt={user.name} className="w-full h-full object-cover" />
          )}
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Identity */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900 truncate">{user.name}</h2>
              <span className="text-xs bg-[#e8f5ee] text-[#1a5c3a] rounded-full px-2.5 py-0.5 font-medium capitalize">{ROLE_LABELS[user.role] ?? user.role}</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{user.email}</p>
          </div>

          <button onClick={onEditClick} className="btn-outline h-9 text-sm flex-shrink-0">Edit profile</button>
        </div>
      </div>
    </div>
  )
}
