import { GlassPanel } from '../common/GlassPanel'
import { Switch } from '../ui/switch'
import { Button } from '../ui/button'
import { useSettingsStore } from '../../features/settings/store'
import { useVaultStore } from '../../features/vault/storage'
import { Input } from '../ui/input'
import { useState } from 'react'
import { downloadBytes } from '../../features/vault/export'
import { IntegrityStatus } from './IntegrityStatus'

export function PrivacyCockpit() {
  const { storage, setStorage, lockPolicy, setLockPolicy } = useSettingsStore()
  const { status, mode, lock, unlockWithPasscode, unlockDevice, setPasscode, verifyIntegrity, exportEncryptedBackup, deleteEverything, getContact, upsertContact } =
    useVaultStore()
  const locked = status === 'locked'
  const [passcode, setPasscodeInput] = useState('')
  const [newPasscode, setNewPasscodeInput] = useState('')
  const [integrity, setIntegrity] = useState<Awaited<ReturnType<typeof verifyIntegrity>> | null>(null)
  const [contactName, setContactName] = useState('')
  const [contactHandle, setContactHandle] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')

  return (
    <div className="space-y-3">
      <GlassPanel className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Privacy Cockpit</div>
          <div className="mt-1 text-sm text-white/70">
            Encryption, storage toggles, and integrity verification live here.
          </div>
        </div>
        <Button variant={locked ? 'primary' : 'default'} onClick={() => (locked ? unlockDevice() : lock())}>
          {locked ? 'Unlock (device)' : 'Lock'}
        </Button>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <div className="text-sm font-semibold">Encryption Status</div>
        <div className="text-sm text-white/70">
          Vault is <span className="font-semibold">{locked ? 'LOCKED' : 'UNLOCKED'}</span>. Mode:{' '}
          <span className="font-semibold">{mode.toUpperCase()}</span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-white/75">Unlock with passcode</div>
            <Input
              type="password"
              value={passcode}
              onChange={(e) => setPasscodeInput(e.target.value)}
              placeholder="Passcode"
              aria-label="Vault passcode"
            />
            <Button
              onClick={async () => {
                const r = await unlockWithPasscode(passcode)
                if (!r.ok) alert(r.error)
                setPasscodeInput('')
              }}
              disabled={!passcode}
            >
              Unlock
            </Button>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold text-white/75">Set/Change passcode</div>
            <Input
              type="password"
              value={newPasscode}
              onChange={(e) => setNewPasscodeInput(e.target.value)}
              placeholder="New passcode"
              aria-label="New vault passcode"
            />
            <Button
              variant="primary"
              onClick={async () => {
                const r = await setPasscode(newPasscode)
                if (!r.ok) alert(r.error)
                setNewPasscodeInput('')
              }}
              disabled={!newPasscode}
            >
              Set passcode
            </Button>
          </div>
        </div>
        {mode === 'device' ? (
          <div className="rounded-2xl border border-accent-warn/30 bg-accent-warn/10 p-3 text-sm text-white/80">
            Device-key mode encrypts data, but a passcode is stronger if your device is compromised.
          </div>
        ) : null}
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <div>
          <div className="text-sm font-semibold">Store In Vault</div>
          <div className="mt-1 text-sm text-white/70">
            Toggle what gets stored in the encrypted vault. You can export or delete everything any time.
          </div>
        </div>

        <Row
          label="Chat history"
          checked={storage.saveChatHistory}
          onCheckedChange={(v) => setStorage('saveChatHistory', v)}
        />
        <Row
          label="Voice transcripts"
          checked={storage.saveVoiceTranscripts}
          onCheckedChange={(v) => setStorage('saveVoiceTranscripts', v)}
        />
        <Row
          label="Journals"
          checked={storage.saveJournals}
          onCheckedChange={(v) => setStorage('saveJournals', v)}
        />
        <Row
          label="Check-ins"
          checked={storage.saveCheckins}
          onCheckedChange={(v) => setStorage('saveCheckins', v)}
        />
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <div>
          <div className="text-sm font-semibold">Lock Settings</div>
          <div className="mt-1 text-sm text-white/70">
            Automatically lock sensitive views when the app is backgrounded.
          </div>
        </div>
        <Row
          label="Lock when app is backgrounded"
          checked={lockPolicy.lockOnBackground}
          onCheckedChange={(v) => setLockPolicy('lockOnBackground', v)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-white/70">Lock timeout:</span>
          {[1, 5, 10, 30].map((m) => (
            <button
              key={m}
              type="button"
              className={
                lockPolicy.lockTimeoutMinutes === m
                  ? 'rounded-full border border-accent/30 bg-accent/12 px-3 py-1 text-xs text-white shadow-glow'
                  : 'rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/70 hover:bg-white/8'
              }
              onClick={() => setLockPolicy('lockTimeoutMinutes', m)}
            >
              {m}m
            </button>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <div>
          <div className="text-sm font-semibold">Trusted Contact</div>
          <div className="mt-1 text-sm text-white/70">
            Stored encrypted. Used only to generate copyable crisis templates (no auto-sending).
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Name" />
          <Input value={contactHandle} onChange={(e) => setContactHandle(e.target.value)} placeholder="Phone/email" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            disabled={locked || !contactHandle.trim()}
            onClick={async () => {
              await upsertContact({ name: contactName.trim() || 'Trusted contact', handle: contactHandle.trim() })
              alert('Saved.')
            }}
          >
            Save
          </Button>
          <Button
            disabled={locked}
            onClick={async () => {
              const c = await getContact()
              if (!c) return alert('No contact stored.')
              setContactName(c.name)
              setContactHandle(c.handle)
            }}
          >
            Load
          </Button>
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <div className="text-sm font-semibold">Integrity</div>
        <div className="text-sm text-white/70">
          Vault writes are chained with a hash ledger. Verification detects tampering.
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={async () => {
              const res = await verifyIntegrity()
              setIntegrity(res)
            }}
          >
            Verify Integrity
          </Button>
          <Button
            onClick={async () => {
              if (locked) return alert('Unlock the vault first.')
              const bytes = await exportEncryptedBackup()
              downloadBytes(bytes, `wellnessos-vault-backup.${new Date().toISOString().slice(0, 10)}.json.enc`)
            }}
          >
            Export Encrypted Backup
          </Button>
        </div>
        {integrity ? <IntegrityStatus result={integrity} /> : null}
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <div className="text-sm font-semibold">Delete Everything</div>
        <div className="text-sm text-white/70">
          This deletes vault records and regenerates a fresh vault. Type DELETE to confirm.
        </div>
        <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="Type DELETE" />
        <Button
          variant="danger"
          disabled={deleteConfirm !== 'DELETE'}
          onClick={async () => {
            await deleteEverything()
            setDeleteConfirm('')
            alert('Deleted.')
          }}
        >
          Delete everything
        </Button>
      </GlassPanel>

      <GlassPanel className="space-y-2">
        <div className="text-sm font-semibold">How we protect your data</div>
        <details className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-white/85">Encryption</summary>
          <div className="mt-2 text-sm text-white/70">
            Records are encrypted locally with AES-GCM. With a passcode, keys are derived with PBKDF2 + a per-vault
            salt.
          </div>
        </details>
        <details className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-white/85">Integrity</summary>
          <div className="mt-2 text-sm text-white/70">
            Each record append updates a hash-chain ledger. Verification detects removed/edited entries.
          </div>
        </details>
        <details className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-white/85">No auto-sharing</summary>
          <div className="mt-2 text-sm text-white/70">
            The app never sends your vault data anywhere. Exports require an explicit download action.
          </div>
        </details>
      </GlassPanel>
    </div>
  )
}

function Row({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-white/85">{label}</div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  )
}
