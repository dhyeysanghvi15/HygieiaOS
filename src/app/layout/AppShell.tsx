import { Outlet } from 'react-router-dom'
import { DockNav } from '../../components/navigation/DockNav'
import { TopStatusBar } from '../../components/navigation/TopStatusBar'
import { CompanionOrb } from '../../components/companion/CompanionOrb'
import { CompanionDock } from '../../components/companion/CompanionDock'
import { CommandPalette } from '../../components/command/CommandPalette'
import { useEffect, useState } from 'react'
import { useVaultStore } from '../../features/vault/storage'
import { useSettingsStore } from '../../features/settings/store'
import { RescueFAB } from '../../components/common/RescueFAB'
import { Container } from '../../components/common/Container'
import { cn } from '../../lib/strings'

export function AppShell() {
  const initVault = useVaultStore((s) => s.init)
  const lock = useVaultStore((s) => s.lock)
  const status = useVaultStore((s) => s.status)
  const touch = useVaultStore((s) => s.touch)
  const lastActiveAt = useVaultStore((s) => s.lastActiveAt)
  const lockPolicy = useSettingsStore((s) => s.lockPolicy)
  const [debugLayout, setDebugLayout] = useState(
    () => import.meta.env.DEV && localStorage.getItem('wellnessos_debug_layout') === '1',
  )

  useEffect(() => {
    void initVault()
  }, [initVault])

  useEffect(() => {
    const onActivity = () => touch()
    window.addEventListener('pointerdown', onActivity, { passive: true })
    window.addEventListener('keydown', onActivity)
    return () => {
      window.removeEventListener('pointerdown', onActivity)
      window.removeEventListener('keydown', onActivity)
    }
  }, [touch])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'hidden' && lockPolicy.lockOnBackground) lock()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [lock, lockPolicy.lockOnBackground])

  useEffect(() => {
    if (status !== 'unlocked') return
    const ms = Math.max(1, lockPolicy.lockTimeoutMinutes) * 60_000
    const h = window.setInterval(() => {
      if (Date.now() - lastActiveAt > ms) lock()
    }, 2_000)
    return () => window.clearInterval(h)
  }, [lastActiveAt, lock, lockPolicy.lockTimeoutMinutes, status])

  return (
    <div className={cn('min-h-dvh w-full', debugLayout ? 'debug-layout' : '')}>
      <Container className="pt-4 sm:pt-6">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-12">
            <TopStatusBar />
          </div>
          <main className="lg:col-span-12 pb-[calc(9.5rem+env(safe-area-inset-bottom))]">
            <Outlet />
          </main>
        </div>
      </Container>
      <CompanionDock />
      <CompanionOrb />
      <RescueFAB />
      <DockNav />
      <CommandPalette />

      {import.meta.env.DEV ? (
        <button
          type="button"
          className="fixed left-3 top-3 z-[60] rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
          onClick={() => {
            const next = !debugLayout
            setDebugLayout(next)
            localStorage.setItem('wellnessos_debug_layout', next ? '1' : '0')
          }}
        >
          Layout debug: {debugLayout ? 'ON' : 'OFF'}
        </button>
      ) : null}
    </div>
  )
}
