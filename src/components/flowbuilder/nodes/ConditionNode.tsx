import { Handle, Position, type NodeProps } from 'reactflow'
import { GitBranch } from 'lucide-react'
import type { FlowNodeData } from '@/types/flow'

export default function ConditionNode({ data, selected }: NodeProps<FlowNodeData>) {
  const value = (data.config?.value as string) ?? ''
  const condType = (data.config?.type as string) ?? 'message_contains'

  return (
    <div
      className="rounded-2xl overflow-hidden min-w-[200px] max-w-[260px] select-none relative"
      style={{
        background: 'white',
        border: selected ? '2px solid #1a5c3a' : '2px solid #e8ebe8',
        boxShadow: selected ? '0 0 0 4px rgba(26,92,58,0.1), 0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ width: 10, height: 10, background: '#94a3b8', top: -6 }} />

      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: '#a855f7' }}>
        <GitBranch size={13} className="text-white" />
        <span className="text-xs font-semibold text-white">Condition</span>
      </div>

      <div className="px-4 py-3">
        <p className="text-xs text-gray-700 mb-3">
          IF {condType.replace(/_/g, ' ')}: <span className="font-medium">'{value || 'set condition'}'</span>
        </p>
        <div className="flex justify-between">
          <span className="text-xs bg-green-50 text-green-700 rounded-full px-2 py-0.5 font-medium">✓ Yes</span>
          <span className="text-xs bg-red-50 text-red-600 rounded-full px-2 py-0.5 font-medium">✗ No</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ width: 10, height: 10, background: '#1a5c3a', bottom: -6, left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ width: 10, height: 10, background: '#ef4444', bottom: -6, left: '70%' }}
      />
    </div>
  )
}
