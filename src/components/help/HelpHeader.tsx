import { Headphones } from 'lucide-react'
import SearchBar from './SearchBar'

interface Props {
  onSearch: (query: string) => void
  initialQuery?: string
}

export default function HelpHeader({ onSearch, initialQuery }: Props) {
  return (
    <div className="relative bg-gradient-to-br from-[#1a3d2b] via-[#1a5c3a] to-[#2d7a4f] py-16 px-6 text-center">
      {/* Decorative layer — overflow-hidden lives here so the search dropdown is never clipped */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)
            `,
          }}
        />
        <div className="w-96 h-96 rounded-full border border-white/5 absolute -top-20 -right-20" />
        <div className="w-64 h-64 rounded-full border border-white/5 absolute -bottom-10 -left-10" />
      </div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Headphones className="w-5 h-5 text-white/60" />
          <span className="text-sm text-white/60 font-medium">Help &amp; Support</span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight">
          How can we help you?
        </h1>

        <p className="text-base text-white/70 mt-3 max-w-lg mx-auto">
          Search our documentation, watch tutorials, or get in touch with our team
        </p>

        <SearchBar onSearch={onSearch} initialQuery={initialQuery} />
      </div>
    </div>
  )
}
