import { Handle, Position, type NodeProps } from 'reactflow'
import { Timer } from 'lucide-react'
import type { FlowNodeData } from '@/types/flow'
import NodeActions from './NodeActions'

export default function DelayNode({ id, data, selected }: NodeProps<FlowNodeData>) {
  const duration = (data.config?.duration as number) ?? 5
  const unit = (data.config?.unit as string) ?? 'minutes'
  const short: Record<string, string> = { seconds: 's', minutes: 'm', hours: 'h', days: 'd' }

  return (
    <div
      className="rounded-2xl overflow-hidden min-w-[160px] select-none"
      style={{
        background: 'white',
        border: selected ? '2px solid #1a5c3a' : '2px solid #e8ebe8',
        boxShadow: selected ? '0 0 0 4px rgba(26,92,58,0.1), 0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <NodeActions nodeId={id} selected={selected} />
      <Handle type="target" position={Position.Top} style={{ width: 10, height: 10, background: '#94a3b8', top: -6 }} />

      <div className="px-4 py-2.5 flex items-center gap-2 bg-gray-500">
        <Timer size={13} className="text-white" />
        <span className="text-xs font-semibold text-white">Wait</span>
      </div>

      <div className="px-4 py-4 text-center">
        <p className="text-3xl font-bold text-gray-800">{duration}{short[unit] ?? unit}</p>
        <p className="text-xs text-gray-400 mt-1">then continue</p>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ width: 10, height: 10, background: '#94a3b8', bottom: -6 }} />
    </div>
  )
}
