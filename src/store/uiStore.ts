import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  notificationPanelOpen: boolean
  planExpiredModalOpen: boolean
  whatsappRequiredModalOpen: boolean
  paymentIssueModalOpen: boolean
  paymentIssueReferenceId: string | null
  helpWidgetOpen: boolean

  // global full-page loader
  fullLoader: boolean

  // set right before navigating to /dashboard after a successful login/signup —
  // lets the dashboard show a one-time post-login promo banner, then gets cleared
  justLoggedIn: boolean

  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleTheme: () => void
  setFullLoader: (v: boolean) => void
  toggleNotificationPanel: () => void
  setNotificationPanelOpen: (open: boolean) => void
  setPlanExpiredModalOpen: (v: boolean) => void
  setWhatsappRequiredModalOpen: (v: boolean) => void
  openPaymentIssueModal: (referenceId?: string | null) => void
  setPaymentIssueModalOpen: (v: boolean) => void
  setHelpWidgetOpen: (v: boolean) => void
  openHelpChat: () => void
  setJustLoggedIn: (v: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      theme: 'light',
      notificationPanelOpen: false,
      planExpiredModalOpen: false,
      whatsappRequiredModalOpen: false,
      paymentIssueModalOpen: false,
      paymentIssueReferenceId: null,
      helpWidgetOpen: false,
      fullLoader: false,
      justLoggedIn: false,

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
      openPaymentIssueModal: (referenceId) =>
        set({ paymentIssueModalOpen: true, paymentIssueReferenceId: referenceId ?? null }),
      setPaymentIssueModalOpen: (v) => set({ paymentIssueModalOpen: v }),
      setHelpWidgetOpen: (v) => set({ helpWidgetOpen: v }),
      openHelpChat: () => set({ helpWidgetOpen: true }),
      setJustLoggedIn: (v) => set({ justLoggedIn: v }),
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
