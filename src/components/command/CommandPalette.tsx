import * as React from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { Search, Home, MessagesSquare, Timer, LineChart, Shield, Lock, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { cn } from '../../lib/strings'
import { useVaultStore } from '../../features/vault/storage'
import { useSettingsStore } from '../../features/settings/store'

type Item = { label: string; hint?: string; icon: React.ReactNode; run: () => void }

export function CommandPalette() {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const lock = useVaultStore((s) => s.lock)
  const { ttsEnabled, set } = useSettingsStore()

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const items: Item[] = [
    { label: 'Go Home', hint: 'Timeline', icon: <Home className="h-4 w-4" />, run: () => navigate('/') },
    {
      label: 'Open Companion',
      icon: <MessagesSquare className="h-4 w-4" />,
      run: () => navigate('/companion'),
    },
    { label: 'Open Tools', icon: <Timer className="h-4 w-4" />, run: () => navigate('/tools') },
    {
      label: 'Open Insights',
      icon: <LineChart className="h-4 w-4" />,
      run: () => navigate('/insights'),
    },
    { label: 'Open Vault', icon: <Shield className="h-4 w-4" />, run: () => navigate('/vault') },
    { label: 'Privacy Lock Now', icon: <Lock className="h-4 w-4" />, run: () => lock() },
    {
      label: ttsEnabled ? 'Disable voice (TTS)' : 'Enable voice (TTS)',
      icon: <Sparkles className="h-4 w-4" />,
      run: () => set('ttsEnabled', !ttsEnabled),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-4 w-4 text-white/75" />
            Command Palette
          </DialogTitle>
          <DialogDescription>Search actions (Ctrl+K)</DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-5">
          <Command
            className="rounded-2xl border border-white/10 bg-white/4 p-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter') setOpen(false)
            }}
          >
            <Command.Input
              aria-label="Search commands"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3 text-sm text-white outline-none placeholder:text-white/45"
              placeholder="Type a command…"
              autoFocus
            />
            <Command.List className="mt-2 max-h-[320px] overflow-auto">
              <Command.Empty className="px-3 py-8 text-center text-sm text-white/60">
                No results.
              </Command.Empty>
              <Command.Group heading="Actions" className="text-xs text-white/50">
                {items.map((it) => (
                  <Command.Item
                    key={it.label}
                    value={it.label}
                    onSelect={() => {
                      it.run()
                      setOpen(false)
                    }}
                    className={cn(
                      'mt-1 flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/80 outline-none transition-colors',
                      'data-[selected=true]:bg-white/8 data-[selected=true]:text-white',
                    )}
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/6">
                      {it.icon}
                    </span>
                    <span className="flex-1">
                      <div>{it.label}</div>
                      {it.hint ? <div className="text-xs text-white/55">{it.hint}</div> : null}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      </DialogContent>
    </Dialog>
  )
}
