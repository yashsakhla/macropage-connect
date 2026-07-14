import { Handle, Position, type NodeProps } from 'reactflow'
import { Sparkles } from 'lucide-react'
import type { FlowNodeData } from '@/types/flow'
import NodeActions from './NodeActions'

export default function AINode({ id, data, selected }: NodeProps<FlowNodeData>) {
  const model = (data.config?.model as string) ?? 'gpt-4o'
  const instruction = (data.config?.instruction as string) ?? ''
  const threshold = (data.config?.confidenceThreshold as number) ?? 70

  return (
    <div
      className="rounded-2xl overflow-hidden min-w-[200px] max-w-[260px] select-none"
      style={{
        background: 'white',
        border: selected ? '2px solid #a855f7' : '2px solid #e8ebe8',
        boxShadow: selected ? '0 0 0 4px rgba(168,85,247,0.1), 0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <NodeActions nodeId={id} selected={selected} />
      <Handle type="target" position={Position.Top} style={{ width: 10, height: 10, background: '#94a3b8', top: -6 }} />

      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}>
        <Sparkles size={13} className="text-white" />
        <span className="text-xs font-semibold text-white">AI Response</span>
        <span className="ml-auto text-2xs bg-white/20 text-white rounded-full px-2 py-0.5">{model}</span>
      </div>

      <div className="px-4 py-3">
        <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
          {instruction || <span className="text-gray-300 italic">No instruction set</span>}
        </p>
        <p className="text-2xs text-gray-400 mt-2">Handoff if &lt; {threshold}% confident</p>
      </div>

      <Handle type="source" position={Position.Bottom} id="replied" style={{ width: 10, height: 10, background: '#a855f7', bottom: -6, left: '35%' }} />
      <Handle type="source" position={Position.Right} id="handoff" style={{ width: 10, height: 10, background: '#ef4444', right: -6 }} />
    </div>
  )
}
