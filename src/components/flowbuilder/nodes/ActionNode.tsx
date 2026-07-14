import { Handle, Position, type NodeProps } from 'reactflow'
import { UserCheck, Tag, CheckCircle, Webhook, Edit3, CornerDownRight, RefreshCw } from 'lucide-react'
import type { FlowNodeData } from '@/types/flow'
import NodeActions from './NodeActions'

const ACTION_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  assign_agent: { icon: UserCheck, color: '#f59e0b', label: 'Assign to agent' },
  add_tag: { icon: Tag, color: '#1a5c3a', label: 'Add tag' },
  remove_tag: { icon: Tag, color: '#ef4444', label: 'Remove tag' },
  mark_resolved: { icon: CheckCircle, color: '#22c55e', label: 'Mark resolved' },
  webhook: { icon: Webhook, color: '#6b7280', label: 'Send webhook' },
  update_field: { icon: Edit3, color: '#3b82f6', label: 'Update field' },
  jump_to_step: { icon: CornerDownRight, color: '#6b7280', label: 'Jump to step' },
  restart_flow: { icon: RefreshCw, color: '#f59e0b', label: 'Restart flow' },
}

export default function ActionNode({ id, data, selected }: NodeProps<FlowNodeData>) {
  const actionType = (data.config?.type as string) ?? 'assign_agent'
  const meta = ACTION_META[actionType] ?? ACTION_META.assign_agent
  const Icon = meta.icon

  return (
    <div
      className="rounded-2xl overflow-hidden min-w-[180px] max-w-[240px] select-none"
      style={{
        background: 'white',
        border: selected ? '2px solid #1a5c3a' : '2px solid #e8ebe8',
        boxShadow: selected ? '0 0 0 4px rgba(26,92,58,0.1)' : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <NodeActions nodeId={id} selected={selected} />
      <Handle type="target" position={Position.Top} style={{ width: 10, height: 10, background: '#94a3b8', top: -6 }} />

      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: meta.color }}>
        <Icon size={13} className="text-white" />
        <span className="text-xs font-semibold text-white">{meta.label}</span>
      </div>

      <div className="px-4 py-3">
        <p className="text-xs text-gray-700">{data.label}</p>
        {actionType === 'assign_agent' && data.config?.strategy != null && (
          <p className="text-2xs text-gray-400 mt-0.5 capitalize">{String(data.config.strategy).replace(/_/g, ' ')}</p>
        )}
        {(actionType === 'add_tag' || actionType === 'remove_tag') && Boolean(data.config?.tag) && (
          <p className="text-2xs text-gray-400 mt-0.5">#{String(data.config.tag)}</p>
        )}
        {actionType === 'update_field' && Boolean(data.config?.field) && (
          <p className="text-2xs text-gray-400 mt-0.5">{String(data.config.field)} = {String(data.config?.value ?? '')}</p>
        )}
        {actionType === 'webhook' && Boolean(data.config?.url) && (
          <p className="text-2xs text-gray-400 mt-0.5 truncate">{String(data.config.url)}</p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ width: 10, height: 10, background: '#94a3b8', bottom: -6 }} />
    </div>
  )
}
