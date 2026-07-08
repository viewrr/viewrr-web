import { test, expect } from '@playwright/test'

// Storage marketplace: contribution opt-in (dedicate additional GB at a set
// price) + buy-storage quote stub (ADR p2p-0022). Flag-gated behind
// storageMarketplaceEnabled and rides on the base payments wallet opt-in.
// The flag is flipped on via the localStorage override in api/flags.ts —
// no env/build changes needed to exercise the on-path here.
test.describe('storage marketplace', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('ff.storageMarketplace', '1'))
  })

  test('stays hidden until the base wallet is opted in, even with the flag on', async ({
    page,
  }) => {
    await page.route('**/api/pay/wallet', (route) => route.fulfill({ json: { optedIn: false } }))

    await page.goto('/settings')

    await expect(page.getByRole('heading', { name: 'Payments' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Storage marketplace' })).toHaveCount(0)
  })

  test('contribution opt-in and buy-storage quote work once the wallet is opted in', async ({
    page,
  }) => {
    await page.route('**/api/pay/wallet', (route) =>
      route.fulfill({
        json: {
          optedIn: true,
          address: '0xabc123',
          balanceBaseUnits: '1000000',
          asset: 'USDC',
          decimals: 6,
        },
      }),
    )
    await page.route('**/api/pay/storage/contribution', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          json: { contributing: true, additionalGb: 50, pricePerGbCents: 25 },
        })
      }
      return route.fulfill({ json: { contributing: false } })
    })
    await page.route('**/api/pay/storage/quote', (route) =>
      route.fulfill({ json: { requestedGb: 10, estimatedPriceCents: 250, currency: 'USDC' } }),
    )

    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: 'Storage marketplace' })).toBeVisible()

    await page.getByLabel('Additional GB').fill('50')
    await page.getByLabel('Price (¢/GB)').fill('25')
    await page.getByRole('button', { name: 'Start contributing' }).click()
    await expect(page.getByText(/Contributing 50 GB at 0\.25 USDC\/GB/)).toBeVisible()

    await page.getByLabel('Requested GB').fill('10')
    await page.getByRole('button', { name: 'Get quote' }).click()
    await expect(page.getByText(/Estimated quote: 2\.50 USDC for 10 GB/)).toBeVisible()
  })
})
