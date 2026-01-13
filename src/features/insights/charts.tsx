import { cn } from '../../lib/strings'

export function Heatmap({ grid, max }: { grid: number[]; max: number }) {
  return (
    <div className="grid grid-cols-12 gap-2">
      {grid.map((v, hour) => {
        const a = v / max
        return (
          <div key={hour} className="flex items-center gap-2">
            <div className="w-8 text-xs text-white/55">{hour}</div>
            <div
              className={cn('h-3 flex-1 rounded-full border border-white/10')}
              style={{
                background: `rgba(56,189,248,${0.12 + a * 0.55})`,
              }}
              aria-label={`Hour ${hour}: ${v} completions`}
            />
          </div>
        )
      })}
    </div>
  )
}

export function StreakPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass flex items-center justify-between rounded-2xl px-4 py-3">
      <div className="text-sm text-white/75">{label}</div>
      <div className="font-mono text-lg text-white">{value}</div>
    </div>
  )
}

