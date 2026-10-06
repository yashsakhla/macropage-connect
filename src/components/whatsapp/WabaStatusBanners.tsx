import { Link } from 'react-router-dom'
import { AlertTriangle, AlertCircle } from 'lucide-react'
import { useWABADetails, useSyncWhatsAppStatus } from '@/hooks/useWhatsApp'
import { usePermissions } from '@/lib/permissionsConstants'

export default function WabaStatusBanners() {
  const { data: waba } = useWABADetails()
  const { canChangeWhatsAppSettings } = usePermissions()
  const { mutate: syncStatus, isPending: syncing } = useSyncWhatsAppStatus()

  if (!waba?.connected) return null

  return (
    <>
      {waba.needsReregister === true && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700 flex-1">
            Your display name is approved, but the number still needs to be
            re-registered to activate it.
          </p>
          {canChangeWhatsAppSettings && (
            <button
              onClick={() => syncStatus()}
              disabled={syncing}
              className="text-xs font-semibold text-amber-700 underline flex-shrink-0 disabled:opacity-50"
            >
              {syncing ? 'Retrying...' : 'Retry'}
            </button>
          )}
        </div>
      )}

      {waba.accountRestricted === true && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700 flex-1">
            Meta has restricted your WhatsApp Business Account. Contact support.
          </p>
          <Link to="/help" className="text-xs font-semibold text-red-700 underline flex-shrink-0">
            Get help
          </Link>
        </div>
      )}
    </>
  )
}
