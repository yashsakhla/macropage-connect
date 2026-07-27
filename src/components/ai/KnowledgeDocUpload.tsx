import { useState, useRef } from 'react'
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAddKnowledgeItem } from '@/hooks/useAIBot'
import { uploadDocument, UPLOAD_LIMITS } from '@/hooks/useUpload'

interface UploadFile {
  file: File
  status: 'pending' | 'uploading' | 'done' | 'error'
  progress: number
  error?: string
}

interface Props {
  onClose: () => void
}

export default function KnowledgeDocUpload({ onClose }: Props) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const addItem = useAddKnowledgeItem()

  function addFiles(newFiles: File[]) {
    const tooBig = newFiles.filter((f) => f.size > UPLOAD_LIMITS.document.maxBytes)
    if (tooBig.length > 0) {
      toast.error(`${tooBig.length > 1 ? 'Some files are' : 'That file is'} too large — ${UPLOAD_LIMITS.document.label}`)
    }
    const valid = newFiles.filter((f) => f.size <= UPLOAD_LIMITS.document.maxBytes && /\.(pdf|docx?|txt|md)$/i.test(f.name))
    setFiles((p) => [...p, ...valid.map((file) => ({ file, status: 'pending' as const, progress: 0 }))])
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  function removeFile(i: number) {
    setFiles((p) => p.filter((_, idx) => idx !== i))
  }

  function updateFile(i: number, patch: Partial<UploadFile>) {
    setFiles((p) => p.map((f, idx) => idx === i ? { ...f, ...patch } : f))
  }

  async function handleUpload() {
    const pendingIndexes = files.map((f, i) => f.status === 'pending' ? i : -1).filter((i) => i !== -1)

    await Promise.all(pendingIndexes.map(async (i) => {
      const f = files[i]
      updateFile(i, { status: 'uploading', progress: 0 })
      try {
        const { url } = await uploadDocument(f.file, (percent) => updateFile(i, { progress: percent }))
        await addItem.mutateAsync({ type: 'document', title: f.file.name, fileUrl: url })
        updateFile(i, { status: 'done', progress: 100 })
      } catch {
        updateFile(i, { status: 'error', error: 'Upload failed' })
      }
    }))

    const stillFailing = files.some((f) => f.status === 'error')
    if (!stillFailing) setTimeout(onClose, 1000)
  }

  const isUploading = files.some((f) => f.status === 'uploading')
  const hasPending = files.some((f) => f.status === 'pending')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8ebe8]">
          <h3 className="text-base font-bold text-gray-900">Upload documents</h3>
          <button onClick={onClose}><X size={16} className="text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragging ? 'border-[#1a5c3a] bg-[#e8f5ee]' : 'border-[#e8ebe8] hover:border-[#c8e6d4]'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Drop files here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT, MD · {UPLOAD_LIMITS.document.label} per file</p>
            <input ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.md" className="hidden" onChange={(e) => { addFiles(Array.from(e.target.files ?? [])); e.target.value = '' }} />
          </div>

          {files.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 border border-[#e8ebe8] rounded-xl p-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{f.file.name}</p>
                    <p className="text-2xs text-gray-400">
                      {(f.file.size / 1024).toFixed(0)} KB
                      {f.status === 'error' && <span className="text-red-500"> · {f.error}</span>}
                    </p>
                    {f.status === 'uploading' && (
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div className="bg-[#1a5c3a] h-1 rounded-full transition-all" style={{ width: `${f.progress}%` }} />
                      </div>
                    )}
                  </div>
                  {f.status === 'done' && <CheckCircle size={14} className="text-green-500 flex-shrink-0" />}
                  {f.status === 'error' && <AlertCircle size={14} className="text-red-500 flex-shrink-0" />}
                  {f.status === 'pending' && <button onClick={() => removeFile(i)}><X size={12} className="text-gray-400 hover:text-red-500" /></button>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e8ebe8]">
          <button onClick={onClose} className="btn-ghost h-9 text-sm">Cancel</button>
          <button
            onClick={handleUpload}
            className="btn-primary h-9 text-sm"
            disabled={files.length === 0 || !hasPending || isUploading}
          >
            {isUploading ? 'Uploading...' : `Upload ${files.length > 0 ? `(${files.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
