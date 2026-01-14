import { motion, AnimatePresence } from 'framer-motion'
import { useCompanionUIStore } from '../../features/companion/uiStore'
import { CompanionConsole } from './CompanionConsole'
import { Container } from '../common/Container'

export function CompanionDock() {
  const dockOpen = useCompanionUIStore((s) => s.dockOpen)
  const setDockOpen = useCompanionUIStore((s) => s.setDockOpen)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-[calc(84px+env(safe-area-inset-bottom))] left-0 right-0 z-40"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
      >
        <Container>
          <button
            type="button"
            className="glass flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left sm:px-5"
            onClick={() => setDockOpen(true)}
            aria-label="Open companion console"
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white/90">Ask the companion…</div>
              <div className="mt-0.5 truncate text-xs text-white/60 sm:text-sm sm:leading-snug">
                Try “/morning”, “how long should I wash hands?”, or “start a 60s breathing timer”.
              </div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/70">
              Open
            </span>
          </button>
        </Container>
      </motion.div>

      {dockOpen ? (
        <motion.div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setDockOpen(false)}
        >
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Container className="pb-[max(12px,env(safe-area-inset-bottom))]">
              <div className="glass h-[min(84vh,760px)] rounded-2xl p-3 sm:p-4 lg:ml-auto lg:w-[min(520px,100%)]">
                <div className="mb-2 flex items-center justify-between px-1">
                  <div className="text-sm font-semibold text-white/90">Companion</div>
                  <button
                    type="button"
                    className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs text-white/70 hover:bg-white/8"
                    onClick={() => setDockOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <CompanionConsole compactHeader />
              </div>
            </Container>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
