import { motion, AnimatePresence } from 'framer-motion'
import { useCompanionUIStore } from '../../features/companion/uiStore'
import { CompanionConsole } from './CompanionConsole'

export function CompanionDock() {
  const dockOpen = useCompanionUIStore((s) => s.dockOpen)
  const setDockOpen = useCompanionUIStore((s) => s.setDockOpen)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-[78px] left-1/2 z-40 w-[min(920px,calc(100vw-24px))] -translate-x-1/2 px-3 sm:bottom-[82px]"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
      >
        <button
          type="button"
          className="glass flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left"
          onClick={() => setDockOpen(true)}
          aria-label="Open companion console"
        >
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white/90">Ask the companion…</div>
            <div className="mt-0.5 truncate text-xs text-white/60">
              Try “/morning”, “how long should I wash hands?”, or “start a 60s breathing timer”.
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/70">
            Tap
          </span>
        </button>
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
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-[1040px] p-3"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass h-[min(78vh,720px)] rounded-2xl p-3">
              <div className="flex h-full flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold">Companion</div>
                  <button
                    type="button"
                    className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/70 hover:bg-white/8"
                    onClick={() => setDockOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <CompanionConsole compactHeader />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
