import { useEffect, useState } from 'react'
import { Share2, Search, Globe, Info, MapPin, Mail, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WhatsAppProfilePreviewProps {
  displayName?: string
  category?: string
  description?: string
  website?: string
  email?: string
  address?: string
  logoFile?: File | null
  phone?: string
  isVerified?: boolean
  onRemoveLogo?: () => void
}

export default function WhatsAppProfilePreview({
  displayName,
  category,
  description,
  website,
  email,
  address,
  logoFile,
  phone,
  isVerified = false,
  onRemoveLogo,
}: WhatsAppProfilePreviewProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [lastChanged, setLastChanged] = useState<string | null>(null)

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null)
      return
    }
    const url = URL.createObjectURL(logoFile)
    setLogoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [logoFile])

  // live-change indicator
  useEffect(() => {
    if (displayName !== undefined) {
      setLastChanged('displayName')
      const t = setTimeout(() => setLastChanged(null), 800)
      return () => clearTimeout(t)
    }
    return
  }, [displayName])

  useEffect(() => {
    if (description !== undefined) {
      setLastChanged('description')
      const t = setTimeout(() => setLastChanged(null), 800)
      return () => clearTimeout(t)
    }
    return
  }, [description])

  useEffect(() => {
    if (category !== undefined) {
      setLastChanged('category')
      const t = setTimeout(() => setLastChanged(null), 800)
      return () => clearTimeout(t)
    }
    return
  }, [category])

  const nameDisplay = displayName?.trim() || ''
  const initial = (nameDisplay || 'M').charAt(0).toUpperCase()

  const pills = [
    { key: 'name', label: 'Name & Category', done: !!(displayName && category) },
    { key: 'desc', label: 'Description', done: !!description },
    { key: 'contact', label: 'Contact details', done: !!(email || website) },
  ]

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-[#1a5c3a] animate-pulse" />
        <div className="text-xs font-medium text-gray-500">Live preview</div>
        <div className="ml-2 bg-[#e8f5ee] text-[#1a5c3a] text-2xs rounded-full px-2 py-0.5">Updates as you type</div>
      </div>

      {/* Phone frame */}
      <div style={{ width: 260, borderRadius: 36, padding: 10, background: '#1a1a1a', position: 'relative', boxShadow: '0 0 0 1px #333, 0 20px 60px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.3)' }}>
        <div style={{ width: 80, height: 6, background: '#333', borderRadius: 3, margin: '0 auto 8px auto' }} />

        <div style={{ background: '#fff', borderRadius: 26, height: 520, overflowY: 'auto' }} className="relative">
          {/* STATUS BAR */}
          <div className="flex items-center justify-between px-4" style={{ height: 20, background: '#fff' }}>
            <div className="text-2xs font-semibold text-gray-900">9:41</div>
            <div className="flex items-center gap-2">
              <svg width="12" height="10" viewBox="0 0 12 10"><rect x="0" y="7" width="2" height="3" rx="0.5" fill="#1a1a1a"/><rect x="3" y="5" width="2" height="5" rx="0.5" fill="#1a1a1a"/><rect x="6" y="3" width="2" height="7" rx="0.5" fill="#1a1a1a"/><rect x="9" y="1" width="2" height="9" rx="0.5" fill="#1a1a1a"/></svg>
              <svg width="14" height="10" viewBox="0 0 14 10"><path d="M7 8.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="#1a1a1a"/><path d="M4.5 6.5C5.2 5.8 6.05 5.5 7 5.5s1.8.3 2.5 1" stroke="#1a1a1a" fill="none" strokeWidth="1.2" strokeLinecap="round"/></svg>
              <svg width="16" height="10" viewBox="0 0 16 10"><rect x="0.5" y="0.5" width="13" height="9" rx="2" stroke="#1a1a1a" fill="none" strokeWidth="1"/><rect x="13.5" y="3" width="2" height="4" rx="1" fill="#1a1a1a"/><rect x="1.5" y="1.5" width="9" height="7" rx="1.5" fill="#1a5c3a"/></svg>
            </div>
          </div>

          {/* NAV BAR */}
          <div className="flex items-center px-3 gap-2" style={{ height: 44, background: '#f0f0f0', borderBottom: '1px solid #e0e0e0' }}>
            <div className="text-[#007AFF] text-xs flex items-center gap-2">
              <span style={{ fontSize: 16, transform: 'translateY(1px)' }}>←</span>
              <span className="text-xs">Back</span>
            </div>
            <div className="flex-1 text-center">
              <div className="text-sm font-semibold text-gray-900">Business Info</div>
            </div>
          </div>

          {/* PROFILE HEADER */}
          <div className="pb-4 bg-white relative">
            <div style={{ height: 72, borderRadius: 12, background: 'linear-gradient(135deg, #1a5c3a 0%, #2d7a4f 50%, #4caf50 100%)' }} className="relative" />

            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 28 }}>
              <div className="w-20 h-20 rounded-full bg-white p-1 shadow-md relative">
                  <div className="w-18 h-18 rounded-full overflow-hidden" style={{ width: 72, height: 72 }}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #1a5c3a, #2d7a4f)', fontSize: 28 }}>
                        {initial}
                      </div>
                    )}
                  </div>

                  {logoPreview && typeof onRemoveLogo === 'function' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveLogo(); }}
                      title="Remove logo"
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-xs shadow border border-gray-200"
                    >
                      ×
                    </button>
                  )}
                </div>
            </div>

            <div className="mt-8 pt-3 text-center">
              <div className={cn('text-base font-bold', !nameDisplay ? 'text-gray-300 italic' : 'text-gray-900')}>{nameDisplay || 'Your Business Name'}</div>

              <div className="flex items-center justify-center gap-1.5 mt-1">
                <div className="text-xs text-gray-500">{phone || '+91 XXXXX XXXXX'}</div>
                <div className={`w-2 h-2 rounded-full ${isVerified ? 'bg-[#25D366]' : 'bg-gray-300'}`} />
                {isVerified && <div className="text-2xs text-[#25D366] font-medium">✓ Verified</div>}
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-2" style={{ background: '#fff', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
            <div className="grid grid-cols-3 gap-px bg-[#f0f0f0]">
              <div className="bg-white flex flex-col items-center gap-1 py-3">
                <Share2 size={18} className="text-[#007AFF]" />
                <div className="text-2xs text-[#007AFF]">share</div>
              </div>
              <div className="bg-white flex flex-col items-center gap-1 py-3">
                <Search size={18} className="text-[#007AFF]" />
                <div className="text-2xs text-[#007AFF]">search</div>
              </div>
              <div className="bg-white flex flex-col items-center gap-1 py-3">
                {(website || email) ? (
                  <Globe size={18} className="text-[#007AFF]" />
                ) : (
                  <Info size={18} className="text-[#007AFF]" />
                )}
                <div className="text-2xs text-[#007AFF]">{(website || email) ? 'website' : 'info'}</div>
              </div>
            </div>
          </div>

          {/* CATEGORY */}
          <div className="mt-2 bg-white px-4 py-3" style={{ borderTop: '1px solid #f0f0f0' }}>
            <div className={cn('text-xs font-medium', category ? 'text-gray-700' : 'text-gray-300 italic')}>{category || 'Category not set'}</div>
            <div className="flex items-center gap-1 mt-1 text-2xs text-gray-500"><Info size={12} /> <span>This is a business account.</span></div>
          </div>

          {/* DESCRIPTION */}
          <div className={cn('mt-2 bg-white px-4 py-3', lastChanged === 'description' && 'border-l-2 border-[#1a5c3a] pl-2 transition-all duration-200')}>
            {description ? (
              <div className="text-xs text-gray-700 leading-relaxed line-clamp-3">{description}</div>
            ) : (
              <div className="text-xs text-gray-300 italic">Add a description...</div>
            )}
          </div>

          {/* CONTACT DETAILS */}
          <div className="mt-2 bg-white" style={{ borderTop: '1px solid #f0f0f0' }}>
            {email ? (
              <div className="flex items-center h-10 px-4 gap-3 border-b border-[#f9f9f9]">
                <Mail size={14} className="text-[#8696a0]" />
                <div className="text-xs text-[#25D366]">{email}</div>
              </div>
            ) : null}

            {website ? (
              <div className="flex items-center h-10 px-4 gap-3 border-b border-[#f9f9f9]">
                <Globe size={14} className="text-[#8696a0]" />
                <div className="text-xs text-[#25D366]">{website.length > 28 ? website.slice(0, 25) + '...' : website}</div>
              </div>
            ) : null}

            {address ? (
              <div className="flex items-start px-4 py-3 gap-3">
                <MapPin size={14} className="text-[#8696a0] mt-1" />
                <div className="text-xs text-gray-700 line-clamp-2">{address}</div>
              </div>
            ) : null}

            {!(email || website || address) && (
              <div className="px-4 py-3 text-2xs text-gray-300 italic">Contact details will appear here...</div>
            )}
          </div>

          {/* ADD TO CONTACTS */}
          <div className="mt-2 bg-white px-4 py-3">
            <div className="text-xs text-[#25D366] font-medium cursor-pointer active:opacity-70">Add {displayName || 'Business'} to Contacts</div>
          </div>

          <div style={{ height: 20, background: '#fff' }} />
        </div>

        <div style={{ width: 80, height: 4, background: '#444', borderRadius: 2, margin: '8px auto 0 auto' }} />
      </div>

      {/* Info card and pills */}
      <div className="max-w-[260px] mt-4 bg-[#e8f5ee] border border-[#c8e6d4] rounded-xl p-3 text-center">
        <div className="text-2xs text-[#1a5c3a] leading-relaxed">👁 This is how customers see your profile on WhatsApp</div>
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {pills.map(p => (
            <div key={p.key} className={cn('flex items-center gap-1 text-2xs rounded-full px-2 py-0.5', p.done ? 'bg-[#e8f5ee] text-[#1a5c3a]' : 'bg-gray-100 text-gray-400')}>
              {p.done ? <Check size={12} className="text-[#1a5c3a]" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
              <div>{p.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
