import * as React from 'react'
import { GlassPanel } from '../common/GlassPanel'
import { Button } from '../ui/button'
import { cn } from '../../lib/strings'
import { useTimersStore } from '../../features/timers/timers'
import { useCheckinsStore } from '../../features/checkins/store'
import { useNavigate } from 'react-router-dom'
import type { Checkpoint } from './TimelineView'
import { useRoutineStore } from '../../features/routine/scheduler'
import type { CheckpointId } from '../../features/routine/models'

type Intensity = '30s' | '2m' | '5m'

export function CheckpointCard({
  checkpoint,
}: {
  checkpoint: Checkpoint
}) {
  const [intensity, setIntensity] = React.useState<Intensity>('2m')
  const startTimer = useTimersStore((s) => s.startPreset)
  const addWater = useCheckinsStore((s) => s.addWater)
  const addCheckin = useCheckinsStore((s) => s.addCheckin)
  const markDone = useRoutineStore((s) => s.markDone)
  const snooze = useRoutineStore((s) => s.snooze)
  const snoozes = useRoutineStore((s) => s.snoozes)
  const completions = useRoutineStore((s) => s.completions)
  const getPreferredLabel = useRoutineStore((s) => s.getPreferredLabel)
  const navigate = useNavigate()

  const intensityMultiplier = intensity === '30s' ? 0.25 : intensity === '2m' ? 1 : 2.5
  const checkpointId = checkpoint.id as CheckpointId
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    const h = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(h)
  }, [])

  const snoozeUntil = snoozes.find((s) => s.checkpointId === checkpointId)?.until ?? 0
  const snoozed = snoozeUntil > now

  const completedToday = completions.some((c) => {
    if (c.checkpointId !== checkpointId) return false
    const d = new Date(c.at)
    const now = new Date()
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  })
  const preferred = getPreferredLabel(checkpointId)

  return (
    <GlassPanel className="relative pl-10 sm:pl-12">
      <div className="absolute left-2 top-5 grid h-6 w-6 place-items-center rounded-full border border-white/12 bg-white/8 text-white/85 sm:left-3">
        {checkpoint.icon}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-lg font-semibold tracking-tight text-white/95">{checkpoint.title}</div>
            {completedToday ? (
              <span className="rounded-full border border-accent-3/30 bg-accent-3/10 px-2 py-1 text-xs text-white/80">
                Done
              </span>
            ) : null}
            {snoozed ? (
              <span className="rounded-full border border-accent-warn/30 bg-accent-warn/10 px-2 py-1 text-xs text-white/80">
                Snoozed
              </span>
            ) : null}
          </div>
          <div className="mt-2 text-base leading-relaxed text-white/70">{checkpoint.why}</div>
          {preferred ? (
            <div className="mt-2 text-sm text-white/55">Nudges adapted toward {preferred} (local-only).</div>
          ) : null}

          <div className="mt-4">
            <div className="inline-flex overflow-hidden rounded-full border border-white/10 bg-white/5">
              {(['30s', '2m', '5m'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setIntensity(v)}
                  className={cn(
                    'min-w-[64px] px-3 py-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/6',
                    v === intensity && 'bg-accent/14 text-white',
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:max-w-[420px] lg:justify-end">
          <Button
            variant="primary"
            onClick={() => {
              if (checkpoint.id === 'day') addWater(200)
              if (checkpoint.id === 'evening') addCheckin({ mood: 3, stress: 3, energy: 3, tags: [] })
              markDone(checkpointId)
              startTimer({
                id: 'done',
                label: `${checkpoint.title} (Done)`,
                seconds: Math.round(10 * intensityMultiplier),
              })
            }}
            className="sm:order-2 sm:min-w-[160px]"
          >
            Mark Done
          </Button>

          <Button variant="ghost" onClick={() => navigate('/companion')} className="sm:order-1 sm:min-w-[160px]">
            Ask Companion
          </Button>

          <details className="group sm:order-3 sm:min-w-[200px]">
            <summary className="list-none">
              <Button className="w-full">Snooze…</Button>
            </summary>
            <div className="mt-2 grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
              {[15, 30, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-left text-sm text-white/80 hover:bg-white/8"
                  onClick={() => {
                    snooze(checkpointId, m)
                    startTimer({ id: 'snooze', label: `${checkpoint.title} (Snooze ${m}m)`, seconds: m * 60 })
                  }}
                >
                  Snooze {m} minutes
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>

      {snoozed ? (
        <div className="mt-3 text-xs text-white/60">
          Snoozed until {new Date(snoozeUntil).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {checkpoint.actions.map((a) => {
          if (a.kind === 'timer') {
            const seconds =
              a.timerId === 'handwash'
                ? 20
                : a.timerId === 'brush'
                  ? 120
                  : a.timerId === 'breath60'
                    ? 60
                    : a.timerId === 'breath120'
                      ? 120
                      : a.timerId === 'focus25'
                        ? 25 * 60
                        : 60
            return (
              <button
                key={a.label}
                type="button"
                className="glass flex min-h-[52px] items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/85 transition-colors hover:bg-white/6"
                onClick={() =>
                  startTimer({
                    id: a.timerId,
                    label: a.label,
                    seconds: Math.round(seconds * intensityMultiplier),
                  })
                }
              >
                <span>{a.label}</span>
                <span className="text-xs text-white/60">Start</span>
              </button>
            )
          }
          if (a.kind === 'water') {
            return (
              <button
                key={a.label}
                type="button"
                className="glass flex min-h-[52px] items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/85 transition-colors hover:bg-white/6"
                onClick={() => addWater(a.ml)}
              >
                <span>{a.label}</span>
                <span className="text-xs text-white/60">Log</span>
              </button>
            )
          }
          if (a.kind === 'checkin') {
            return (
              <button
                key={a.label}
                type="button"
                className="glass flex min-h-[52px] items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/85 transition-colors hover:bg-white/6"
                onClick={() => navigate('/insights')}
              >
                <span>{a.label}</span>
                <span className="text-xs text-white/60">Open</span>
              </button>
            )
          }
          return null
        })}
      </div>
    </GlassPanel>
  )
}
