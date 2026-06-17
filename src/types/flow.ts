import type { Node, Edge, XYPosition } from 'reactflow'

export type FlowNodeType =
  | 'start'
  | 'message'
  | 'condition'
  | 'action'
  | 'ai'
  | 'delay'
  | 'end'
  | 'handoff'

export interface FlowNodeData {
  label: string
  nodeType: FlowNodeType
  config: Record<string, unknown>
  isValid?: boolean
  validationErrors?: string[]
}

export interface ConversationFlow {
  id: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'paused'
  trigger?: {
    type: string
    config: Record<string, unknown>
  }
  nodes: Node<FlowNodeData>[]
  edges: Edge[]
  stats: {
    totalTriggered: number
    completionRate: number
    avgSteps: number
  }
  createdAt: string
  updatedAt: string
}

export interface FlowPayload {
  name: string
  description?: string
  trigger?: ConversationFlow['trigger']
  nodes: Node<FlowNodeData>[]
  edges: Edge[]
}

export interface FlowState {
  nodes: Node<FlowNodeData>[]
  edges: Edge[]
  setNodes: (nodes: Node<FlowNodeData>[]) => void
  setEdges: (edges: Edge[]) => void
  selectedNodeId: string | null
  setSelectedNode: (id: string | null) => void
  flowId: string | null
  flowName: string
  flowStatus: 'draft' | 'active' | 'paused'
  setFlowName: (name: string) => void
  setFlowId: (id: string | null) => void
  setFlowStatus: (status: 'draft' | 'active' | 'paused') => void
  history: Array<{ nodes: Node<FlowNodeData>[]; edges: Edge[] }>
  historyIndex: number
  pushHistory: () => void
  undo: () => void
  redo: () => void
  isDirty: boolean
  setDirty: (dirty: boolean) => void
  addNode: (type: FlowNodeType, position: XYPosition) => void
  deleteNode: (id: string) => void
  duplicateNode: (id: string) => void
  updateNodeData: (id: string, data: Partial<FlowNodeData>) => void
}
