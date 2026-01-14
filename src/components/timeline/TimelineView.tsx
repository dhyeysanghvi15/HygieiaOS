import { motion } from 'framer-motion'
import { CheckpointCard } from './CheckpointCard'
import { Button } from '../ui/button'
import { Droplet, Sun, MoonStar, BedDouble, Sparkles } from 'lucide-react'
import { useCheckinsStore } from '../../features/checkins/store'
import { PageHeader } from '../common/PageHeader'
import { Section } from '../common/Section'
import { Stack } from '../common/Stack'

export type CheckpointAction =
  | { kind: 'timer'; timerId: 'brush' | 'handwash' | 'breath60' | 'breath120' | 'focus25'; label: string }
  | { kind: 'water'; ml: number; label: string }
  | { kind: 'checkin'; label: string }

export type Checkpoint = {
  id: 'morning' | 'day' | 'evening' | 'bedtime'
  title: string
  why: string
  icon: React.ReactNode
  actions: readonly CheckpointAction[]
}

const checkpoints: readonly Checkpoint[] = [
  {
    id: 'morning',
    title: 'Morning Reset',
    why: 'Prime your day with small wins and clean inputs.',
    icon: <Sun className="h-5 w-5" />,
    actions: [
      { kind: 'timer', timerId: 'brush', label: 'Brush (2 min)' },
      { kind: 'water', ml: 250, label: 'Water +250 ml' },
    ],
  },
  {
    id: 'day',
    title: 'Day Hygiene',
    why: 'Prevent drift: hydration, hand hygiene, focus blocks.',
    icon: <Droplet className="h-5 w-5" />,
    actions: [
      { kind: 'timer', timerId: 'handwash', label: 'Handwash (20s)' },
      { kind: 'timer', timerId: 'focus25', label: 'Focus (25m)' },
    ],
  },
  {
    id: 'evening',
    title: 'Evening Winddown',
    why: 'Lower stimulation and protect sleep quality.',
    icon: <MoonStar className="h-5 w-5" />,
    actions: [
      { kind: 'timer', timerId: 'breath120', label: 'Breathing (2m)' },
      { kind: 'checkin', label: 'Quick check-in' },
    ],
  },
  {
    id: 'bedtime',
    title: 'Bedtime Seal',
    why: 'Close the day: brush, floss, and a calm landing.',
    icon: <BedDouble className="h-5 w-5" />,
    actions: [
      { kind: 'timer', timerId: 'brush', label: 'Brush (2 min)' },
      { kind: 'timer', timerId: 'breath60', label: 'Breathing (60s)' },
    ],
  },
] as const

export function TimelineView() {
  const addWater = useCheckinsStore((s) => s.addWater)
  return (
    <Stack gap="gap-6 sm:gap-8">
      <Section className="pt-0">
        <PageHeader
          title="Home"
          subtitle="Your daily mission path: pick a checkpoint, choose intensity, and keep momentum with tiny wins."
          actions={
            <Button variant="primary" onClick={() => addWater(250)} aria-label="Log 250 milliliters water">
              <Sparkles className="h-4 w-4" />
              Log +250ml
            </Button>
          }
        />
      </Section>

      <Section className="pt-0">
        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-px bg-white/10 sm:left-6" aria-hidden="true" />
          <div className="space-y-4 sm:space-y-5">
            {checkpoints.map((c, idx) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 240, damping: 26 }}
              >
                <div className="mb-2 pl-10 sm:pl-12">
                  <div className="text-xs font-semibold tracking-wide text-white/55">
                    {c.id === 'morning'
                      ? 'MORNING'
                      : c.id === 'day'
                        ? 'DAY'
                        : c.id === 'evening'
                          ? 'EVENING'
                          : 'BEDTIME'}
                  </div>
                </div>
                <CheckpointCard checkpoint={c} />
              </motion.div>
            ))}
          </div>
        </div>
      </Section>
    </Stack>
  )
}
