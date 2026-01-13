import { Outlet } from 'react-router-dom'
import { DockNav } from '../../components/navigation/DockNav'
import { TopStatusBar } from '../../components/navigation/TopStatusBar'
import { CompanionOrb } from '../../components/companion/CompanionOrb'
import { CompanionDock } from '../../components/companion/CompanionDock'
import { CommandPalette } from '../../components/command/CommandPalette'
import { useEffect } from 'react'
import { useVaultStore } from '../../features/vault/storage'
import { useSettingsStore } from '../../features/settings/store'
import { RescueFAB } from '../../components/common/RescueFAB'

export function AppShell() {
  const initVault = useVaultStore((s) => s.init)
  const lock = useVaultStore((s) => s.lock)
  const status = useVaultStore((s) => s.status)
  const touch = useVaultStore((s) => s.touch)
  const lastActiveAt = useVaultStore((s) => s.lastActiveAt)
  const lockPolicy = useSettingsStore((s) => s.lockPolicy)

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
    <div className="min-h-dvh w-full">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1040px] flex-col px-3 pb-28 pt-3 sm:px-4">
        <TopStatusBar />
        <main className="mt-3 flex-1">
          <Outlet />
        </main>
      </div>
      <CompanionDock />
      <CompanionOrb />
      <RescueFAB />
      <DockNav />
      <CommandPalette />
    </div>
  )
}
