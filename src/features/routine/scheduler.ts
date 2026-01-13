import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CheckpointId, Completion, Snooze, RoutineStep } from './models'
import { computePreferredMinuteForCheckpoint, explainShift } from './adapt'
import { id } from '../../lib/id'

type RoutineState = {
  completions: Completion[]
  snoozes: Snooze[]
  preferredMinutes: Partial<Record<CheckpointId, number>>
  shiftNotes: string[]
  routines: Array<{ id: string; title: string; steps: RoutineStep[]; createdAt: number }>
  markDone: (checkpointId: CheckpointId) => void
  snooze: (checkpointId: CheckpointId, minutes: number) => void
  isSnoozed: (checkpointId: CheckpointId) => boolean
  getPreferredLabel: (checkpointId: CheckpointId) => string | null
  saveRoutine: (title: string, steps: RoutineStep[]) => string
  deleteRoutine: (routineId: string) => void
}

function labelFromMinute(minute: number) {
  const h = Math.floor(minute / 60)
  const m = minute % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      completions: [],
      snoozes: [],
      preferredMinutes: {},
      shiftNotes: [],
      routines: [],
      markDone: (checkpointId) =>
        set((s) => {
          const nextCompletions = [{ checkpointId, at: Date.now() }, ...s.completions].slice(0, 400)
          const pref = computePreferredMinuteForCheckpoint(checkpointId, nextCompletions)
          const nextPreferred = { ...s.preferredMinutes }
          const nextNotes = [...s.shiftNotes]
          if (pref != null && nextPreferred[checkpointId] !== pref) {
            nextPreferred[checkpointId] = pref
            nextNotes.unshift(explainShift(checkpointId, pref))
          }
          return {
            completions: nextCompletions,
            snoozes: s.snoozes.filter((sn) => sn.checkpointId !== checkpointId),
            preferredMinutes: nextPreferred,
            shiftNotes: nextNotes.slice(0, 10),
          }
        }),
      snooze: (checkpointId, minutes) =>
        set((s) => ({
          snoozes: [
            { checkpointId, until: Date.now() + minutes * 60_000 },
            ...s.snoozes.filter((sn) => sn.checkpointId !== checkpointId),
          ],
        })),
      isSnoozed: (checkpointId) => {
        const sn = get().snoozes.find((x) => x.checkpointId === checkpointId)
        return !!sn && sn.until > Date.now()
      },
      getPreferredLabel: (checkpointId) => {
        const m = get().preferredMinutes[checkpointId]
        return m == null ? null : labelFromMinute(m)
      },
      saveRoutine: (title, steps) => {
        const routineId = id('rtn')
        set((s) => ({
          routines: [{ id: routineId, title, steps, createdAt: Date.now() }, ...s.routines].slice(0, 24),
        }))
        return routineId
      },
      deleteRoutine: (routineId) => set((s) => ({ routines: s.routines.filter((r) => r.id !== routineId) })),
    }),
    { name: 'wellnessos_routine_v1' },
  ),
)
