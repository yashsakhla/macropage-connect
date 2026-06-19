import { useState, useMemo } from 'react'
import { useAssignableMembers } from '@/hooks/useTeam'
import { useAssignConversation } from '@/hooks/useConversations'
import { X, Search, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AssignModalProps {
  conversationId: string
  currentAssigneeId?: string | null
  onClose: () => void
}

export default function AssignModal({
  conversationId,
  currentAssigneeId,
  onClose,
}: AssignModalProps) {
  const [search, setSearch] = useState('')

  const {
    data: members,
    isLoading,
    isError,
    refetch,
  } = useAssignableMembers()

  const {
    mutate: assign,
    isPending: assigning,
    variables: assigningTo,
  } = useAssignConversation()

  const filtered = useMemo(() => {
    if (!members) return []
    const q = search.toLowerCase().trim()
    if (!q) return members
    return members.filter((m: any) =>
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    )
  }, [members, search])

  const handleAssign = (userId: string) => {
    assign(
      { conversationId, userId },
      { onSuccess: () => onClose() }
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden max-h-[80vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8ebe8] flex-shrink-0">
          <h2 className="text-sm font-bold text-gray-900">Assign conversation</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl bg-[#f7f8f6] hover:bg-[#e8ebe8] flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-[#f0f0f0] flex-shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search team members..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#e8ebe8] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 focus:border-[#1a5c3a] placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Team list */}
        <div className="flex-1 overflow-y-auto px-2 py-2">

          {isLoading && (
            <div className="space-y-2 px-3 py-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {isError && !isLoading && (
            <div className="flex items-center gap-3 px-4 py-4">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-500 flex-1">Could not load team members</p>
              <button onClick={() => refetch()} className="text-xs text-red-500 font-medium">
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No team members found</p>
          )}

          {!isLoading && !isError && filtered.map((member: any) => {
            const isCurrentAssignee = member._id === currentAssigneeId
            const isAssigningToThis = assigning && assigningTo?.userId === member._id

            return (
              <button
                key={member._id}
                onClick={() => handleAssign(member._id)}
                disabled={assigning || isCurrentAssignee}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors disabled:cursor-default',
                  isCurrentAssignee ? 'bg-[#e8f5ee]' : 'hover:bg-[#f7f8f6]'
                )}
              >
                {/* Avatar with online dot */}
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-[#e8f5ee] flex items-center justify-center overflow-hidden">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-[#1a5c3a]">
                        {member.name?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className={cn(
                    'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white',
                    member.status === 'online' ? 'bg-[#1a5c3a]' : 'bg-gray-300'
                  )} />
                </div>

                {/* Name + role */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 truncate">{member.name}</p>
                    {isCurrentAssignee && (
                      <span className="text-2xs bg-[#1a5c3a] text-white rounded-full px-2 py-0.5 font-medium flex-shrink-0">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {member.role}
                    {member.status === 'online' && (
                      <span className="text-[#1a5c3a] ml-1.5">· Online</span>
                    )}
                  </p>
                </div>

                {isAssigningToThis && (
                  <Loader2 size={14} className="animate-spin text-[#1a5c3a] flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
