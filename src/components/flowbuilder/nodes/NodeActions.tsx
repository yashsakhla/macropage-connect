import { NodeToolbar, Position } from 'reactflow'
import { Trash2, Copy } from 'lucide-react'
import { useFlowStore } from '@/store/flowStore'

interface Props {
  nodeId: string
  selected?: boolean
}

export default function NodeActions({ nodeId, selected }: Props) {
  const { deleteNode, duplicateNode } = useFlowStore()

  return (
    <NodeToolbar isVisible={selected} position={Position.Top} offset={8}>
      <div className="flex items-center gap-0.5 bg-white rounded-lg shadow-lg border border-[#e8ebe8] p-1 nodrag">
        <button
          onClick={() => duplicateNode(nodeId)}
          title="Duplicate node"
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#f7f8f6] text-gray-500"
        >
          <Copy size={12} />
        </button>
        <button
          onClick={() => deleteNode(nodeId)}
          title="Delete node"
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-red-500"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </NodeToolbar>
  )
}
