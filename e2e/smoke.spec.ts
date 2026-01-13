import { test, expect } from '@playwright/test'

test('app loads and shows shell', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('WellnessOS')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Dock navigation' })).toBeVisible()
})

