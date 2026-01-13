export type DayMode = 'Morning' | 'Day' | 'Evening' | 'Sleep'

export function getDayMode(now = new Date()): DayMode {
  const h = now.getHours()
  if (h >= 5 && h < 11) return 'Morning'
  if (h >= 11 && h < 17) return 'Day'
  if (h >= 17 && h < 22) return 'Evening'
  return 'Sleep'
}

export function todayLabel(now = new Date()): string {
  return now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

