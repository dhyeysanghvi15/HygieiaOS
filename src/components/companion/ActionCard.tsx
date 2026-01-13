import { Clock, Droplet, ExternalLink, Copy } from 'lucide-react'
import type { CompanionAction } from '../../features/companion/types'
import { cn } from '../../lib/strings'

function iconFor(kind: CompanionAction['kind']) {
  if (kind === 'start_timer') return <Clock className="h-4 w-4" />
  if (kind === 'log_water') return <Droplet className="h-4 w-4" />
  if (kind === 'open_tools' || kind === 'open_vault') return <ExternalLink className="h-4 w-4" />
  return <Copy className="h-4 w-4" />
}

export function ActionCard({
  action,
  onRun,
}: {
  action: CompanionAction
  onRun: (action: CompanionAction) => void
}) {
  return (
    <button
      type="button"
      className={cn(
        'glass flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm text-white/85 transition-colors hover:bg-white/6',
      )}
      onClick={() => onRun(action)}
    >
      <span className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/6">
          {iconFor(action.kind)}
        </span>
        <span>{action.label}</span>
      </span>
      <span className="text-xs text-white/55">Run</span>
    </button>
  )
}

