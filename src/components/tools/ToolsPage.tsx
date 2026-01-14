import { TimerCard } from './TimerCard'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import { useTimersStore } from '../../features/timers/timers'
import { Zap } from 'lucide-react'
import { RoutinesPanel } from './RoutinesPanel'
import type { RoutineStep } from '../../features/routine/models'
import { useCompanionStore } from '../../features/companion/store'
import { useCompanionUIStore } from '../../features/companion/uiStore'
import type { CompanionAction } from '../../features/companion/types'
import { PageHeader } from '../common/PageHeader'
import { Section } from '../common/Section'
import { Stack } from '../common/Stack'
import { Grid } from '../common/Grid'

export function ToolsPage() {
  const navigate = useNavigate()
  const start = useTimersStore((s) => s.startPreset)
  const addAssistant = useCompanionStore((s) => s.addAssistant)
  const setDockOpen = useCompanionUIStore((s) => s.setDockOpen)

  function startRoutine(title: string, steps: RoutineStep[]) {
    const actions: CompanionAction[] = []
    for (const s of steps) {
      if (s.kind === 'timer' && s.seconds) {
        actions.push({
          kind: 'start_timer',
          label: s.label,
          timer: { id: s.id, label: s.label, seconds: s.seconds },
        })
      }
      if (s.kind === 'action' && /water/i.test(s.label)) {
        actions.push({ kind: 'log_water', label: 'Log +250ml', ml: 250 })
      }
    }
    addAssistant({
      text: `${title}\n\n${steps.map((s, i) => `${i + 1}) ${s.label}`).join('\n')}`,
      risk: { tier: 'green', reasons: [] },
      actions,
      citations: [],
    })
    setDockOpen(true)
    navigate('/companion')
  }

  return (
    <Stack gap="gap-6 sm:gap-8">
      <Section className="pt-0">
        <PageHeader
          title="Tools"
          subtitle="Launch timers and routines instantly. Keep it simple, repeatable, and low-friction."
          actions={
            <Button
              variant="primary"
              onClick={() => start({ id: 'rescue', label: '2-minute rescue', seconds: 120 })}
            >
              <Zap className="h-4 w-4" />
              2-minute rescue
            </Button>
          }
        />
      </Section>

      <Section className="pt-0">
        <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" gap="gap-4 sm:gap-5">
          <TimerCard
            title="Brush"
            subtitle="Gentle 2-minute timer with technique pacing."
            preset={{ id: 'brush', label: 'Brush (2 min)', seconds: 120 }}
            tips={[
              'Use gentle circular motions at the gumline.',
              'Cover 4 quadrants: 30 seconds each.',
              'Don’t forget tongue brushing if comfortable.',
            ]}
          />
          <TimerCard
            title="Handwash"
            subtitle="20 seconds (sing a short chorus)."
            preset={{ id: 'handwash', label: 'Handwash (20s)', seconds: 20 }}
            tips={[
              'Soap + water is best when hands are visibly dirty.',
              'Scrub thumbs and between fingers.',
              'Dry with a clean towel.',
            ]}
          />
          <TimerCard
            title="Breathing"
            subtitle="60 seconds of gentle pacing."
            preset={{ id: 'breath60', label: 'Breathing (60s)', seconds: 60 }}
            tips={[
              'Inhale 4 seconds, exhale 6 seconds.',
              'Relax shoulders; unclench jaw.',
              'If dizzy, slow down and breathe normally.',
            ]}
          />
          <TimerCard
            title="Focus"
            subtitle="Pomodoro 25 minutes."
            preset={{ id: 'focus25', label: 'Focus (25m)', seconds: 25 * 60 }}
            tips={['Pick one task; write it down.', 'Mute notifications during the timer.', 'Take a 2–5 minute break afterward.']}
          />
        </Grid>
      </Section>

      <Section className="pt-0">
        <RoutinesPanel onStartRoutine={startRoutine} />
      </Section>
    </Stack>
  )
}
