import { create } from 'zustand'

interface UiState {
  isCreateRoomModalOpen: boolean
  isCoffeeBreakActive: boolean
  isRevealing: boolean
  sidebarOpen: boolean

  openCreateRoomModal: () => void
  closeCreateRoomModal: () => void
  setIsCoffeeBreakActive: (v: boolean) => void
  setIsRevealing: (v: boolean) => void
  setSidebarOpen: (v: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  isCreateRoomModalOpen: false,
  isCoffeeBreakActive: false,
  isRevealing: false,
  sidebarOpen: true,

  openCreateRoomModal: () => set({ isCreateRoomModalOpen: true }),
  closeCreateRoomModal: () => set({ isCreateRoomModalOpen: false }),
  setIsCoffeeBreakActive: (v) => set({ isCoffeeBreakActive: v }),
  setIsRevealing: (v) => set({ isRevealing: v }),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
}))
