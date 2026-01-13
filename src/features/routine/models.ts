import { z } from 'zod'

export const CheckpointIdSchema = z.enum(['morning', 'day', 'evening', 'bedtime'])
export type CheckpointId = z.infer<typeof CheckpointIdSchema>

export type Completion = { checkpointId: CheckpointId; at: number }
export type Snooze = { checkpointId: CheckpointId; until: number }

export type RoutineStep = {
  id: string
  label: string
  kind: 'timer' | 'note' | 'action'
  seconds?: number
}

export type RoutineTemplateId = 'morning' | 'study' | 'sleep' | 'rescue'

export const DefaultRoutines: Record<RoutineTemplateId, { title: string; steps: RoutineStep[] }> = {
  morning: {
    title: 'Morning Routine',
    steps: [
      { id: 'brush', label: 'Brush (2 min)', kind: 'timer', seconds: 120 },
      { id: 'water', label: 'Water (250ml)', kind: 'action' },
      { id: 'posture', label: 'Posture reset (10s)', kind: 'timer', seconds: 10 },
    ],
  },
  study: {
    title: 'Study Routine',
    steps: [
      { id: 'focus25', label: 'Focus (25m)', kind: 'timer', seconds: 25 * 60 },
      { id: 'break2', label: 'Micro break (2m)', kind: 'timer', seconds: 2 * 60 },
      { id: 'water', label: 'Sip water', kind: 'action' },
    ],
  },
  sleep: {
    title: 'Sleep Routine',
    steps: [
      { id: 'dim', label: 'Dim lights + phone down', kind: 'action' },
      { id: 'breath120', label: 'Breathing (2m)', kind: 'timer', seconds: 120 },
      { id: 'note', label: 'One line: what went well today', kind: 'note' },
    ],
  },
  rescue: {
    title: '2-minute rescue',
    steps: [
      { id: 'breath60', label: 'Breathing (60s)', kind: 'timer', seconds: 60 },
      { id: 'water', label: 'Water (small sip)', kind: 'action' },
      { id: 'name3', label: 'Name 3 things you see', kind: 'note' },
    ],
  },
}

