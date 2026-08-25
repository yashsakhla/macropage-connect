import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCatalogStatus, useConnectCatalog } from '@/hooks/useCatalog'
import { openCatalogOAuthPopup } from '@/lib/facebook-catalog-oauth'
import { ShoppingBag, Link2, Loader2, AlertCircle } from 'lucide-react'

export default function CatalogConnect() {
  const navigate = useNavigate()
  const [popupLoading, setPopupLoading] = useState(false)

  const { data: status, isLoading } = useCatalogStatus()

  const {
    mutate: connect,
    isPending: connecting,
    isError: connectError,
    error: connectErr,
  } = useConnectCatalog()

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 flex justify-center">
        <Loader2 size={22} className="animate-spin text-gray-300" />
      </div>
    )
  }

  // Already connected — shouldn't normally land here (RequireCatalog guard
  // redirects to products once connected), but handle it gracefully just
  // in case someone lands here directly
  if (status?.isConnected) {
    navigate('/catalog/products', { replace: true })
    return null
  }

  const handleConnect = async () => {
    setPopupLoading(true)
    try {
      const accessToken = await openCatalogOAuthPopup()
      connect(accessToken)
    } catch (err: any) {
      toast.error(err?.message ?? 'Catalog connection was cancelled')
    } finally {
      setPopupLoading(false)
    }
  }

  const isBusy = popupLoading || connecting

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#e8f5ee] rounded-3xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag size={28} className="text-[#1a5c3a]" />
        </div>
        <h1 className="text-xl font-black text-gray-900">Connect your catalog</h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-sm mx-auto">
          Set up a WhatsApp product catalog so your customers can browse and order
          directly inside a chat.
        </p>
      </div>

      {connectError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-4 mb-5 flex items-start gap-3">
          <AlertCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-red-700">Could not connect catalog</p>
            <p className="text-xs text-red-600 mt-1">
              {(connectErr as any)?.response?.data?.message ?? 'Something went wrong. Please try again.'}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#e8ebe8] rounded-3xl px-6 py-6 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
          What happens when you connect
        </p>
        <div className="space-y-3">
          {[
            'A Facebook window opens to create or select your product catalog',
            'The catalog is linked to your WhatsApp number',
            'Cart and catalog features are enabled',
            'You can start adding products right after',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#e8f5ee] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-2xs font-bold text-[#1a5c3a]">{i + 1}</span>
              </div>
              <p className="text-sm text-gray-600">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleConnect}
        disabled={isBusy}
        className="w-full h-12 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
      >
        {isBusy ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Link2 size={16} />
            Connect catalog
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        This opens a Facebook window to complete the connection securely.
      </p>
    </div>
  )
}
