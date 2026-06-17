import { Handle, Position, type NodeProps } from 'reactflow'
import { MessageSquare } from 'lucide-react'
import type { FlowNodeData } from '@/types/flow'

export default function MessageNode({ data, selected }: NodeProps<FlowNodeData>) {
  const text = (data.config?.text as string) ?? ''
  const buttons = (data.config?.buttons as string[]) ?? []

  return (
    <div
      className="rounded-2xl overflow-hidden min-w-[200px] max-w-[260px] select-none"
      style={{
        background: 'white',
        border: selected ? '2px solid #1a5c3a' : '2px solid #e8ebe8',
        boxShadow: selected ? '0 0 0 4px rgba(26,92,58,0.1), 0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ width: 10, height: 10, background: '#94a3b8', top: -6 }} />

      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: '#3b82f6' }}>
        <MessageSquare size={13} className="text-white" />
        <span className="text-xs font-semibold text-white">Send message</span>
      </div>

      <div className="px-4 py-3">
        <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
          {text || <span className="text-gray-300 italic">No message set</span>}
        </p>
        {buttons.length > 0 && (
          <div className="mt-2 space-y-1">
            {buttons.map((btn, i) => (
              <div key={i} className="bg-[#e8f5ee] text-[#1a5c3a] text-xs rounded-lg px-3 py-1.5 text-center">{btn}</div>
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} id="continue" style={{ width: 10, height: 10, background: '#94a3b8', bottom: -6 }} />
      {buttons.map((_, i) => (
        <Handle
          key={i}
          type="source"
          position={Position.Right}
          id={`btn-${i}`}
          style={{ width: 10, height: 10, background: '#1a5c3a', right: -6, top: `${60 + i * 32}%` }}
        />
      ))}
    </div>
  )
}
