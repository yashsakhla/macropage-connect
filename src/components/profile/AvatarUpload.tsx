import { useRef } from 'react'
import { Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { UPLOAD_LIMITS } from '@/hooks/useUpload'
import avatarMen from '@assets/avatar-men.webp'
import avatarWomen from '@assets/avatar-women.png'

interface Props {
  name?: string
  avatarUrl?: string
  gender?: 'male' | 'female' | 'other'
  size?: 'md' | 'lg'
  onUpload: (file: File) => void
  onRemove?: () => void
}

export default function AvatarUpload({ name, avatarUrl, gender, size = 'md', onUpload, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dim = size === 'lg' ? 'w-24 h-24' : 'w-20 h-20'

  const defaultAvatar = gender === 'female' ? avatarWomen : avatarMen

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > UPLOAD_LIMITS.image.maxBytes) {
      toast.error(`Image is too large — ${UPLOAD_LIMITS.image.label}`)
      return
    }
    onUpload(file)
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative group flex-shrink-0">
        <div className={cn(dim, 'rounded-2xl border-4 border-white shadow-md overflow-hidden bg-[#1a3d2b] flex items-center justify-center')}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <img src={defaultAvatar} alt={name ?? 'avatar'} className="w-full h-full object-cover" />
          )}
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <Camera size={16} className="text-white" />
        </button>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFile} />
      </div>
      <div>
        <button onClick={() => inputRef.current?.click()} className="btn-outline h-9 text-sm">Upload photo</button>
        {avatarUrl && onRemove && (
          <button onClick={onRemove} className="btn-ghost text-sm text-red-500 ml-2 h-9">Remove</button>
        )}
        <p className="text-xs text-gray-400 mt-1.5">Recommended: 400×400px PNG or JPG · {UPLOAD_LIMITS.image.label}</p>
      </div>
    </div>
  )
}
