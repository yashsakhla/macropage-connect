import { useState } from 'react'
import {
  LogIn, LogOut, Lock, User,
  MessageSquare, CheckCircle, UserCheck,
  Zap, PauseCircle, UserPlus, UserMinus,
  Upload, FileText, Send, Wifi,
  Shield, Key, Activity, Clock,
  Monitor, Smartphone, Tablet,
  AlertCircle, RefreshCw, Loader2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useUserActivity } from '@/hooks/useProfile'

function getActivityConfig(type: string): { icon: any; bg: string; color: string } {
  const configs: Record<string, { icon: any; bg: string; color: string }> = {
    LOGIN:                  { icon: LogIn,        bg: 'bg-blue-50',     color: 'text-blue-500' },
    LOGOUT:                 { icon: LogOut,       bg: 'bg-gray-100',    color: 'text-gray-400' },
    PASSWORD_CHANGED:       { icon: Lock,         bg: 'bg-purple-50',   color: 'text-purple-500' },
    PROFILE_UPDATED:        { icon: User,         bg: 'bg-[#e8f5ee]',   color: 'text-[#1a5c3a]' },
    MESSAGE_SENT:           { icon: MessageSquare,bg: 'bg-blue-50',     color: 'text-blue-500' },
    CONVERSATION_RESOLVED:  { icon: CheckCircle,  bg: 'bg-[#e8f5ee]',   color: 'text-[#1a5c3a]' },
    CONVERSATION_ASSIGNED:  { icon: UserCheck,    bg: 'bg-teal-50',     color: 'text-teal-500' },
    CAMPAIGN_CREATED:       { icon: Zap,          bg: 'bg-purple-50',   color: 'text-purple-500' },
    CAMPAIGN_LAUNCHED:      { icon: Zap,          bg: 'bg-[#e8f5ee]',   color: 'text-[#1a5c3a]' },
    CAMPAIGN_PAUSED:        { icon: PauseCircle,  bg: 'bg-amber-50',    color: 'text-amber-500' },
    CONTACT_CREATED:        { icon: UserPlus,     bg: 'bg-blue-50',     color: 'text-blue-500' },
    CONTACT_IMPORTED:       { icon: Upload,       bg: 'bg-teal-50',     color: 'text-teal-500' },
    TEMPLATE_CREATED:       { icon: FileText,     bg: 'bg-purple-50',   color: 'text-purple-500' },
    TEMPLATE_SUBMITTED:     { icon: Send,         bg: 'bg-amber-50',    color: 'text-amber-500' },
    TEAM_MEMBER_INVITED:    { icon: UserPlus,     bg: 'bg-[#e8f5ee]',   color: 'text-[#1a5c3a]' },
    TEAM_MEMBER_REMOVED:    { icon: UserMinus,    bg: 'bg-red-50',      color: 'text-red-400' },
    WHATSAPP_CONNECTED:     { icon: Wifi,         bg: 'bg-[#e8f5ee]',   color: 'text-[#1a5c3a]' },
    TWO_FA_ENABLED:         { icon: Shield,       bg: 'bg-[#e8f5ee]',   color: 'text-[#1a5c3a]' },
    API_KEY_CREATED:        { icon: Key,          bg: 'bg-purple-50',   color: 'text-purple-500' },
  }
  return configs[type] ?? { icon: Activity, bg: 'bg-gray-100', color: 'text-gray-400' }
}

function ActivityRow({ activity }: { activity: any }) {
  const config = getActivityConfig(activity.type)
  const Icon = config.icon

  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#f0f0f0] last:border-0">
      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', config.bg)}>
        <Icon size={14} className={config.color} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug">{activity.description}</p>
        <div className="flex items-center gap-2 mt-1">
          {activity.device && activity.device !== 'unknown' && (
            <span className="text-2xs text-gray-400 flex items-center gap-1">
              {activity.device === 'mobile'
                ? <Smartphone size={10} />
                : activity.device === 'tablet'
                ? <Tablet size={10} />
                : <Monitor size={10} />
              }
              {activity.device}
            </span>
          )}
          {activity.ipAddress && (
            <span className="text-2xs text-gray-300">{activity.ipAddress}</span>
          )}
          {activity.status === 'failed' && (
            <span className="text-2xs bg-red-50 text-red-500 rounded-full px-1.5 py-0.5 font-medium">
              Failed
            </span>
          )}
        </div>
      </div>

      <span className="text-2xs text-gray-400 flex-shrink-0 mt-0.5">
        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
      </span>
    </div>
  )
}

export default function ActivityFeed() {
  const [activityPage, setActivityPage] = useState(1)

  const {
    data: activityData,
    isLoading: activityLoading,
    isError: activityError,
    refetch: refetchActivity,
    isFetching: activityFetching,
  } = useUserActivity(activityPage)

  const activities = activityData?.activities ?? []
  const totalPages = activityData?.totalPages ?? 1

  return (
    <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-[#e8ebe8]">
        <p className="text-sm font-semibold text-gray-800">Your recent activity</p>
      </div>

      <div className="px-6 py-4">
        {/* Loading */}
        {activityLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-100 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-16 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {activityError && !activityLoading && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-600 flex-1">
              Could not load recent activity. We are currently facing an issue.
            </p>
            <button
              onClick={() => refetchActivity()}
              disabled={activityFetching}
              className="flex items-center gap-1.5 text-xs font-semibold h-7 px-3 rounded-xl bg-white border border-red-200 text-red-600 disabled:opacity-50"
            >
              <RefreshCw size={10} className={cn(activityFetching && 'animate-spin')} />
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!activityLoading && !activityError && activities.length === 0 && (
          <div className="text-center py-8">
            <div className="w-10 h-10 bg-[#f7f8f6] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Clock size={18} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">No activity yet</p>
          </div>
        )}

        {/* Activity list */}
        {!activityLoading && !activityError && activities.length > 0 && (
          <div className="space-y-1">
            {activities.map((activity: any) => (
              <ActivityRow key={activity._id} activity={activity} />
            ))}
          </div>
        )}

        {/* Load more */}
        {!activityLoading && !activityError && activityPage < totalPages && (
          <button
            onClick={() => setActivityPage(p => p + 1)}
            disabled={activityFetching}
            className="w-full mt-3 h-9 text-xs font-medium text-gray-500 hover:text-gray-700 border border-[#e8ebe8] rounded-xl hover:bg-[#f7f8f6] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {activityFetching ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              'Load more'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
