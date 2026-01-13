import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { GlassPanel } from '../common/GlassPanel'
import { useTimersStore, timerProgress } from '../../features/timers/timers'
import { useEffect, useMemo, useState } from 'react'

export function TimerCard({
  title,
  subtitle,
  preset,
  tips,
}: {
  title: string
  subtitle: string
  preset: { id: string; label: string; seconds: number }
  tips?: string[]
}) {
  const active = useTimersStore((s) => s.active)
  const start = useTimersStore((s) => s.startPreset)
  const stop = useTimersStore((s) => s.stop)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active) return
    const h = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(h)
  }, [active])

  const isThis = active?.timerId === preset.id
  const progress = useMemo(() => {
    if (!active || !isThis) return { elapsed: 0, remaining: preset.seconds }
    return timerProgress(active, now)
  }, [active, isThis, now, preset.seconds])

  const pct = preset.seconds > 0 ? progress.elapsed / preset.seconds : 0

  return (
    <GlassPanel className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold">{title}</div>
          <div className="mt-1 text-sm text-white/70">{subtitle}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/60">Remaining</div>
          <div className="mt-0.5 font-mono text-lg">
            {Math.ceil(progress.remaining)
              .toString()
              .padStart(2, '0')}
            s
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: '0%' }}
            animate={{ width: `${Math.min(100, Math.max(0, pct * 100))}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          />
        </div>
        {isThis ? (
          <Button variant="danger" onClick={() => stop()}>
            Stop
          </Button>
        ) : (
          <Button variant="primary" onClick={() => start(preset)}>
            Start
          </Button>
        )}
      </div>

      {tips?.length ? (
        <details className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-white/85">Technique tips</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
            {tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </GlassPanel>
  )
}
