import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  notificationPanelOpen: boolean
  planExpiredModalOpen: boolean
  whatsappRequiredModalOpen: boolean

  // global full-page loader
  fullLoader: boolean

  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleTheme: () => void
  setFullLoader: (v: boolean) => void
  toggleNotificationPanel: () => void
  setNotificationPanelOpen: (open: boolean) => void
  setPlanExpiredModalOpen: (v: boolean) => void
  setWhatsappRequiredModalOpen: (v: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      theme: 'light',
      notificationPanelOpen: false,
      planExpiredModalOpen: false,
      whatsappRequiredModalOpen: false,
      fullLoader: false,

      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        document.documentElement.classList.toggle('dark', next === 'dark')
        set({ theme: next })
      },
      setFullLoader: (v: boolean) => set({ fullLoader: v }),
      toggleNotificationPanel: () => set({ notificationPanelOpen: !get().notificationPanelOpen }),
      setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),
      setPlanExpiredModalOpen: (v) => set({ planExpiredModalOpen: v }),
      setWhatsappRequiredModalOpen: (v) => set({ whatsappRequiredModalOpen: v }),
    }),
    {
      name: 'macropage-ui',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        notificationPanelOpen: state.notificationPanelOpen,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark')
        }
      },
    }
  )
)
