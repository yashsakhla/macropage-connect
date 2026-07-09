import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

export function useRequireWhatsApp() {
  const connected = useAuthStore((s) => s.user?.whatsappSetupDone ?? false)
  const setWhatsappRequiredModalOpen = useUIStore((s) => s.setWhatsappRequiredModalOpen)

  function requireConnected(): boolean {
    if (connected) return true
    setWhatsappRequiredModalOpen(true)
    return false
  }

  return { whatsappConnected: connected, requireConnected }
}
