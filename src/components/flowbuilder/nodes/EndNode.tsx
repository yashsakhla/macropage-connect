import { Handle, Position, type NodeProps } from 'reactflow'
import { UserPlus } from 'lucide-react'
import type { FlowNodeData } from '@/types/flow'
import NodeActions from './NodeActions'

export default function EndNode({ id, data, selected }: NodeProps<FlowNodeData>) {
  const isHandoff = data.nodeType === 'handoff'

  return (
    <div
      className="rounded-2xl px-5 py-3 min-w-[160px] text-center select-none"
      style={{
        background: isHandoff ? '#1a5c3a' : '#1f2937',
        border: selected ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
        boxShadow: selected ? '0 0 0 4px rgba(26,92,58,0.1), 0 4px 12px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.12)',
      }}
    >
      <NodeActions nodeId={id} selected={selected} />
      <Handle type="target" position={Position.Top} style={{ width: 10, height: 10, background: 'rgba(255,255,255,0.4)', top: -6 }} />

      {isHandoff ? (
        <div className="flex items-center gap-2 justify-center">
          <UserPlus size={14} className="text-white" />
          <span className="text-sm font-semibold text-white">Handoff to agent</span>
        </div>
      ) : (
        <span className="text-sm font-semibold text-white">■ End flow</span>
      )}
    </div>
  )
}
