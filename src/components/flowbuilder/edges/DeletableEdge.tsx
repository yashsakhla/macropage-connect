import { useState } from 'react'
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from 'reactflow'
import { X } from 'lucide-react'
import { useFlowStore } from '@/store/flowStore'

export default function DeletableEdge({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  style, markerEnd, label, labelStyle, labelBgStyle, labelBgPadding, labelBgBorderRadius,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false)
  const { edges, setEdges, pushHistory } = useFlowStore()

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  })

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    pushHistory()
    setEdges(edges.filter((edge) => edge.id !== id))
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        labelX={labelX}
        labelY={labelY}
        style={style}
        markerEnd={markerEnd}
        label={label}
        labelStyle={labelStyle}
        labelBgStyle={labelBgStyle}
        labelBgPadding={labelBgPadding}
        labelBgBorderRadius={labelBgBorderRadius}
      />
      {/* wide invisible path so hover doesn't require pixel-perfect precision */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      />
      <EdgeLabelRenderer>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + (label ? 16 : 0)}px)`,
            pointerEvents: 'all',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
          className="nodrag nopan"
        >
          <button
            onClick={handleDelete}
            title="Remove connection"
            className="w-4 h-4 rounded-full bg-white dark:bg-[#0b1220] border border-red-200 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center shadow-sm"
          >
            <X size={9} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
