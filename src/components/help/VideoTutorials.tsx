import { PlayCircle, Eye } from 'lucide-react'
import type { VideoTutorial } from '@/types'

const GRADIENTS: Record<string, string> = {
  'Getting Started': 'from-[#1a3d2b] to-[#2d7a4f]',
  WhatsApp: 'from-[#0d4f3f] to-[#0d9488]',
  Campaigns: 'from-[#4a1d96] to-[#7c3aed]',
  Automation: 'from-[#1e3a5f] to-[#2563eb]',
  AI: 'from-[#2d1b69] to-[#7c3aed]',
  Analytics: 'from-[#7c2d12] to-[#ea580c]',
}

function formatViews(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

interface Props {
  videos?: VideoTutorial[]
}

export default function VideoTutorials({ videos = [] }: Props) {

  return (
    <div className="max-w-5xl mx-auto px-6 mb-10">
      <div className="flex items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Video tutorials</h2>
        <button className="text-sm text-[#1a5c3a] font-medium ml-auto hover:underline">
          View all videos →
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
        {videos.map(v => (
          <a
            key={v.id}
            href={v.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-64 bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden hover:border-[#c8e6d4] hover:shadow-sm transition-all cursor-pointer block"
          >
            {/* Thumbnail */}
            <div className={`h-36 bg-gradient-to-br ${GRADIENTS[v.category] ?? 'from-gray-700 to-gray-900'} relative flex items-center justify-center`}>
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <PlayCircle size={24} className="text-[#1a5c3a]" />
              </div>
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[0.625rem] rounded-lg px-2 py-0.5 font-mono">
                {v.duration}
              </span>
              <span className="absolute top-2 left-2 bg-white/90 text-gray-700 text-[0.625rem] rounded-lg px-2 py-1 font-medium">
                {v.category}
              </span>
            </div>

            {/* Body */}
            <div className="p-4">
              <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{v.title}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[0.625rem] text-gray-400 flex items-center gap-1">
                  <Eye size={11} />
                  {formatViews(v.views)} views
                </span>
                <span className="text-[0.625rem] text-gray-400">
                  {new Date(v.publishedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
