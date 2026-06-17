import { useState } from 'react'
import { Plus, FileText, HelpCircle, Globe, MoreVertical, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { useKnowledgeBase, useToggleKnowledgeItem, useDeleteKnowledgeItem, useAddKnowledgeItem } from '@/hooks/useAIBot'
import KnowledgeDocUpload from './KnowledgeDocUpload'
import type { KBItem } from '@/types/automation'

const TYPE_META: Record<KBItem['type'], { icon: React.ElementType; bg: string; color: string }> = {
  document: { icon: FileText, bg: 'bg-red-50', color: 'text-red-500' },
  faq: { icon: HelpCircle, bg: 'bg-[#e8f5ee]', color: 'text-[#1a5c3a]' },
  url: { icon: Globe, bg: 'bg-purple-50', color: 'text-purple-600' },
}

type KBTab = 'all' | 'document' | 'faq' | 'url'

export default function KnowledgeBase() {
  const { data: items = [] } = useKnowledgeBase()
  const toggleItem = useToggleKnowledgeItem()
  const deleteItem = useDeleteKnowledgeItem()
  const addItem = useAddKnowledgeItem()
  const [activeTab, setActiveTab] = useState<KBTab>('all')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showFAQForm, setShowFAQForm] = useState(false)
  const [faqQ, setFaqQ] = useState('')
  const [faqA, setFaqA] = useState('')

  const kbItems = items as KBItem[]
  const filtered = activeTab === 'all' ? kbItems : kbItems.filter((i) => i.type === activeTab)

  const docs = kbItems.filter((i) => i.type === 'document').length
  const faqs = kbItems.filter((i) => i.type === 'faq').length
  const lastUpdated = kbItems.reduce((acc, i) => (i.createdAt > acc ? i.createdAt : acc), '')

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-gray-900">Knowledge Base</p>
          <p className="text-xs text-gray-500 mt-0.5">Add documents and FAQs for AI to reference</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowAddMenu(!showAddMenu)} className="btn-primary h-9 text-sm flex items-center gap-1.5">
            <Plus size={13} /> Add content <ChevronDown size={12} />
          </button>
          {showAddMenu && (
            <div className="absolute right-0 top-11 bg-white border border-[#e8ebe8] rounded-xl shadow-lg z-20 py-1 min-w-48">
              {[
                { label: 'Upload document (PDF/DOC/TXT)', action: () => { setShowUpload(true); setShowAddMenu(false) } },
                { label: 'Add FAQ manually', action: () => { setShowFAQForm(true); setShowAddMenu(false) } },
                { label: 'Import from URL', action: () => setShowAddMenu(false) },
                { label: 'Connect Google Docs (soon)', action: () => setShowAddMenu(false), disabled: true },
              ].map(({ label, action, disabled }) => (
                <button key={label} onClick={action} disabled={disabled} className={cn('w-full text-left px-4 py-2 text-xs hover:bg-[#f7f8f6]', disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700')}>{label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 text-xs text-gray-500 mb-4">
        <span><strong className="text-gray-800">{docs}</strong> documents</span>
        <span><strong className="text-gray-800">{faqs}</strong> FAQs</span>
        {lastUpdated && <span>Last updated: {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}</span>}
      </div>

      <div className="flex gap-1 bg-[#f7f8f6] rounded-xl p-1 mb-4 w-fit">
        {(['all', 'document', 'faq', 'url'] as KBTab[]).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={cn('px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all', activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {t === 'all' ? 'All' : t === 'document' ? 'Documents' : t === 'faq' ? 'FAQs' : 'URLs'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No items yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const { icon: Icon, bg, color } = TYPE_META[item.type]
            return (
              <div key={item.id} className="border border-[#e8ebe8] rounded-xl p-4 flex items-start gap-4 hover:border-[#c8e6d4] transition-all bg-white">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
                  <Icon size={16} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  {item.content && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.content}</p>}
                  <div className="flex gap-4 mt-2">
                    {item.charCount && <span className="text-2xs text-gray-400">{item.charCount.toLocaleString()} chars</span>}
                    <span className="text-2xs text-gray-400">Added {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {item.status === 'processing' && (
                      <><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /><span className="text-2xs text-amber-600">Processing...</span></>
                    )}
                    {item.status === 'ready' && (
                      <><span className="w-1.5 h-1.5 rounded-full bg-green-500" /><span className="text-2xs text-green-600">Active</span></>
                    )}
                    {item.status === 'error' && (
                      <><span className="w-1.5 h-1.5 rounded-full bg-red-500" /><span className="text-2xs text-red-500">Processing failed</span></>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleItem.mutate({ id: item.id, enabled: !item.isEnabled })}
                    className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors', item.isEnabled ? 'bg-[#1a5c3a]' : 'bg-gray-200')}
                  >
                    <span className={cn('inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform mt-0.5', item.isEnabled ? 'translate-x-4.5' : 'translate-x-0.5')} />
                  </button>
                  <div className="relative">
                    <button onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f7f8f6]">
                      <MoreVertical size={13} className="text-gray-400" />
                    </button>
                    {menuOpen === item.id && (
                      <div className="absolute right-0 top-8 bg-white border border-[#e8ebe8] rounded-xl shadow-lg z-20 py-1 min-w-28">
                        {[
                          { label: 'View', action: () => setMenuOpen(null) },
                          { label: 'Edit', action: () => setMenuOpen(null) },
                          { label: 'Re-process', action: () => setMenuOpen(null) },
                          { label: 'Delete', action: () => { deleteItem.mutate(item.id); setMenuOpen(null) }, danger: true },
                        ].map(({ label, action, danger }) => (
                          <button key={label} onClick={action} className={cn('w-full text-left px-3 py-1.5 text-xs hover:bg-[#f7f8f6]', danger ? 'text-red-500' : 'text-gray-700')}>{label}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showUpload && <KnowledgeDocUpload onClose={() => setShowUpload(false)} />}

      {showFAQForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <p className="text-base font-bold text-gray-900">Add FAQ</p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Question</label>
              <input className="input w-full h-9 text-sm" placeholder="What question does the customer ask?" value={faqQ} onChange={(e) => setFaqQ(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Answer</label>
              <textarea className="input w-full text-sm min-h-24 resize-none" placeholder="How should the AI respond?" value={faqA} onChange={(e) => setFaqA(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowFAQForm(false)} className="btn-ghost h-9 text-sm flex-1">Cancel</button>
              <button onClick={() => { addItem.mutate({ type: 'faq', title: faqQ, content: faqA }); setShowFAQForm(false); setFaqQ(''); setFaqA('') }} className="btn-primary h-9 text-sm flex-1" disabled={!faqQ.trim() || !faqA.trim()}>Save FAQ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
