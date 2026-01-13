import { describe, expect, it } from 'vitest'
import { computePreferredMinuteForCheckpoint } from '../adapt'

describe('routine adapt', () => {
  it('computes preferred minute after enough completions', () => {
    const base = new Date('2025-01-01T08:00:00Z').getTime()
    const completions = Array.from({ length: 6 }, (_, i) => ({
      checkpointId: 'morning' as const,
      at: base + i * 24 * 60 * 60 * 1000,
    }))
    const pref = computePreferredMinuteForCheckpoint('morning', completions)
    expect(pref).not.toBeNull()
  })
})

