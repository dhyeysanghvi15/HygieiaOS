import { create } from 'zustand'

type CompanionUIState = {
  dockOpen: boolean
  listening: boolean
  setDockOpen: (open: boolean) => void
  setListening: (listening: boolean) => void
}

export const useCompanionUIStore = create<CompanionUIState>((set) => ({
  dockOpen: false,
  listening: false,
  setDockOpen: (dockOpen) => set({ dockOpen }),
  setListening: (listening) => set({ listening }),
}))

