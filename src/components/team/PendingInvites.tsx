import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  usePendingInvites,
  useResendInvite,
  useCancelInvite,
} from '@/hooks/useTeam'
import { cn } from '@/lib/utils'
import {
  Mail, RefreshCw, X,
  Clock, AlertCircle, Loader2,
} from 'lucide-react'

export default function PendingInvites() {
  const {
    data: invites,
    isLoading: loading,
    isError: error,
    refetch,
    isFetching,
  } = usePendingInvites()

  const { mutate: resend, isPending: resending, variables: resendingId } = useResendInvite()
  const { mutate: cancel, isPending: cancelling } = useCancelInvite()

  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="space-y-2 mt-4">
        {[1, 2].map(i => (
          <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mt-4">
        <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
        <p className="text-xs text-red-600 flex-1">Could not load pending invites</p>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs text-red-600 font-medium flex items-center gap-1"
        >
          <RefreshCw size={11} className={cn(isFetching && 'animate-spin')} />
          Retry
        </button>
      </div>
    )
  }

  if (!invites || (invites as any[]).length === 0) return null

  return (
    <div className="mt-6">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Pending invites ({(invites as any[]).length})
      </p>

      <div className="space-y-2">
        {(invites as any[]).map((invite: any) => (
          <div
            key={invite._id}
            className="bg-[#f7f8f6] border border-[#e8ebe8] rounded-2xl px-4 py-3"
          >
            <div className="flex items-center gap-3">

              {/* Email icon */}
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={15} className="text-amber-500" />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {invite.email}
                  </p>
                  <span className="text-2xs bg-amber-50 text-amber-600 rounded-full px-2 py-0.5 font-medium flex-shrink-0">
                    {invite.role}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock size={10} className="text-gray-300" />
                  <p className="text-2xs text-gray-400">
                    Sent {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                    {' '}· Expires {formatDistanceToNow(new Date(invite.expiresAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">

                {/* Resend */}
                <button
                  onClick={() => resend(invite._id)}
                  disabled={resending && resendingId === invite._id}
                  className="flex items-center gap-1.5 text-xs font-medium h-8 px-3 rounded-xl bg-white border border-[#e8ebe8] text-gray-600 hover:text-[#1a5c3a] hover:border-[#c8e6d4] disabled:opacity-50 transition-all"
                >
                  {resending && resendingId === invite._id
                    ? <Loader2 size={11} className="animate-spin" />
                    : <RefreshCw size={11} />
                  }
                  Resend
                </button>

                {/* Cancel */}
                {confirmCancel === invite._id ? (
                  <div className="flex items-center gap-1">
                    <span className="text-2xs text-gray-500">Sure?</span>
                    <button
                      onClick={() => {
                        cancel(invite._id)
                        setConfirmCancel(null)
                      }}
                      disabled={cancelling}
                      className="text-2xs font-bold text-red-500 hover:text-red-700"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmCancel(null)}
                      className="text-2xs text-gray-400"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmCancel(invite._id)}
                    className="w-8 h-8 rounded-xl bg-white border border-[#e8ebe8] flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
