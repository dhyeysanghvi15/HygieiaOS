import { motion } from 'framer-motion'
import { Mic, Sparkles } from 'lucide-react'
import { cn } from '../../lib/strings'
import { useCompanionUIStore } from '../../features/companion/uiStore'

export function CompanionOrb() {
  const dockOpen = useCompanionUIStore((s) => s.dockOpen)
  const listening = useCompanionUIStore((s) => s.listening)
  const setDockOpen = useCompanionUIStore((s) => s.setDockOpen)

  return (
    <button
      type="button"
      aria-label={dockOpen ? 'Close companion' : 'Open companion'}
      onClick={() => setDockOpen(!dockOpen)}
      className="fixed bottom-[calc(92px+env(safe-area-inset-bottom))] right-4 z-50 sm:bottom-[calc(96px+env(safe-area-inset-bottom))]"
    >
      <motion.div
        className={cn(
          'grid h-14 w-14 place-items-center rounded-full border border-white/12 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,.35),rgba(10,14,28,.7)_62%)] shadow-glass',
          listening && 'shadow-glow',
        )}
        animate={listening ? { scale: [1, 1.07, 1] } : { scale: [1, 1.04, 1] }}
        transition={{ duration: listening ? 0.8 : 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {listening ? <Mic className="h-6 w-6 text-white" /> : <Sparkles className="h-6 w-6 text-white" />}
      </motion.div>
    </button>
  )
}
