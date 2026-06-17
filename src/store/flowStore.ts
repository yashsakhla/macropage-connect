import { create } from 'zustand'
import type { Node, XYPosition } from 'reactflow'
import type { FlowNodeData, FlowNodeType, FlowState } from '@/types/flow'

let nodeIdCounter = 100

function generateNodeId(): string {
  return `node-${++nodeIdCounter}-${Date.now()}`
}

function getDefaultNodeData(type: FlowNodeType): FlowNodeData {
  const defaults: Record<FlowNodeType, FlowNodeData> = {
    start: { label: 'Flow starts', nodeType: 'start', config: {}, isValid: true },
    message: { label: 'Send message', nodeType: 'message', config: { messageType: 'text', text: '' }, isValid: false },
    condition: { label: 'Condition', nodeType: 'condition', config: { type: 'message_contains', value: '' }, isValid: false },
    action: { label: 'Action', nodeType: 'action', config: { type: 'assign_agent' }, isValid: false },
    ai: { label: 'AI Response', nodeType: 'ai', config: { provider: 'openai', model: 'gpt-4o', instruction: '', confidenceThreshold: 70 }, isValid: false },
    delay: { label: 'Wait', nodeType: 'delay', config: { duration: 5, unit: 'minutes' }, isValid: true },
    end: { label: 'End flow', nodeType: 'end', config: {}, isValid: true },
    handoff: { label: 'Handoff to agent', nodeType: 'handoff', config: { strategy: 'round_robin' }, isValid: true },
  }
  return defaults[type]
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  flowId: null,
  flowName: 'Untitled flow',
  flowStatus: 'draft',
  history: [],
  historyIndex: -1,
  isDirty: false,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setFlowName: (name) => set({ flowName: name, isDirty: true }),
  setFlowId: (id) => set({ flowId: id }),
  setFlowStatus: (status) => set({ flowStatus: status }),
  setDirty: (dirty) => set({ isDirty: dirty }),

  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get()
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) })
    set({ history: newHistory.slice(-50), historyIndex: newHistory.length - 1 })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const prev = history[historyIndex - 1]
    set({ nodes: prev.nodes, edges: prev.edges, historyIndex: historyIndex - 1, isDirty: true })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const next = history[historyIndex + 1]
    set({ nodes: next.nodes, edges: next.edges, historyIndex: historyIndex + 1, isDirty: true })
  },

  addNode: (type: FlowNodeType, position: XYPosition) => {
    const { nodes, pushHistory } = get()
    pushHistory()
    const id = generateNodeId()
    const newNode: Node<FlowNodeData> = {
      id,
      type,
      position,
      data: getDefaultNodeData(type),
    }
    set({ nodes: [...nodes, newNode], isDirty: true })
  },

  deleteNode: (id: string) => {
    const { nodes, edges, pushHistory } = get()
    pushHistory()
    set({
      nodes: nodes.filter((n) => n.id !== id),
      edges: edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: null,
      isDirty: true,
    })
  },

  duplicateNode: (id: string) => {
    const { nodes, pushHistory } = get()
    const node = nodes.find((n) => n.id === id)
    if (!node) return
    pushHistory()
    const newId = generateNodeId()
    const newNode: Node<FlowNodeData> = {
      ...node,
      id: newId,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      selected: false,
    }
    set({ nodes: [...nodes, newNode], isDirty: true })
  },

  updateNodeData: (id: string, data: Partial<FlowNodeData>) => {
    const { nodes } = get()
    set({
      nodes: nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
      isDirty: true,
    })
  },
}))
