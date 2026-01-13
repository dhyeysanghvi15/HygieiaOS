import { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { GlassPanel } from '../common/GlassPanel'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Trash2, Plus, GripVertical, Sparkles } from 'lucide-react'
import { DefaultRoutines, type RoutineStep } from '../../features/routine/models'
import { useRoutineStore } from '../../features/routine/scheduler'

export function RoutinesPanel({
  onStartRoutine,
}: {
  onStartRoutine: (title: string, steps: RoutineStep[]) => void
}) {
  const routines = useRoutineStore((s) => s.routines)
  const saveRoutine = useRoutineStore((s) => s.saveRoutine)
  const deleteRoutine = useRoutineStore((s) => s.deleteRoutine)

  const templates = useMemo(
    () => [
      DefaultRoutines.morning,
      DefaultRoutines.study,
      DefaultRoutines.sleep,
      DefaultRoutines.rescue,
    ],
    [],
  )

  return (
    <div className="space-y-3">
      <GlassPanel>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Routines</div>
            <div className="mt-1 text-sm text-white/70">
              Start a template, or build your own drag-and-drop routine.
            </div>
          </div>
          <RoutineBuilder
            trigger={<Button variant="primary">Create routine</Button>}
            onSave={(title, steps) => saveRoutine(title, steps)}
          />
        </div>
      </GlassPanel>

      <div className="grid gap-3 md:grid-cols-2">
        {templates.map((t) => (
          <GlassPanel key={t.title} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold">{t.title}</div>
                <div className="mt-1 text-sm text-white/70">{t.steps.map((s) => s.label).join(' · ')}</div>
              </div>
              <Sparkles className="h-5 w-5 text-white/70" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => onStartRoutine(t.title, t.steps)}>
                Start
              </Button>
              <Button onClick={() => saveRoutine(t.title, t.steps)}>Save</Button>
            </div>
          </GlassPanel>
        ))}
      </div>

      <GlassPanel className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Saved Routines</div>
            <div className="mt-1 text-sm text-white/70">
              These are stored locally (not in the vault unless you choose to store them).
            </div>
          </div>
        </div>
        {routines.length ? (
          <div className="grid gap-2 md:grid-cols-2">
            {routines.map((r) => (
              <div key={r.id} className="glass rounded-2xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{r.title}</div>
                    <div className="mt-1 truncate text-xs text-white/60">
                      {r.steps.map((s) => s.label).join(' · ')}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/6 text-white/75 hover:bg-white/8"
                    aria-label="Delete routine"
                    onClick={() => deleteRoutine(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3">
                  <Button variant="primary" onClick={() => onStartRoutine(r.title, r.steps)} className="w-full">
                    Start routine
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
            No saved routines yet. Create one or save a template above.
          </div>
        )}
      </GlassPanel>
    </div>
  )
}

function RoutineBuilder({
  trigger,
  onSave,
}: {
  trigger: React.ReactNode
  onSave: (title: string, steps: RoutineStep[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('My Routine')
  const [steps, setSteps] = useState<RoutineStep[]>([
    { id: 'brush', label: 'Brush (2 min)', kind: 'timer', seconds: 120 },
    { id: 'water', label: 'Water (250ml)', kind: 'action' },
  ])

  function move(from: number, to: number) {
    setSteps((s) => {
      const next = [...s]
      const [it] = next.splice(from, 1)
      next.splice(to, 0, it)
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Routine Builder</DialogTitle>
          <DialogDescription>Drag steps to reorder. Keep it small and repeatable.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Routine title" />

          <div className="space-y-2">
            {steps.map((s, idx) => (
              <div
                key={`${s.id}_${idx}`}
                className="glass flex items-center gap-2 rounded-2xl p-3"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', String(idx))
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const from = Number(e.dataTransfer.getData('text/plain'))
                  if (Number.isFinite(from)) move(from, idx)
                }}
              >
                <GripVertical className="h-4 w-4 text-white/55" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{s.label}</div>
                  <div className="text-xs text-white/60">
                    {s.kind === 'timer' ? `${s.seconds ?? 0}s timer` : s.kind === 'note' ? 'note' : 'action'}
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/70 hover:bg-white/8"
                  onClick={() => setSteps((prev) => prev.filter((_, i) => i !== idx))}
                  aria-label="Remove step"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() =>
                setSteps((s) => [...s, { id: `timer_${Date.now()}`, label: 'Timer (60s)', kind: 'timer', seconds: 60 }])
              }
            >
              <Plus className="h-4 w-4" /> Add timer
            </Button>
            <Button
              onClick={() => setSteps((s) => [...s, { id: `note_${Date.now()}`, label: 'Note', kind: 'note' }])}
            >
              <Plus className="h-4 w-4" /> Add note
            </Button>
            <Button
              onClick={() => setSteps((s) => [...s, { id: `action_${Date.now()}`, label: 'Action', kind: 'action' }])}
            >
              <Plus className="h-4 w-4" /> Add action
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                const safeTitle = title.trim() || 'My Routine'
                const normalized = steps
                  .map((s) => ({ ...s, label: s.label.trim() || 'Step' }))
                  .filter((s) => s.label.trim())
                onSave(safeTitle, normalized)
                setOpen(false)
              }}
              disabled={!steps.length}
            >
              Save routine
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
