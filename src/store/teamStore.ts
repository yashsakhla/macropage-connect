import { create } from 'zustand'

interface TeamStore {
  activeTab: 'members' | 'permissions' | 'performance' | 'activity' | 'settings'
  setActiveTab: (tab: TeamStore['activeTab']) => void
  selectedMemberIds: Set<string>
  toggleMember: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  showInviteModal: boolean
  setShowInviteModal: (v: boolean) => void
  showActivityPanel: boolean
  setShowActivityPanel: (v: boolean) => void
}

export const useTeamStore = create<TeamStore>((set) => ({
  activeTab: 'members',
  setActiveTab: (activeTab) => set({ activeTab }),

  selectedMemberIds: new Set(),
  toggleMember: (id) => set(s => {
    const next = new Set(s.selectedMemberIds)
    next.has(id) ? next.delete(id) : next.add(id)
    return { selectedMemberIds: next }
  }),
  selectAll: (ids) => set({ selectedMemberIds: new Set(ids) }),
  clearSelection: () => set({ selectedMemberIds: new Set() }),

  showInviteModal: false,
  setShowInviteModal: (showInviteModal) => set({ showInviteModal }),

  showActivityPanel: false,
  setShowActivityPanel: (showActivityPanel) => set({ showActivityPanel }),
}))
