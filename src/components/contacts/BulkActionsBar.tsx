import { Tag, Download, Megaphone, UserMinus, UserCheck, Trash2, X } from 'lucide-react'

interface BulkActionsBarProps {
  selectedIds: Set<string>
  totalCount: number
  onSelectAll: () => void
  onClear: () => void
  onAddTag: () => void
  onRemoveTag: () => void
  onExport: () => void
  onCampaign: () => void
  onOptOut: () => void
  onRemoveOptOut: () => void
  /** True once every selected contact is already opted out — swaps the button to "Remove opt-out". */
  allOptedOut: boolean
  onDelete: () => void
}

export default function BulkActionsBar({
  selectedIds, totalCount,
  onSelectAll, onClear,
  onAddTag, onRemoveTag, onExport, onCampaign, onOptOut, onRemoveOptOut, allOptedOut, onDelete,
}: BulkActionsBarProps) {
  if (selectedIds.size === 0) return null

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a3d2b] text-white rounded-xl mb-3 animate-in slide-in-from-top-1 duration-200 overflow-x-auto">
      {/* count + select-all */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-medium whitespace-nowrap">
          {selectedIds.size} contact{selectedIds.size !== 1 ? 's' : ''} selected
        </span>
        {selectedIds.size < totalCount && (
          <button
            className="text-xs text-white/70 hover:text-white underline whitespace-nowrap"
            onClick={onSelectAll}
          >
            Select all {totalCount}
          </button>
        )}
      </div>

      {/* divider */}
      <div className="w-px h-4 bg-white/20 flex-shrink-0 mx-1" />

      {/* actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onAddTag}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs h-7 px-2.5 transition-colors whitespace-nowrap"
        >
          <Tag size={12} /> Add tag
        </button>
        <button
          onClick={onRemoveTag}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs h-7 px-2.5 transition-colors whitespace-nowrap"
        >
          <Tag size={12} /> Remove tag
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs h-7 px-2.5 transition-colors whitespace-nowrap"
        >
          <Download size={12} /> Export
        </button>
        <button
          onClick={onCampaign}
          className="flex items-center gap-1.5 bg-[#1a5c3a] hover:bg-[#2d7a4f] rounded-lg text-white text-xs h-7 px-2.5 font-medium transition-colors whitespace-nowrap"
        >
          <Megaphone size={12} /> Campaign
        </button>
        {allOptedOut ? (
          <button
            onClick={onRemoveOptOut}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs h-7 px-2.5 transition-colors whitespace-nowrap"
          >
            <UserCheck size={12} /> Remove opt-out
          </button>
        ) : (
          <button
            onClick={onOptOut}
            className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-200 text-xs h-7 px-2.5 transition-colors whitespace-nowrap"
          >
            <UserMinus size={12} /> Opt out
          </button>
        )}
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-200 text-xs h-7 px-2.5 transition-colors whitespace-nowrap"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>

      <button
        onClick={onClear}
        className="ml-auto flex-shrink-0 w-6 h-6 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  )
}
