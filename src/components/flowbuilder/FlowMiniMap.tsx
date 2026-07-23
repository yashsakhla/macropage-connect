import { MiniMap } from 'reactflow'
import { useUIStore } from '@/store/uiStore'
import type { FlowNodeData, FlowNodeType } from '@/types/flow'

const NODE_COLORS: Record<FlowNodeType, string> = {
  start: '#1a5c3a',
  message: '#3b82f6',
  condition: '#a855f7',
  action: '#f59e0b',
  ai: '#ec4899',
  delay: '#6b7280',
  end: '#1f2937',
  handoff: '#1a5c3a',
}

export default function FlowMiniMap() {
  const theme = useUIStore(s => s.theme)
  const isDark = theme === 'dark'

  return (
    <MiniMap
      nodeColor={(node) => {
        const data = node.data as FlowNodeData
        return NODE_COLORS[data?.nodeType ?? 'message'] ?? '#94a3b8'
      }}
      style={{
        background: isDark ? 'rgba(11,18,32,0.9)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(4px)',
        borderRadius: 12,
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e8ebe8',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
      maskColor={isDark ? 'rgba(15,23,36,0.7)' : 'rgba(247,248,246,0.7)'}
    />
  )
}
