import { Handle, Position, type NodeProps } from 'reactflow'
import { MessageSquare, Image as ImageIcon, FileText, Video, List, Link2, Phone } from 'lucide-react'
import type { FlowNodeData, FlowButton } from '@/types/flow'
import { normalizeFlowButtons } from '../flowButtons'
import NodeActions from './NodeActions'

interface ListSection { title: string; rows: { title: string }[] }

const MEDIA_ICONS: Record<string, React.ElementType> = { image: ImageIcon, video: Video, document: FileText }

export default function MessageNode({ id, data, selected }: NodeProps<FlowNodeData>) {
  const text = (data.config?.text as string) ?? ''
  const buttons: FlowButton[] = normalizeFlowButtons(data.config?.buttons)
  const mediaType = (data.config?.mediaType as string) ?? ''
  const mediaUrl = (data.config?.mediaUrl as string) ?? ''
  const caption = (data.config?.caption as string) ?? ''
  const listButtonText = (data.config?.listButtonText as string) ?? ''
  const listSections = (data.config?.listSections as ListSection[]) ?? []
  const listOptionCount = listSections.reduce((sum, s) => sum + s.rows.length, 0)
  const MediaIcon = MEDIA_ICONS[mediaType] ?? ImageIcon

  return (
    <div
      className="rounded-2xl overflow-hidden min-w-[200px] max-w-[260px] select-none"
      style={{
        background: 'white',
        border: selected ? '2px solid #1a5c3a' : '2px solid #e8ebe8',
        boxShadow: selected ? '0 0 0 4px rgba(26,92,58,0.1), 0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <NodeActions nodeId={id} selected={selected} />
      <Handle type="target" position={Position.Top} style={{ width: 10, height: 10, background: '#94a3b8', top: -6 }} />

      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: '#3b82f6' }}>
        <MessageSquare size={13} className="text-white" />
        <span className="text-xs font-semibold text-white">Send message</span>
      </div>

      <div className="px-4 py-3">
        {mediaUrl && (
          <div className="mb-2 rounded-lg overflow-hidden border border-[#e8ebe8] dark:border-white/10 bg-gray-50 dark:bg-white/5">
            {mediaType === 'image' ? (
              <img
                src={mediaUrl}
                alt=""
                className="w-full h-24 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 text-2xs text-gray-500 dark:text-gray-400">
                <MediaIcon size={13} />
                <span className="capitalize">{mediaType || 'media'} attached</span>
              </div>
            )}
          </div>
        )}
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
          {(caption || text) || (mediaUrl ? '' : <span className="text-gray-300 dark:text-gray-600 italic">No message set</span>)}
        </p>
        {buttons.length > 0 && (
          <div className="mt-2 space-y-1">
            {buttons.map((btn, i) => (
              <div key={i} className="relative bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] text-xs rounded-lg px-3 py-1.5 text-center flex items-center justify-center gap-1.5">
                {btn.type === 'URL' && <Link2 size={11} />}
                {btn.type === 'PHONE_NUMBER' && <Phone size={11} />}
                <span className="truncate">{btn.text}</span>
                {/* Only quick-reply taps generate an inbound reply to branch on —
                    URL/call buttons don't produce a webhook, so they get no handle. */}
                {btn.type === 'QUICK_REPLY' && (
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`btn-${i}`}
                    style={{ width: 10, height: 10, background: '#1a5c3a', right: -22, top: '50%', transform: 'translateY(-50%)' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        {listOptionCount > 0 && (
          <div className="mt-2 bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] text-xs rounded-lg px-3 py-1.5 text-center font-medium flex items-center justify-center gap-1.5">
            <List size={12} />
            {listButtonText || 'View options'} ({listOptionCount})
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} id="continue" style={{ width: 10, height: 10, background: '#94a3b8', bottom: -6 }} />
    </div>
  )
}
