import { Droplet, MoonStar, Smile, Lock } from 'lucide-react'
import { GlassPanel } from '../common/GlassPanel'
import { useCheckinsStore } from '../../features/checkins/store'
import { clamp, cn } from '../../lib/strings'
import { getDayMode, todayLabel } from '../../lib/date'
import { useVaultStore } from '../../features/vault/storage'

function Ring({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  const pct = clamp(value, 0, 1)
  const r = 11
  const c = 2 * Math.PI * r
  const dash = c * pct
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-8 w-8">
        <svg viewBox="0 0 28 28" className="h-8 w-8">
          <circle cx="14" cy="14" r={r} stroke="rgba(255,255,255,.14)" strokeWidth="3" fill="none" />
          <circle
            cx="14"
            cy="14"
            r={r}
            stroke="rgba(56,189,248,.85)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            transform="rotate(-90 14 14)"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-white/85">{icon}</div>
      </div>
      <div className="leading-tight">
        <div className="text-[11px] text-white/60">{label}</div>
        <div className="text-xs text-white/90">{Math.round(pct * 100)}%</div>
      </div>
    </div>
  )
}

export function TopStatusBar() {
  const hydration = useCheckinsStore((s) => s.hydration)
  const sleep = useCheckinsStore((s) => s.sleep)
  const checkins = useCheckinsStore((s) => s.checkins)
  const locked = useVaultStore((s) => s.status === 'locked')
  const lock = useVaultStore((s) => s.lock)

  const dayMode = getDayMode()
  const mood = checkins[0]?.mood ?? 3

  const hydrationPct = hydration.goalMl > 0 ? hydration.waterMlToday / hydration.goalMl : 0
  const moodPct = (mood - 1) / 4
  const sleepPct = clamp(sleep.lastNightHours / 8, 0, 1)

  return (
    <GlassPanel className="px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3 sm:justify-start">
          <div>
            <div className="text-xs text-white/60">{todayLabel()}</div>
            <div className="mt-0.5 text-lg font-semibold tracking-tight">WellnessOS</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs text-white/80">
              {dayMode}
            </span>
            <button
              type="button"
              aria-label={locked ? 'Privacy lock is enabled' : 'Enable privacy lock'}
              className={cn(
                'grid h-9 w-9 place-items-center rounded-xl border border-white/12 bg-white/8 text-white/85 transition-colors hover:bg-white/10',
                locked && 'border-accent/40 bg-accent/15 text-white shadow-glow',
              )}
              onClick={() => lock()}
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
          <Ring label="Hydration" value={hydrationPct} icon={<Droplet className="h-4 w-4" />} />
          <Ring label="Mood" value={moodPct} icon={<Smile className="h-4 w-4" />} />
          <Ring label="Sleep" value={sleepPct} icon={<MoonStar className="h-4 w-4" />} />
        </div>
      </div>
    </GlassPanel>
  )
}
