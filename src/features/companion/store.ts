import { create } from 'zustand'
import { id } from '../../lib/id'
import type { ChatMessage, AssistantPayload } from './types'
import { useSettingsStore } from '../settings/store'
import { vaultPut } from '../vault/storage'

type CompanionState = {
  messages: ChatMessage[]
  addUser: (text: string) => string
  addAssistant: (payload: AssistantPayload) => void
  clear: () => void
}

export const useCompanionStore = create<CompanionState>((set, get) => ({
  messages: [
    {
      id: id('msg'),
      role: 'assistant',
      createdAt: Date.now(),
      payload: {
        text: "I'm here. You can type or use push-to-talk. Try “/morning”, “/focus 25”, or ask a hygiene question.",
        risk: { tier: 'green', reasons: [] },
        actions: [
          { kind: 'open_tools', label: 'Open Tools' },
          { kind: 'log_water', label: 'Log +250ml', ml: 250 },
        ],
        citations: [],
      },
    },
  ],
  addUser: (text) => {
    const messageId = id('msg')
    const msg: ChatMessage = { id: messageId, role: 'user', createdAt: Date.now(), text }
    set({ messages: [...get().messages, msg] })
    const save = useSettingsStore.getState().storage.saveChatHistory
    if (save) void vaultPut('chat', msg)
    return messageId
  },
  addAssistant: (payload) => {
    const msg: ChatMessage = { id: id('msg'), role: 'assistant', createdAt: Date.now(), payload }
    set({ messages: [...get().messages, msg] })
    const save = useSettingsStore.getState().storage.saveChatHistory
    if (save) void vaultPut('chat', msg)
  },
  clear: () => set({ messages: [] }),
}))
