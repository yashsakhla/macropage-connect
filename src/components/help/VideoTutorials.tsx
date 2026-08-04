import { useState } from 'react'
import { PlayCircle, ChevronRight, Film } from 'lucide-react'
import { cn, getYouTubeThumbnail } from '@/lib/utils'
import { useVideoTutorials } from '@/hooks/useHelp'

export default function VideoTutorials() {
  const [isOpen, setIsOpen] = useState(true)
  const { data: videos = [], isLoading } = useVideoTutorials()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-10">
      <div className="flex items-center mb-6 gap-2">
        <button
          onClick={() => setIsOpen(v => !v)}
          className="flex items-center gap-2 group"
          aria-expanded={isOpen}
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Video tutorials</h2>
          <ChevronRight
            size={18}
            className={cn('text-gray-400 dark:text-gray-500 group-hover:text-[#1a5c3a] dark:group-hover:text-emerald-400 transition-transform', isOpen && 'rotate-90')}
          />
        </button>
      </div>

      {isOpen && (
        isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-shrink-0 w-64 h-36 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500 bg-white dark:bg-[#0b1220] border border-dashed border-[#e8ebe8] dark:border-white/10 rounded-2xl">
            <Film size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No video tutorials yet</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            {videos.map(v => {
              const thumbnail = getYouTubeThumbnail(v.videoUrl)
              return (
                <a
                  key={v.id}
                  href={v.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-64 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden hover:border-[#c8e6d4] hover:shadow-sm transition-all cursor-pointer block group"
                >
                  {/* Thumbnail */}
                  <div className="h-36 bg-gray-900 relative flex items-center justify-center overflow-hidden">
                    {thumbnail ? (
                      <img src={thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1a3d2b] to-[#2d7a4f]" />
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors" />
                    <div className="relative w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <PlayCircle size={24} className="text-[#1a5c3a]" />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">{v.title}</p>
                  </div>
                </a>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
