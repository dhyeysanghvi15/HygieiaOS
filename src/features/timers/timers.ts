import { create } from 'zustand'
import { id } from '../../lib/id'
import { clamp } from '../../lib/strings'

export type TimerStatus = 'idle' | 'running' | 'done'

export type ActiveTimer = {
  timerId: string
  instanceId: string
  label: string
  secondsTotal: number
  startedAt: number
  endsAt: number
  status: TimerStatus
}

function now() {
  return Date.now()
}

type TimersState = {
  active: ActiveTimer | null
  startPreset: (preset: { id: string; label: string; seconds: number }) => void
  stop: () => void
  tick: () => void
}

let intervalHandle: number | null = null

export const useTimersStore = create<TimersState>((set, get) => ({
  active: null,
  startPreset: ({ id: presetId, label, seconds }) => {
    const startedAt = now()
    const endsAt = startedAt + seconds * 1000
    const active: ActiveTimer = {
      timerId: presetId,
      instanceId: id('tmr'),
      label,
      secondsTotal: seconds,
      startedAt,
      endsAt,
      status: 'running',
    }
    set({ active })
    if (intervalHandle) window.clearInterval(intervalHandle)
    intervalHandle = window.setInterval(() => get().tick(), 250)
  },
  stop: () => {
    if (intervalHandle) window.clearInterval(intervalHandle)
    intervalHandle = null
    set({ active: null })
  },
  tick: () => {
    const a = get().active
    if (!a) return
    const remainingMs = a.endsAt - now()
    if (remainingMs <= 0 && a.status !== 'done') {
      set({ active: { ...a, status: 'done', endsAt: now() } })
      if (intervalHandle) window.clearInterval(intervalHandle)
      intervalHandle = null
      if ('vibrate' in navigator) navigator.vibrate?.([40, 60, 40])
    }
  },
}))

export function timerProgress(active: ActiveTimer, at = now()) {
  const elapsed = clamp((at - active.startedAt) / 1000, 0, active.secondsTotal)
  return { elapsed, remaining: Math.max(0, active.secondsTotal - elapsed) }
}

