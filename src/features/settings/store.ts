import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CompanionMode = 'core' | 'smart'

type LockPolicy = {
  lockOnBackground: boolean
  lockTimeoutMinutes: number
}

type StoragePolicy = {
  saveChatHistory: boolean
  saveVoiceTranscripts: boolean
  saveJournals: boolean
  saveCheckins: boolean
}

type SettingsState = {
  companionMode: CompanionMode
  ttsEnabled: boolean
  whisperMode: boolean
  liveWebMode: boolean
  storage: StoragePolicy
  lockPolicy: LockPolicy
  set: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void
  setStorage: <K extends keyof StoragePolicy>(key: K, value: StoragePolicy[K]) => void
  setLockPolicy: <K extends keyof LockPolicy>(key: K, value: LockPolicy[K]) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      companionMode: 'core',
      ttsEnabled: false,
      whisperMode: false,
      liveWebMode: false,
      storage: {
        saveChatHistory: true,
        saveVoiceTranscripts: false,
        saveJournals: true,
        saveCheckins: false,
      },
      lockPolicy: { lockOnBackground: true, lockTimeoutMinutes: 10 },
      set: (key, value) => set({ [key]: value } as never),
      setStorage: (key, value) =>
        set((s) => ({ storage: { ...s.storage, [key]: value } })),
      setLockPolicy: (key, value) =>
        set((s) => ({ lockPolicy: { ...s.lockPolicy, [key]: value } })),
    }),
    { name: 'wellnessos_settings_v1' },
  ),
)

