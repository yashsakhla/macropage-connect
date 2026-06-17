import { Handle, Position, type NodeProps } from 'reactflow'
import type { FlowNodeData } from '@/types/flow'

export default function StartNode({ data, selected }: NodeProps<FlowNodeData>) {
  return (
    <div
      className="rounded-2xl px-5 py-3 min-w-[180px] cursor-pointer select-none"
      style={{
        background: '#1a5c3a',
        border: selected ? '2px solid #0d3d25' : '2px solid transparent',
        boxShadow: selected ? '0 0 0 4px rgba(26,92,58,0.15), 0 4px 12px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.12)',
      }}
    >
      <p className="text-white text-sm font-semibold">▶ Flow starts</p>
      {data.config?.trigger != null && (
        <div className="mt-2 bg-white/20 rounded-xl px-3 py-1.5">
          <p className="text-xs text-white/80">{String(data.config.trigger)}</p>
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ width: 12, height: 12, background: 'white', border: '2px solid #1a5c3a', bottom: -7 }}
      />
    </div>
  )
}
