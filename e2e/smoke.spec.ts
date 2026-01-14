import { test, expect } from '@playwright/test'

test('app loads and shows shell', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('WellnessOS')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Dock navigation' })).toBeVisible()
})

test('companion chat, tools timer, vault, and knowledge citations', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'Companion' }).click()
  await expect(page.getByText('Companion Console')).toBeVisible()

  await page.getByLabel('Chat input').fill('/panic')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByText(/Want a 60-second breathing timer/i)).toBeVisible()
  await page.getByRole('button', { name: /Start breathing \(60s\)/i }).click()

  await page.getByRole('link', { name: 'Tools' }).click()
  await expect(page.getByRole('heading', { name: 'Tools' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible()

  await page.getByRole('link', { name: 'Vault' }).click()
  await expect(page.getByRole('heading', { name: 'Vault' })).toBeVisible()
  await expect(page.getByText('Encryption', { exact: true }).first()).toBeVisible()

  await page.getByRole('link', { name: 'Companion' }).click()
  await page.getByLabel('Chat input').fill('How long should I wash my hands?')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByText('Citations')).toBeVisible()
  await expect(page.locator('a').filter({ hasText: 'CDC' })).toBeVisible()
})

test('vault stores encrypted blobs (no plaintext leakage)', async ({ page, context }) => {
  await page.goto('/#/companion')
  const secret = 'my super secret journal text'
  await page.getByLabel('Chat input').fill(secret)
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByText(/Tell me what you want/i)).toBeVisible()

  type VaultRecordLike = { id: string; kind: string; createdAt: number; payload: { ivB64: string; ctB64: string } }

  const records = await page.evaluate(async (): Promise<VaultRecordLike[]> => {
    function openDb(name: string) {
      return new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(name)
        req.onerror = () => reject(req.error)
        req.onsuccess = () => resolve(req.result)
      })
    }
    const db = await openDb('wellnessos_vault_v1')
    const tx = db.transaction('records', 'readonly')
    const store = tx.objectStore('records')
    const all = await new Promise<VaultRecordLike[]>((resolve, reject) => {
      const r = store.getAll()
      r.onerror = () => reject(r.error)
      r.onsuccess = () => resolve(r.result as VaultRecordLike[])
    })
    return all
  })

  expect(records.length).toBeGreaterThan(0)
  const raw = JSON.stringify(records)
  expect(raw).not.toContain(secret)

  await page.goto('/#/vault')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export encrypted backup' }).click()
  const dl = await downloadPromise
  const path = await dl.path()
  expect(path).toBeTruthy()

  // Read downloaded bytes and ensure plaintext secret isn't present.
  if (path) {
    const fs = await import('node:fs')
    const buf = fs.readFileSync(path)
    expect(buf.toString('utf8')).not.toContain(secret)
    // basic sanity: export is an encrypted payload wrapper
    expect(buf.toString('utf8')).toContain('ctB64')
  }

  await context.clearCookies()
})
