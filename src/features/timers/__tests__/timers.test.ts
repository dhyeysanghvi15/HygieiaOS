import { describe, expect, it } from 'vitest'
import { timerProgress, type ActiveTimer } from '../timers'

describe('timers', () => {
  it('computes progress', () => {
    const a: ActiveTimer = {
      timerId: 't',
      instanceId: 'i',
      label: 'Timer',
      secondsTotal: 100,
      startedAt: 0,
      endsAt: 100_000,
      status: 'running',
    }
    const p = timerProgress(a, 50_000)
    expect(p.elapsed).toBe(50)
    expect(p.remaining).toBe(50)
  })
})

