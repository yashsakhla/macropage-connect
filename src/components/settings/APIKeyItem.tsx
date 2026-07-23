import { useState } from 'react'
import { Eye, EyeOff, Copy, MoreVertical, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import type { APIKey } from '@/types'

interface Props {
  apiKey: APIKey
  onRevoke: (id: string) => void
}

export default function APIKeyItem({ apiKey, onRevoke }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  function copy() {
    navigator.clipboard.writeText(apiKey.keyPreview)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  function reveal() {
    setRevealed(true)
    setTimeout(() => setRevealed(false), 10000)
  }

  return (
    <div className="px-5 py-4 border-b border-[#f5f5f5] last:border-0">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{apiKey.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Created {formatDistanceToNow(new Date(apiKey.createdAt), { addSuffix: true })}
            {apiKey.lastUsedAt && ` · Last used ${formatDistanceToNow(new Date(apiKey.lastUsedAt), { addSuffix: true })}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-2xs font-medium rounded-full px-2.5 py-0.5', apiKey.isActive ? 'bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a]' : 'bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400')}>
            {apiKey.isActive ? 'Active' : 'Expired'}
          </span>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="btn-ghost w-7 h-7 flex items-center justify-center rounded-lg">
              <MoreVertical size={14} className="text-gray-400 dark:text-gray-500" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl shadow-lg z-20 py-1 min-w-32">
                <button onClick={() => setMenuOpen(false)} className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-[#f7f8f6] dark:hover:bg-white/5">Edit</button>
                <button onClick={() => { onRevoke(apiKey.id); setMenuOpen(false) }} className="w-full text-left px-3 py-1.5 text-xs text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">Revoke</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-xl px-4 py-2.5 mt-3 flex items-center gap-3">
        <code className="font-mono text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
          {revealed ? apiKey.keyPreview.replace(/•+/, 'sk_live_xxxxxxxxxxxxxxxxxxxxxxx') : apiKey.keyPreview}
        </code>
        <button onClick={revealed ? () => setRevealed(false) : reveal} className="btn-ghost h-7 px-3 text-xs flex items-center gap-1.5 flex-shrink-0">
          {revealed ? <EyeOff size={12} /> : <Eye size={12} />}
          {revealed ? 'Hide' : 'Reveal'}
        </button>
        <button onClick={copy} className="btn-ghost h-7 px-3 text-xs flex items-center gap-1.5 flex-shrink-0">
          {copied ? <CheckCircle size={12} className="text-[#1a5c3a]" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {apiKey.permissions.map((p) => (
          <span key={p} className="bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] text-2xs rounded-full px-2.5 py-1">{p.replace(/_/g, ' ')}</span>
        ))}
      </div>

      <div className="flex gap-4 mt-2">
        <span className="text-2xs text-gray-400 dark:text-gray-500">{apiKey.requestsToday} requests today</span>
        {apiKey.lastUsedAt && (
          <span className="text-2xs text-gray-400 dark:text-gray-500">Last used {formatDistanceToNow(new Date(apiKey.lastUsedAt), { addSuffix: true })}</span>
        )}
      </div>
    </div>
  )
}
