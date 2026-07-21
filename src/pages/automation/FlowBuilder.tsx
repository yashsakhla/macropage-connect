import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ReactFlowProvider, useReactFlow } from 'reactflow'
import toast from 'react-hot-toast'
import FlowToolbar from '@/components/flowbuilder/FlowToolbar'
import FlowSidebar from '@/components/flowbuilder/FlowSidebar'
import FlowCanvas from '@/components/flowbuilder/FlowCanvas'
import NodePanel from '@/components/flowbuilder/NodePanel'
import FlowPreview from '@/components/flowbuilder/FlowPreview'
import { useFlowStore } from '@/store/flowStore'
import { useFlow, useSaveFlow, usePublishFlow } from '@/hooks/useFlows'
import type { FlowNodeType, FlowNodeData } from '@/types/flow'
import type { NodeMouseHandler } from 'reactflow'

function FlowBuilderInner() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const reactFlow = useReactFlow()

  const { nodes, edges, setNodes, setEdges, setFlowId, setFlowName, setFlowStatus, setDirty, isDirty, flowName } = useFlowStore()
  const { data: existingFlow } = useFlow(id)
  const saveFlow = useSaveFlow()
  const publishFlow = usePublishFlow()

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [lastSaved, setLastSaved] = useState<string>('')
  const [dragNodeType, setDragNodeType] = useState<FlowNodeType | null>(null)
  const [dragNodeLabel, setDragNodeLabel] = useState('')
  const [dragNodeConfig, setDragNodeConfig] = useState<Record<string, unknown> | undefined>(undefined)
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (existingFlow) {
      setFlowId(existingFlow.id)
      setFlowName(existingFlow.name)
      setFlowStatus(existingFlow.status)
      setNodes(existingFlow.nodes)
      setEdges(existingFlow.edges)
      setDirty(false)
    }
  }, [existingFlow, setFlowId, setFlowName, setFlowStatus, setNodes, setEdges, setDirty])

  // Auto-save every 30 seconds if dirty
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      if (isDirty) {
        handleSave(true)
      }
    }, 30000)
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current) }
  }, [isDirty, nodes, edges, flowName])

  function handleSave(silent = false) {
    saveFlow.mutate(
      { id: id !== 'new' ? id : undefined, data: { name: flowName, nodes, edges } },
      {
        onSuccess: (data) => {
          if (data?.data?.id && id === 'new') {
            navigate(`/automation/flows/${data.data.id}`, { replace: true })
            setFlowId(data.data.id)
          }
          setDirty(false)
          setLastSaved('just now')
          if (!silent) toast.success('Flow saved')
        },
      }
    )
  }

  function validateAndPublish() {
    const hasStart = nodes.some((n) => (n.data as FlowNodeData).nodeType === 'start')
    const hasEnd = nodes.some((n) => ['end', 'handoff'].includes((n.data as FlowNodeData).nodeType))
    const hasMessage = nodes.some((n) => (n.data as FlowNodeData).nodeType === 'message')

    if (!hasStart) { toast.error('Flow must have a Start node'); return }
    if (!hasMessage) { toast.error('Flow must have at least one Message node'); return }
    if (!hasEnd) { toast.error('Flow must have an End or Handoff node'); return }

    if (id && id !== 'new' && !isDirty) {
      publishFlow.mutate(id)
      return
    }

    saveFlow.mutate(
      { id: id !== 'new' ? id : undefined, data: { name: flowName, nodes, edges } },
      {
        onSuccess: (data) => {
          const savedId = data?.data?.id ?? id
          if (savedId && id === 'new') {
            navigate(`/automation/flows/${savedId}`, { replace: true })
            setFlowId(savedId)
          }
          setDirty(false)
          setLastSaved('just now')
          if (savedId) publishFlow.mutate(savedId)
        },
      }
    )
  }

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNodeId(node.id)
    setShowPreview(false)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  function handleBack() {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Leave without saving?')) {
        navigate('/automation')
      }
    } else {
      navigate('/automation')
    }
  }

  function handleDragStart(type: FlowNodeType, label: string, config: Record<string, unknown> | undefined, event: React.DragEvent) {
    event.dataTransfer.setData('application/reactflow-type', type)
    event.dataTransfer.setData('application/reactflow-label', label)
    if (config) event.dataTransfer.setData('application/reactflow-config', JSON.stringify(config))
    event.dataTransfer.effectAllowed = 'move'
    setDragNodeType(type)
    setDragNodeLabel(label)
    setDragNodeConfig(config)
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#f7f8f6' }}>
      <FlowToolbar
        zoom={reactFlow.getZoom()}
        onZoomIn={() => reactFlow.zoomIn()}
        onZoomOut={() => reactFlow.zoomOut()}
        onFit={() => reactFlow.fitView({ padding: 0.1 })}
        onBack={handleBack}
        onTestFlow={() => { setShowPreview(true); setSelectedNodeId(null) }}
        onSaveDraft={() => handleSave(false)}
        onPublish={validateAndPublish}
        isSaving={saveFlow.isPending}
        lastSaved={lastSaved}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <FlowSidebar onDragStart={handleDragStart} />

        <div className="flex-1 relative overflow-hidden">
          <FlowCanvas
            dragNodeType={dragNodeType}
            dragNodeLabel={dragNodeLabel}
            dragNodeConfig={dragNodeConfig}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
          />
        </div>

        {selectedNodeId && !showPreview && (
          <NodePanel nodeId={selectedNodeId} onClose={() => setSelectedNodeId(null)} />
        )}

        {showPreview && (
          <FlowPreview onClose={() => setShowPreview(false)} />
        )}
      </div>
    </div>
  )
}

export default function FlowBuilder() {
  return (
    <ReactFlowProvider>
      <FlowBuilderInner />
    </ReactFlowProvider>
  )
}
