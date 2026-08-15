import { useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

export default function ImageLightbox() {
  const { lightboxImage, closeLightbox } = useUIStore()

  useEffect(() => {
    if (!lightboxImage) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [lightboxImage, closeLightbox])

  if (!lightboxImage) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6"
      onClick={closeLightbox}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <a
          href={lightboxImage}
          download
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          title="Download"
        >
          <Download size={16} />
        </a>
        <button
          onClick={closeLightbox}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>
      <img
        src={lightboxImage}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full object-contain rounded-lg select-none"
      />
    </div>
  )
}
