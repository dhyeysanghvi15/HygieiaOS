import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, MessagesSquare, Timer, LineChart, Shield } from 'lucide-react'
import { cn } from '../../lib/strings'

const items = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/companion', label: 'Companion', icon: MessagesSquare },
  { to: '/tools', label: 'Tools', icon: Timer },
  { to: '/insights', label: 'Insights', icon: LineChart },
  { to: '/vault', label: 'Vault', icon: Shield },
]

export function DockNav() {
  return (
    <nav
      aria-label="Dock navigation"
      className="fixed bottom-3 left-1/2 z-40 w-[min(720px,calc(100vw-24px))] -translate-x-1/2"
    >
      <div className="glass flex items-center justify-between rounded-2xl px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'relative flex w-full flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs text-white/70 transition-colors hover:text-white',
                isActive && 'text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="dockActive"
                    className="absolute inset-1 rounded-xl bg-white/10"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <Icon className="relative h-5 w-5" aria-hidden="true" />
                <span className="relative">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

