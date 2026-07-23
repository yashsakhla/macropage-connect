import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContactSegment } from '@/types'

const BUILT_IN_SEGMENTS = [
  { id: 'seg_all',    name: 'All contacts',  color: '#6b7280', statKey: 'total'    },
  { id: 'seg_active', name: 'Active',        color: '#1a5c3a', statKey: 'active'   },
  { id: 'seg_new',    name: 'New (7 days)',  color: '#3b82f6', statKey: null       },
  { id: 'seg_opted',  name: 'Opted out',     color: '#ef4444', statKey: 'optedOut' },
  { id: 'seg_silent', name: 'Silent (30d+)', color: '#374151', statKey: null       },
] as const

interface ContactSegmentsProps {
  activeSegmentId: string
  onSegmentChange: (id: string) => void
  activeTags: string[]
  onTagToggle: (tag: string) => void
  tags: string[]
  onManageTags: () => void
  onCreateSegment: () => void
  stats: { total: number; active: number; optedOut: number; addedThisMonth: number }
  /** Custom segments fetched from GET /contacts/segments, merged in below the built-ins. */
  customSegments?: ContactSegment[]
}

export default function ContactSegments({
  activeSegmentId, onSegmentChange,
  activeTags, onTagToggle,
  tags, onManageTags, onCreateSegment,
  stats, customSegments = [],
}: ContactSegmentsProps) {
  const statMap: Record<string, number> = {
    total:    stats.total,
    active:   stats.active,
    optedOut: stats.optedOut,
  }

  return (
    <div className="space-y-4">
      {/* segments */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e8ebe8] dark:border-white/10">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex-1">Segments</p>
          <button className="text-xs text-[#1a5c3a] font-medium hover:underline flex items-center gap-0.5" onClick={onCreateSegment}>
            <Plus size={12} /> New
          </button>
        </div>

        {BUILT_IN_SEGMENTS.map(seg => {
          const count = seg.statKey ? (statMap[seg.statKey] ?? 0) : null
          return (
            <SegmentRow
              key={seg.id}
              name={seg.name}
              color={seg.color}
              count={count}
              active={activeSegmentId === seg.id}
              onClick={() => onSegmentChange(seg.id)}
            />
          )
        })}

        {customSegments.map(seg => (
          <SegmentRow
            key={seg.id}
            name={seg.name}
            color={seg.color}
            count={seg.contactCount}
            active={activeSegmentId === seg.id}
            onClick={() => onSegmentChange(seg.id)}
          />
        ))}

        <button
          className="text-sm text-[#1a5c3a] w-full py-2.5 px-4 flex items-center gap-1.5 border-t border-[#f5f5f5] hover:bg-[#f7f8f6] dark:hover:bg-white/5 transition-colors"
          onClick={onCreateSegment}
        >
          <Plus size={13} /> Create segment
        </button>
      </div>

      {/* tags cloud */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex-1">Tags</p>
          <button
            className="text-xs text-[#1a5c3a] font-medium hover:underline"
            onClick={onManageTags}
          >
            Manage
          </button>
        </div>

        {tags.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-3">
            No tags yet — add tags to contacts via the bulk action bar
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => {
              const isActive = activeTags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => onTagToggle(tag)}
                  className={cn(
                    'text-xs font-medium rounded-full px-2.5 py-1 transition-all',
                    isActive
                      ? 'bg-[#1a5c3a] text-white'
                      : 'bg-[#f7f8f6] dark:bg-[#0f1724] text-gray-600 dark:text-gray-400 hover:bg-[#e8f5ee] dark:hover:bg-emerald-950/30 hover:text-[#1a5c3a]'
                  )}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function SegmentRow({ name, color, count, active, onClick }: {
  name: string; color: string; count: number | null; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5 transition-colors border-t border-[#f5f5f5]',
        active && 'bg-[#e8f5ee] dark:bg-emerald-950/30 border-l-[3px] border-l-[#1a5c3a]'
      )}
    >
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', active ? 'text-[#1a5c3a]' : 'text-gray-700 dark:text-gray-300')}>{name}</p>
      </div>
      {count !== null && (
        <span className="bg-[#f7f8f6] dark:bg-[#0f1724] text-gray-500 dark:text-gray-400 text-[10px] rounded-full px-2 py-0.5 flex-shrink-0">
          {count.toLocaleString()}
        </span>
      )}
    </button>
  )
}
