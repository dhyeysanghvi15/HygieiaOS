import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Checkin, HydrationState } from './models'
import { id } from '../../lib/id'

function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(
    2,
    '0',
  )}`
}

type CheckinsState = {
  hydration: HydrationState
  sleep: { lastNightHours: number; lastUpdatedDayKey: string }
  checkins: Checkin[]
  addWater: (ml: number) => void
  setSleepHours: (hours: number) => void
  addCheckin: (partial: Omit<Checkin, 'id' | 'createdAt'>) => void
}

export const useCheckinsStore = create<CheckinsState>()(
  persist(
    (set, get) => ({
      hydration: { waterMlToday: 0, goalMl: 2000, lastUpdatedDayKey: dayKey() },
      sleep: { lastNightHours: 7.5, lastUpdatedDayKey: dayKey() },
      checkins: [],
      addWater: (ml) =>
        set((s) => {
          const key = dayKey()
          const next = { ...s.hydration }
          if (next.lastUpdatedDayKey !== key) {
            next.waterMlToday = 0
            next.lastUpdatedDayKey = key
          }
          next.waterMlToday = Math.max(0, next.waterMlToday + ml)
          return { hydration: next }
        }),
      setSleepHours: (hours) =>
        set(() => ({ sleep: { lastNightHours: Math.max(0, hours), lastUpdatedDayKey: dayKey() } })),
      addCheckin: (partial) => {
        const next: Checkin = { id: id('chk'), createdAt: Date.now(), ...partial }
        set({ checkins: [next, ...get().checkins].slice(0, 60) })
      },
    }),
    { name: 'wellnessos_checkins_v1' },
  ),
)

