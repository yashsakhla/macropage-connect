import { ChevronLeft, RotateCcw, RotateCw, ZoomOut, ZoomIn, Maximize2, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFlowStore } from '@/store/flowStore'

interface Props {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFit: () => void
  onBack: () => void
  onTestFlow: () => void
  onSaveDraft: () => void
  onPublish: () => void
  isSaving?: boolean
  lastSaved?: string
}

export default function FlowToolbar({
  zoom, onZoomIn, onZoomOut, onFit, onBack,
  onTestFlow, onSaveDraft, onPublish, isSaving, lastSaved,
}: Props) {
  const { flowName, setFlowName, flowStatus, isDirty, undo, redo } = useFlowStore()

  const STATUS_COLORS = { draft: 'badge-gray', active: 'badge-green', paused: 'badge-yellow' }

  return (
    <div className="h-13 bg-white border-b border-[#e8ebe8] flex items-center px-4 gap-3 relative z-20 flex-shrink-0" style={{ height: 52 }}>
      {/* Left */}
      <button onClick={onBack} className="btn-ghost h-8 text-sm flex items-center gap-1">
        <ChevronLeft size={15} /> Back
      </button>
      <div className="h-6 w-px bg-[#e8ebe8]" />
      <input
        className="border-0 text-sm font-semibold text-gray-900 bg-transparent focus:outline-none focus:border-b-2 focus:border-[#1a5c3a] w-48 pb-0.5"
        value={flowName}
        onChange={(e) => setFlowName(e.target.value)}
      />
      <span className={cn('badge text-2xs', STATUS_COLORS[flowStatus])}>{flowStatus}</span>
      <span className="text-xs text-gray-400 hidden sm:block">
        {isSaving ? 'Saving...' : isDirty ? 'Unsaved changes' : lastSaved ? `Last saved: ${lastSaved}` : ''}
      </span>

      {/* Center */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
        <button onClick={undo} className="btn-ghost w-8 h-8 rounded-lg flex items-center justify-center" title="Undo (Ctrl+Z)">
          <RotateCcw size={14} />
        </button>
        <button onClick={redo} className="btn-ghost w-8 h-8 rounded-lg flex items-center justify-center" title="Redo">
          <RotateCw size={14} />
        </button>
        <div className="h-5 w-px bg-[#e8ebe8] mx-1" />
        <button onClick={onZoomOut} className="btn-ghost w-8 h-8 rounded-lg flex items-center justify-center">
          <ZoomOut size={14} />
        </button>
        <span className="text-xs text-gray-500 w-11 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="btn-ghost w-8 h-8 rounded-lg flex items-center justify-center">
          <ZoomIn size={14} />
        </button>
        <button onClick={onFit} className="btn-ghost w-8 h-8 rounded-lg flex items-center justify-center" title="Fit to screen">
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-2">
        <button onClick={onTestFlow} className="btn-outline h-8 text-sm flex items-center gap-1.5">
          <Play size={12} /> Test flow
        </button>
        <button onClick={onSaveDraft} className="btn-outline h-8 text-sm" disabled={isSaving}>Save draft</button>
        <button onClick={onPublish} className="btn-primary h-8 text-sm">Publish flow</button>
      </div>
    </div>
  )
}
