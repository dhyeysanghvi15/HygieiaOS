import * as React from 'react'
import { Mic, Send, Slash, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { cn } from '../../lib/strings'
import { useSettingsStore } from '../../features/settings/store'
import { getDayMode } from '../../lib/date'
import { useCheckinsStore } from '../../features/checkins/store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'

type Suggestion = { label: string; text: string }

const BASE: Suggestion[] = [
  { label: 'Brush timer (2m)', text: 'Start a 2 minute brush timer.' },
  { label: 'Handwash (20s)', text: 'Start a 20 second handwash timer.' },
  { label: 'Breathing (60s)', text: 'Start a 60 second breathing timer.' },
  { label: 'Focus 25', text: '/focus 25' },
  { label: 'Hydrate', text: '/hydrate' },
  { label: 'Morning', text: '/morning' },
  { label: 'Sleep', text: '/sleep' },
  { label: 'Panic', text: '/panic' },
]

export function InputBar({
  value,
  onChange,
  onSend,
  onStartVoice,
  voiceAvailable,
  busy,
}: {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  onStartVoice: () => void
  voiceAvailable: boolean
  busy: boolean
}) {
  const { ttsEnabled, set, whisperMode } = useSettingsStore()
  const hydration = useCheckinsStore((s) => s.hydration)
  const dayMode = getDayMode()
  const [radialOpen, setRadialOpen] = React.useState(false)

  const showCommands = value.trim().startsWith('/')
  const suggestions = (() => {
    const deficit = hydration.goalMl - hydration.waterMlToday
    const order: Suggestion[] =
      dayMode === 'Morning'
        ? [BASE[5], BASE[0], BASE[4], BASE[2], BASE[3], BASE[1], BASE[6], BASE[7]]
        : dayMode === 'Day'
          ? [BASE[3], BASE[1], BASE[4], BASE[2], BASE[0], BASE[5], BASE[6], BASE[7]]
          : dayMode === 'Evening'
            ? [BASE[6], BASE[2], BASE[0], BASE[4], BASE[1], BASE[3], BASE[5], BASE[7]]
            : [BASE[6], BASE[2], BASE[0], BASE[4], BASE[7], BASE[5], BASE[1], BASE[3]]
    if (deficit > 800) {
      const hydrate = BASE[4]
      return [hydrate, ...order.filter((s) => s !== hydrate)]
    }
    return order
  })()

  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-auto pb-1">
        {suggestions.slice(0, 6).map((s) => (
          <button
            key={s.label}
            type="button"
            className="whitespace-nowrap rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/75 hover:bg-white/8"
            onClick={() => onChange(s.text)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend()
            }
          }}
          placeholder="Type or use push-to-talk…"
          aria-label="Chat input"
        />

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => set('ttsEnabled', !ttsEnabled)}
          aria-label={ttsEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
          disabled={whisperMode}
        >
          {ttsEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => onChange(value ? '' : '/')}
          aria-label="Insert slash command"
        >
          <Slash className="h-5 w-5" />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setRadialOpen(true)}
          aria-label="Open quick actions"
        >
          <Sparkles className="h-5 w-5" />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onStartVoice}
          aria-label={voiceAvailable ? 'Push to talk' : 'Voice not available'}
          disabled={!voiceAvailable}
        >
          <Mic className="h-5 w-5" />
        </Button>

        <Button type="button" size="icon" variant="primary" onClick={onSend} aria-label="Send" disabled={busy}>
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {showCommands ? (
        <div className={cn('glass rounded-2xl p-3 text-xs text-white/75')}>
          <div className="flex items-center gap-2 font-semibold text-white/85">
            <Sparkles className="h-4 w-4" /> Slash commands
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {suggestions.filter((s) => s.text.startsWith('/')).map((s) => (
              <button
                key={s.text}
                type="button"
                className="rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-left hover:bg-white/8"
                onClick={() => onChange(s.text)}
              >
                <div className="font-mono text-[12px] text-white">{s.text}</div>
                <div className="text-white/60">{s.label}</div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <Dialog open={radialOpen} onOpenChange={setRadialOpen}>
        <DialogContent className="max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Quick Actions</DialogTitle>
            <DialogDescription>Pick one to insert into the input.</DialogDescription>
          </DialogHeader>
          <div className="relative mx-auto mt-2 h-[260px] w-[260px]">
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid h-20 w-20 place-items-center rounded-full border border-white/12 bg-white/8 text-sm font-semibold text-white/85">
                Now
              </div>
            </div>
            <RadialButton pos="top" label="Brush" onClick={() => onChange('Start a 2 minute brush timer.')} />
            <RadialButton pos="right" label="Hands" onClick={() => onChange('Start a 20 second handwash timer.')} />
            <RadialButton pos="bottom" label="Breathe" onClick={() => onChange('Start a 60 second breathing timer.')} />
            <RadialButton pos="left" label="Focus" onClick={() => onChange('/focus 25')} />
            <RadialButton pos="tr" label="Hydrate" onClick={() => onChange('/hydrate')} />
            <RadialButton pos="bl" label="Sleep" onClick={() => onChange('/sleep')} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setRadialOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RadialButton({
  pos,
  label,
  onClick,
}: {
  pos: 'top' | 'right' | 'bottom' | 'left' | 'tr' | 'bl'
  label: string
  onClick: () => void
}) {
  const cls =
    pos === 'top'
      ? 'left-1/2 top-1 -translate-x-1/2'
      : pos === 'right'
        ? 'right-1 top-1/2 -translate-y-1/2'
        : pos === 'bottom'
          ? 'left-1/2 bottom-1 -translate-x-1/2'
          : pos === 'left'
            ? 'left-1 top-1/2 -translate-y-1/2'
            : pos === 'tr'
              ? 'right-7 top-7'
              : 'left-7 bottom-7'
  return (
    <button
      type="button"
      className={cn(
        'absolute grid h-16 w-16 place-items-center rounded-full border border-white/12 bg-white/8 text-xs text-white/80 shadow-glass hover:bg-white/10',
        cls,
      )}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
