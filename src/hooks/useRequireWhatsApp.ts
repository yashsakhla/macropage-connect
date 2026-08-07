import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useWhatsAppSetupStatus } from '@/hooks/useWhatsApp'

export function useRequireWhatsApp() {
  // `user.whatsappSetupDone` (from /me) tracks whether the whole setup
  // wizard was completed, but a user can have a live, working WABA
  // (metaConnected on /whatsapp/status) without ever finishing every wizard
  // step — e.g. skipping the PIN/get-started steps. Trust /whatsapp/status
  // first since it reflects the real Meta connection state; fall back to
  // the /me flag only while that request hasn't resolved yet.
  const setupDone = useAuthStore((s) => s.user?.whatsappSetupDone ?? false)
  const { data: status, isLoading: statusLoading } = useWhatsAppSetupStatus()
  const connected = statusLoading ? setupDone : (status?.metaConnected ?? setupDone)

  const setWhatsappRequiredModalOpen = useUIStore((s) => s.setWhatsappRequiredModalOpen)

  function requireConnected(): boolean {
    if (connected) return true
    setWhatsappRequiredModalOpen(true)
    return false
  }

  return { whatsappConnected: connected, requireConnected }
}
