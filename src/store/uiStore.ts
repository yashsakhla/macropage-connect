import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  mobileSidebarOpen: boolean
  theme: 'light' | 'dark'
  notificationPanelOpen: boolean
  planExpiredModalOpen: boolean
  whatsappRequiredModalOpen: boolean
  paymentIssueModalOpen: boolean
  paymentIssueReferenceId: string | null
  helpWidgetOpen: boolean
  demoModalOpen: boolean

  // global full-page loader
  fullLoader: boolean

  // set right before navigating to /dashboard after a successful login/signup —
  // lets the dashboard show a one-time post-login promo banner, then gets cleared
  justLoggedIn: boolean

  // true while the onboarding WelcomePopup (free trial / connect WhatsApp) is
  // on screen — AdBanner waits for this to go false before showing its own popup
  welcomePopupOpen: boolean

  // URL of the image currently shown full-screen — set by any "view image"
  // click anywhere in the app; ImageLightbox (mounted once in MainLayout)
  // renders it instead of opening a new tab
  lightboxImage: string | null
  openLightbox: (url: string) => void
  closeLightbox: () => void

  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleMobileSidebar: () => void
  setMobileSidebarOpen: (open: boolean) => void
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
  setDemoModalOpen: (v: boolean) => void
  openDemoModal: () => void
  setJustLoggedIn: (v: boolean) => void
  setWelcomePopupOpen: (v: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      mobileSidebarOpen: false,
      theme: 'light',
      notificationPanelOpen: false,
      planExpiredModalOpen: false,
      whatsappRequiredModalOpen: false,
      paymentIssueModalOpen: false,
      paymentIssueReferenceId: null,
      helpWidgetOpen: false,
      demoModalOpen: false,
      fullLoader: false,
      justLoggedIn: false,
      welcomePopupOpen: false,
      lightboxImage: null,

      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleMobileSidebar: () => set({ mobileSidebarOpen: !get().mobileSidebarOpen }),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

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
      setDemoModalOpen: (v) => set({ demoModalOpen: v }),
      openDemoModal: () => set({ demoModalOpen: true, helpWidgetOpen: false }),
      setJustLoggedIn: (v) => set({ justLoggedIn: v }),
      setWelcomePopupOpen: (v) => set({ welcomePopupOpen: v }),
      openLightbox: (url) => set({ lightboxImage: url }),
      closeLightbox: () => set({ lightboxImage: null }),
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
