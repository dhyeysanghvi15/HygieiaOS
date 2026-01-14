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
import { PageHeader } from '../common/PageHeader'
import { Section } from '../common/Section'
import { Grid } from '../common/Grid'
import { Stack } from '../common/Stack'

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
    <Stack gap="gap-6 sm:gap-8">
      <Section className="pt-0">
        <PageHeader
          title="Insights"
          subtitle="Trends, streaks, and transparent nudges—computed on-device."
        />
      </Section>

      <Section className="pt-0">
        <Grid className="grid-cols-1 lg:grid-cols-12" gap="gap-5 lg:gap-8">
          <Stack className="lg:col-span-7" gap="gap-5">
            <GlassPanel className="space-y-4">
              <div>
                <div className="text-lg font-semibold tracking-tight">Quick Check-in</div>
                <div className="mt-2 text-base leading-relaxed text-white/70">
                  Rate how you feel and add “what helped” tags (local-only unless Vault storage is enabled).
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button onClick={() => addCheckin({ mood: 4, stress: 2, energy: 4, tags: [] })}>
                  Feeling good
                </Button>
                <Button onClick={() => addCheckin({ mood: 2, stress: 4, energy: 2, tags: [] })}>
                  Rough patch
                </Button>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                  className="sm:w-[140px]"
                >
                  Add tag
                </Button>
              </div>
              {tags.length ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t.tag}
                      className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs text-white/75"
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
                  <div className="text-lg font-semibold tracking-tight">Trends</div>
                  <div className="mt-2 text-base leading-relaxed text-white/70">
                    Mood, stress, and energy from your check-ins (1–5).
                  </div>
                </div>
              </div>
              <div className="mt-5 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      stroke="rgba(255,255,255,.45)"
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
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
              <div className="mt-4 text-sm text-white/60">
                Tip: consistency matters more than precision—quick check-ins are enough to spot patterns.
              </div>
            </GlassPanel>
          </Stack>

          <Stack className="lg:col-span-5" gap="gap-5">
            <GlassPanel>
              <div className="text-lg font-semibold tracking-tight">Streaks</div>
              <div className="mt-2 text-base leading-relaxed text-white/70">
                Based on mission-path completions.
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                <StreakPill label="Morning" value={streaks.morning} />
                <StreakPill label="Evening" value={streaks.evening} />
                <StreakPill label="Bedtime" value={streaks.bedtime} />
              </div>
            </GlassPanel>

            <GlassPanel>
              <div className="text-lg font-semibold tracking-tight">Compliance Heatmap</div>
              <div className="mt-2 text-base leading-relaxed text-white/70">
                When you tend to complete actions (local-only).
              </div>
              <div className="mt-5">
                <Heatmap grid={heatmap.grid} max={heatmap.max} />
              </div>
            </GlassPanel>

            <GlassPanel className="space-y-3">
              <div>
                <div className="text-lg font-semibold tracking-tight">Adaptive Nudges</div>
                <div className="mt-2 text-base leading-relaxed text-white/70">
                  We only adjust timing on-device based on when you respond.
                </div>
              </div>
              {shiftNotes.length ? (
                <ul className="space-y-2 text-sm text-white/75">
                  {shiftNotes.map((n, i) => (
                    <li key={`${i}_${n}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      {n}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                  As you use the timeline, we’ll adjust nudge timing and show the reason here.
                </div>
              )}
            </GlassPanel>

            <GlassPanel className="space-y-4">
              <div>
                <div className="text-lg font-semibold tracking-tight">Shareable Summary</div>
                <div className="mt-2 text-base leading-relaxed text-white/70">
                  Intentionally non-sensitive; never includes chat transcripts or vault content.
                </div>
              </div>
              <pre className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/85">
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
          </Stack>
        </Grid>
      </Section>
    </Stack>
  )
}
