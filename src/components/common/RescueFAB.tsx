import { Zap } from 'lucide-react'
import { useTimersStore } from '../../features/timers/timers'
import { useCompanionStore } from '../../features/companion/store'

export function RescueFAB() {
  const start = useTimersStore((s) => s.startPreset)
  const addAssistant = useCompanionStore((s) => s.addAssistant)

  return (
    <button
      type="button"
      className="fixed bottom-[calc(92px+env(safe-area-inset-bottom))] left-4 z-50 grid h-12 w-12 place-items-center rounded-full border border-white/12 bg-accent-2/20 text-white shadow-glow backdrop-blur-xl hover:bg-accent-2/26 sm:bottom-[calc(96px+env(safe-area-inset-bottom))]"
      aria-label="Start 2-minute rescue"
      onClick={() => {
        start({ id: 'rescue', label: '2-minute rescue', seconds: 120 })
        addAssistant({
          text:
            '2-minute rescue started.\n\n1) 60s breathing (in 4 / out 6)\n2) small sip of water\n3) name 3 things you can see\n\nWant me to guide you step-by-step?',
          risk: { tier: 'green', reasons: [] },
          actions: [
            { kind: 'start_timer', label: 'Breathing (60s)', timer: { id: 'breath60', label: 'Breathing (60s)', seconds: 60 } },
            { kind: 'log_water', label: 'Log +150ml', ml: 150 },
          ],
          citations: [],
        })
      }}
    >
      <Zap className="h-5 w-5" />
    </button>
  )
}
