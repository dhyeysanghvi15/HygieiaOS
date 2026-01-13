import type { Completion, CheckpointId } from '../routine/models'
import type { Checkin } from '../checkins/models'

function dayKey(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function computeStreak(completions: Completion[], checkpointId: CheckpointId) {
  const byDay = new Set(completions.filter((c) => c.checkpointId === checkpointId).map((c) => dayKey(c.at)))
  let streak = 0
  const now = new Date()
  for (let i = 0; i < 180; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = dayKey(d.getTime())
    if (byDay.has(key)) streak++
    else break
  }
  return streak
}

export function computeHeatmap(completions: Completion[]) {
  const grid = Array.from({ length: 24 }, () => 0)
  for (const c of completions) grid[new Date(c.at).getHours()]++
  const max = Math.max(1, ...grid)
  return { grid, max }
}

export function topTags(checkins: Checkin[], limit = 8) {
  const counts = new Map<string, number>()
  for (const c of checkins) for (const t of c.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }))
}

