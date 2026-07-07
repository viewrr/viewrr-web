import { test, expect } from '@playwright/test'

// Payments opt-in panel: read-only, default OFF, no money-movement UI (legal #9).
test('settings payments panel renders opted-out by default and stays read-only', async ({
  page,
}) => {
  await page.goto('/settings')

  await expect(page.getByRole('heading', { name: 'Payments' })).toBeVisible()

  const toggle = page.getByRole('switch', { name: 'Enable payments' })
  await expect(toggle).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-checked', 'false')

  // Wallet details only render once opted in — nothing balance-related shows while off.
  await expect(page.getByText(/USDC/)).toHaveCount(0)

  // No money-movement controls anywhere on the page — display only.
  await expect(page.getByRole('button', { name: /send|withdraw|pay\b/i })).toHaveCount(0)

  await expect(page.getByRole('heading', { name: 'Mesh status' })).toBeVisible()
})
