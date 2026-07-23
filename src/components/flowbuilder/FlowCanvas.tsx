import { useCallback, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  type Connection,
  type Node,
  type NodeMouseHandler,
  type OnEdgesChange,
  type OnNodesChange,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus } from 'lucide-react'
import { useFlowStore } from '@/store/flowStore'
import { useUIStore } from '@/store/uiStore'
import FlowMiniMap from './FlowMiniMap'
import StartNode from './nodes/StartNode'
import MessageNode from './nodes/MessageNode'
import ConditionNode from './nodes/ConditionNode'
import ActionNode from './nodes/ActionNode'
import AINode from './nodes/AINode'
import DelayNode from './nodes/DelayNode'
import EndNode from './nodes/EndNode'
import DeletableEdge from './edges/DeletableEdge'
import type { FlowNodeData, FlowNodeType } from '@/types/flow'

const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  condition: ConditionNode,
  action: ActionNode,
  ai: AINode,
  delay: DelayNode,
  end: EndNode,
  handoff: EndNode,
}

const edgeTypes = {
  smoothstep: DeletableEdge,
}

interface Props {
  dragNodeType: FlowNodeType | null
  dragNodeLabel?: string
  dragNodeConfig?: Record<string, unknown>
  onNodeClick: NodeMouseHandler
  onPaneClick: () => void
}

export default function FlowCanvas({ dragNodeType, dragNodeLabel, dragNodeConfig, onNodeClick, onPaneClick }: Props) {
  const { nodes, edges, setNodes, setEdges, addNode, pushHistory } = useFlowStore()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useReactFlow()
  const isDark = useUIStore(s => s.theme === 'dark')

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes(applyNodeChanges(changes, nodes) as Node<FlowNodeData>[])
    },
    [nodes, setNodes]
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges]
  )

  const onConnect = useCallback(
    (params: Connection) => {
      pushHistory()
      const edgeColor = params.sourceHandle === 'yes' ? '#1a5c3a' : params.sourceHandle === 'no' ? '#ef4444' : params.sourceHandle === 'replied' ? '#a855f7' : '#94a3b8'
      setEdges(
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            style: { stroke: edgeColor, strokeWidth: 2 },
            label: params.sourceHandle === 'yes' ? 'Yes' : params.sourceHandle === 'no' ? 'No' : undefined,
            labelStyle: { fontSize: 10, fontWeight: 600 },
            labelBgStyle: { fill: 'white', stroke: '#e8ebe8', rx: 4 },
          },
          edges
        )
      )
    },
    [edges, setEdges, pushHistory]
  )

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = (event.dataTransfer.getData('application/reactflow-type') || dragNodeType) as FlowNodeType | null
      if (!type) return
      const label = event.dataTransfer.getData('application/reactflow-label') || dragNodeLabel
      const configRaw = event.dataTransfer.getData('application/reactflow-config')
      let config = dragNodeConfig
      if (configRaw) {
        try { config = JSON.parse(configRaw) } catch { /* keep state fallback */ }
      }
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      addNode(type, position, { label, config })
    },
    [dragNodeType, dragNodeLabel, dragNodeConfig, addNode, reactFlowInstance]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const hasNodes = nodes.length > 0

  return (
    <div
      ref={reactFlowWrapper}
      className="absolute inset-0 bg-[#f7f8f6] dark:bg-[#0f1724]"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode="Backspace"
        snapToGrid
        snapGrid={[8, 8]}
        defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } }}
        proOptions={{ hideAttribution: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Background variant={BackgroundVariant.Dots} color={isDark ? '#334155' : '#d1d5db'} size={1} gap={24} />
        <Controls
          style={{
            button: {
              background: isDark ? '#0b1220' : 'white',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e8ebe8',
              borderRadius: 8,
              color: isDark ? '#e6eef0' : undefined,
            },
          } as React.CSSProperties}
        />
        <FlowMiniMap />
      </ReactFlow>

      {!hasNodes && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center pointer-events-auto">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Start building your flow</p>
            <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1 mb-4">
              <p>1. Drag nodes from the left panel</p>
              <p>2. Connect them by dragging from outputs</p>
              <p>3. Configure each node by clicking it</p>
            </div>
            <button
              className="btn-primary h-9 text-sm flex items-center gap-1.5 mx-auto"
              onClick={() => addNode('start', { x: 250, y: 100 })}
            >
              <Plus size={14} /> Add start node
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
