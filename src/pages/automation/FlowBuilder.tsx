import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ReactFlowProvider, useReactFlow } from 'reactflow'
import toast from 'react-hot-toast'
import { Monitor } from 'lucide-react'
import FlowToolbar from '@/components/flowbuilder/FlowToolbar'
import FlowSidebar from '@/components/flowbuilder/FlowSidebar'
import FlowCanvas from '@/components/flowbuilder/FlowCanvas'
import NodePanel from '@/components/flowbuilder/NodePanel'
import FlowPreview from '@/components/flowbuilder/FlowPreview'
import { useFlowStore } from '@/store/flowStore'
import { useFlow, useSaveFlow, usePublishFlow } from '@/hooks/useFlows'
import type { FlowNodeType, FlowNodeData } from '@/types/flow'
import type { NodeMouseHandler } from 'reactflow'

// The flow builder is a drag-and-drop canvas — genuinely unusable on a phone
// (no room for the sidebar + canvas + node panel, and touch drag-and-drop is
// unreliable). Rather than trying to cram the canvas UI onto a small screen,
// nudge mobile users toward desktop, but let them continue if they insist.
function DesktopRecommendedOverlay({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="md:hidden fixed inset-0 z-[70] bg-[#0f1724] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
        <Monitor size={28} className="text-white" />
      </div>
      <h2 className="text-lg font-bold text-white">Best experienced on desktop</h2>
      <p className="text-sm text-white/60 mt-2 max-w-xs leading-relaxed">
        The Flow Builder is a drag-and-drop canvas designed for a larger screen. For the best experience, please open this page on a desktop or laptop.
      </p>
      <button
        onClick={onContinue}
        className="mt-6 h-10 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
      >
        Continue anyway
      </button>
    </div>
  )
}

function FlowBuilderInner() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const reactFlow = useReactFlow()

  const { nodes, edges, setNodes, setEdges, setFlowId, setFlowName, setFlowStatus, setDirty, isDirty, flowName, flowStatus } = useFlowStore()
  const { data: existingFlow } = useFlow(id)
  const saveFlow = useSaveFlow()
  const publishFlow = usePublishFlow()
  const isReadOnly = flowStatus === 'active'

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [dismissedMobileNotice, setDismissedMobileNotice] = useState(false)
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
      if (isDirty && !isReadOnly) {
        handleSave(true)
      }
    }, 30000)
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current) }
  }, [isDirty, nodes, edges, flowName, isReadOnly])

  function handleSave(silent = false) {
    if (isReadOnly) return
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
    if (isReadOnly) return
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
    if (isReadOnly) return
    setSelectedNodeId(node.id)
    setShowPreview(false)
  }, [isReadOnly])

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
    if (isReadOnly) { event.preventDefault(); return }
    event.dataTransfer.setData('application/reactflow-type', type)
    event.dataTransfer.setData('application/reactflow-label', label)
    if (config) event.dataTransfer.setData('application/reactflow-config', JSON.stringify(config))
    event.dataTransfer.effectAllowed = 'move'
    setDragNodeType(type)
    setDragNodeLabel(label)
    setDragNodeConfig(config)
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#f7f8f6] dark:bg-[#0f1724]">
      {!dismissedMobileNotice && (
        <DesktopRecommendedOverlay onContinue={() => setDismissedMobileNotice(true)} />
      )}

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
        readOnly={isReadOnly}
      />

      {isReadOnly && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/40 px-4 py-2 text-xs text-amber-700 dark:text-amber-400 flex-shrink-0">
          This flow is active and running for contacts, so it's read-only. Pause it from the automation list to make changes.
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <FlowSidebar onDragStart={handleDragStart} readOnly={isReadOnly} />

        <div className="flex-1 relative overflow-hidden">
          <FlowCanvas
            dragNodeType={dragNodeType}
            dragNodeLabel={dragNodeLabel}
            dragNodeConfig={dragNodeConfig}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            readOnly={isReadOnly}
          />
        </div>

        {selectedNodeId && !showPreview && !isReadOnly && (
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
