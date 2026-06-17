import { useEffect, useState } from 'react'
import { MessageCircle, X, Search, MessageSquare, FileText, PlayCircle, Ticket, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const QUICK_LINKS = [
  { slug: 'getting-started', title: 'Getting started with Macropage Connect' },
  { slug: 'connect-whatsapp', title: 'How to connect your WhatsApp number' },
  { slug: 'create-campaign', title: 'Creating your first campaign' },
]

export default function HelpWidget() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const firstName = user?.name?.split(' ')[0] ?? 'there'

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const topArticles = QUICK_LINKS

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!search.trim()) return
    setOpen(false)
    navigate(`/help?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Widget panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-[#e8ebe8] overflow-hidden"
          style={{
            animation: 'widgetOpen 150ms ease-out',
            transformOrigin: 'bottom right',
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a3d2b] to-[#1a5c3a] px-4 py-4 relative">
            <p className="text-sm font-semibold text-white">Hi {firstName}! 👋</p>
            <p className="text-xs text-white/70 mt-0.5">How can we help you today?</p>
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-white/60 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="px-4 py-3 border-b border-[#f5f5f5]">
            <div className="bg-[#f7f8f6] rounded-xl h-9 flex items-center gap-2 px-3">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for help..."
                className="flex-1 bg-transparent text-xs text-gray-700 placeholder:text-gray-400 outline-none"
              />
            </div>
          </form>

          {/* Quick options */}
          <div className="px-4 py-3 space-y-1">
            <button
              onClick={() => { setOpen(false); /* open live chat */ }}
              className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl hover:bg-[#f7f8f6] cursor-pointer transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-[#e8f5ee] flex items-center justify-center flex-shrink-0">
                <MessageSquare size={14} className="text-[#1a5c3a]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">Chat with support</p>
                <p className="text-[0.625rem] text-gray-400 flex items-center gap-1">
                  Available now <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                </p>
              </div>
              <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
            </button>

            <button
              onClick={() => { setOpen(false); navigate('/help') }}
              className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl hover:bg-[#f7f8f6] cursor-pointer transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-blue-600" />
              </div>
              <p className="text-sm text-gray-700 flex-1">Browse help articles</p>
              <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
            </button>

            <button
              onClick={() => { setOpen(false); navigate('/help#videos') }}
              className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl hover:bg-[#f7f8f6] cursor-pointer transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <PlayCircle size={14} className="text-purple-600" />
              </div>
              <p className="text-sm text-gray-700 flex-1">Watch tutorials</p>
              <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
            </button>

            <button
              onClick={() => { setOpen(false); navigate('/help?ticket=1') }}
              className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl hover:bg-[#f7f8f6] cursor-pointer transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Ticket size={14} className="text-amber-600" />
              </div>
              <p className="text-sm text-gray-700 flex-1">Submit a ticket</p>
              <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
            </button>
          </div>

          {/* Popular articles */}
          <div className="border-t border-[#f5f5f5] px-4 py-3">
            <p className="text-[0.625rem] text-gray-400 uppercase tracking-wide mb-2">Popular articles</p>
            {topArticles.map(a => (
              <button
                key={a.slug}
                onClick={() => { setOpen(false); navigate(`/help/articles/${a.slug}`) }}
                className="flex items-center gap-1 text-xs text-[#1a5c3a] py-1.5 hover:underline w-full text-left"
              >
                <ChevronRight size={10} className="flex-shrink-0" />
                {a.title}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-[#f5f5f5] px-4 py-3 text-center">
            <p className="text-[0.625rem] text-gray-400">Powered by Macropage Support</p>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#1a5c3a] rounded-full shadow-lg hover:shadow-xl flex items-center justify-center hover:bg-[#2d7a4f] transition-all hover:scale-110 active:scale-95"
      >
        {open ? (
          <X size={24} className="text-white" />
        ) : (
          <MessageCircle size={24} className="text-white" />
        )}
      </button>

      <style>{`
        @keyframes widgetOpen {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}
