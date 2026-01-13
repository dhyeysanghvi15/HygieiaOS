import { GlassPanel } from '../common/GlassPanel'
import { useCheckinsStore } from '../../features/checkins/store'
import { LineChart, Line, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Button } from '../ui/button'
import { useMemo, useState } from 'react'
import { truncate } from '../../lib/strings'
import { useRoutineStore } from '../../features/routine/scheduler'
import { computeHeatmap, computeStreak, topTags } from '../../features/insights/compute'
import { Heatmap, StreakPill } from '../../features/insights/charts'
import { Input } from '../ui/input'

function dayLabel(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { weekday: 'short' })
}

export function InsightsPage() {
  const checkins = useCheckinsStore((s) => s.checkins)
  const addCheckin = useCheckinsStore((s) => s.addCheckin)
  const completions = useRoutineStore((s) => s.completions)
  const shiftNotes = useRoutineStore((s) => s.shiftNotes)
  const [tagInput, setTagInput] = useState('')

  const chartData = useMemo(() => {
    const last = [...checkins].reverse().slice(-14)
    return last.map((c) => ({
      day: dayLabel(c.createdAt),
      mood: c.mood,
      stress: c.stress,
      energy: c.energy,
    }))
  }, [checkins])

  const streaks = useMemo(() => {
    return {
      morning: computeStreak(completions, 'morning'),
      bedtime: computeStreak(completions, 'bedtime'),
      evening: computeStreak(completions, 'evening'),
    }
  }, [completions])

  const heatmap = useMemo(() => computeHeatmap(completions), [completions])
  const tags = useMemo(() => topTags(checkins), [checkins])

  const shareText = useMemo(() => {
    const recent = checkins[0]
    if (!recent) return 'No check-ins yet. Try an evening check-in to see trends.'
    return truncate(
      `WellnessOS Insights — latest check-in: mood ${recent.mood}/5, stress ${recent.stress}/5, energy ${recent.energy}/5. Tags: ${recent.tags.join(', ') || 'none'}.`,
      240,
    )
  }, [checkins])

  return (
    <div className="space-y-3">
      <GlassPanel className="space-y-3">
        <div>
          <div className="text-sm font-semibold">Quick Check-in</div>
          <div className="mt-1 text-sm text-white/70">
            Rate how you feel (1–5) and add “what helped” tags (stored locally unless Vault storage is enabled).
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button onClick={() => addCheckin({ mood: 4, stress: 2, energy: 4, tags: [] })}>Feeling good</Button>
          <Button onClick={() => addCheckin({ mood: 2, stress: 4, energy: 2, tags: [] })}>Rough patch</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag (e.g., walk, shower, music)…"
          />
          <Button
            variant="primary"
            onClick={() => {
              const tag = tagInput.trim().toLowerCase()
              if (!tag) return
              addCheckin({ mood: 3, stress: 3, energy: 3, tags: [tag] })
              setTagInput('')
            }}
          >
            Add
          </Button>
        </div>
        {tags.length ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t.tag}
                className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/75"
              >
                {t.tag} · {t.count}
              </span>
            ))}
          </div>
        ) : null}
      </GlassPanel>

      <GlassPanel>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Streaks</div>
            <div className="mt-1 text-sm text-white/70">
              Based on your mission-path completions (stored locally).
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <StreakPill label="Morning" value={streaks.morning} />
          <StreakPill label="Evening" value={streaks.evening} />
          <StreakPill label="Bedtime" value={streaks.bedtime} />
        </div>
      </GlassPanel>

      <GlassPanel>
        <div>
          <div className="text-sm font-semibold">Compliance Heatmap</div>
          <div className="mt-1 text-sm text-white/70">
            Local-only: we count which hours you tend to complete actions.
          </div>
        </div>
        <div className="mt-4">
          <Heatmap grid={heatmap.grid} max={heatmap.max} />
        </div>
      </GlassPanel>

      <GlassPanel>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Trends</div>
            <div className="mt-1 text-sm text-white/70">
              Mood, stress, and energy from your local check-ins.
            </div>
          </div>
        </div>
        <div className="mt-4 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,.45)" tickLine={false} axisLine={false} />
              <YAxis
                domain={[1, 5]}
                stroke="rgba(255,255,255,.45)"
                tickLine={false}
                axisLine={false}
                tickCount={5}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10,14,28,.9)',
                  border: '1px solid rgba(255,255,255,.12)',
                  borderRadius: 16,
                }}
              />
              <Line type="monotone" dataKey="mood" stroke="#38bdf8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="energy" stroke="#a78bfa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-2">
        <div className="text-sm font-semibold">Adaptive Nudges (Transparent)</div>
        <div className="text-sm text-white/70">
          We only adjust timing on-device based on when you complete tasks.
        </div>
        {shiftNotes.length ? (
          <ul className="space-y-1 text-sm text-white/75">
            {shiftNotes.map((n, i) => (
              <li key={`${i}_${n}`} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                {n}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
            As you use the timeline, we’ll adjust nudge timing and show the reason here.
          </div>
        )}
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <div>
          <div className="text-sm font-semibold">Shareable Summary</div>
          <div className="mt-1 text-sm text-white/70">
            This is intentionally non-sensitive; it never includes your chat transcripts or vault data.
          </div>
        </div>
        <pre className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/85">
          {shareText}
        </pre>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={async () => {
              await navigator.clipboard.writeText(shareText)
            }}
          >
            Copy
          </Button>
          <Button
            onClick={() => {
              if (navigator.share) navigator.share({ text: shareText }).catch(() => {})
            }}
          >
            Share…
          </Button>
        </div>
      </GlassPanel>
    </div>
  )
}
