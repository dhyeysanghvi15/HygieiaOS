import type { Completion, CheckpointId } from './models'

function minuteOfDay(ts: number) {
  const d = new Date(ts)
  return d.getHours() * 60 + d.getMinutes()
}

function median(xs: number[]) {
  const a = [...xs].sort((x, y) => x - y)
  const mid = Math.floor(a.length / 2)
  return a.length % 2 ? a[mid] : Math.round((a[mid - 1] + a[mid]) / 2)
}

export function computePreferredMinuteForCheckpoint(checkpointId: CheckpointId, completions: Completion[]) {
  const relevant = completions.filter((c) => c.checkpointId === checkpointId).slice(0, 21)
  if (relevant.length < 4) return null
  return median(relevant.map((c) => minuteOfDay(c.at)))
}

export function explainShift(checkpointId: CheckpointId, preferredMinute: number) {
  const h = Math.floor(preferredMinute / 60)
  const m = preferredMinute % 60
  const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  return `We shifted ${checkpointId} nudges toward ${label} because that’s when you usually complete it.`
}

