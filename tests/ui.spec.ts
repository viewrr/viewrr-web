import { test, expect } from '@playwright/test'

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/movies', name: 'movies' },
  { path: '/search', name: 'search' },
  { path: '/title/0', name: 'detail' },
  { path: '/watch/0', name: 'player' },
  { path: '/login', name: 'login' },
]

// Capture a screenshot of every route for visual review.
for (const r of ROUTES) {
  test(`screenshot ${r.name}`, async ({ page }) => {
    await page.goto(r.path)
    await page.waitForLoadState('networkidle') // wait for poster/backdrop art
    await page.waitForTimeout(300)
    await page.screenshot({ path: `test-results/${r.name}.png` })
  })
}

test('home renders all shelves', async ({ page }) => {
  await page.goto('/')
  const headings = await page.locator('h2').allInnerTexts()
  expect(headings.join(' ')).toContain('Continue Watching')
  expect(headings.join(' ')).toContain('Top 10')
  expect(headings.join(' ')).toContain('Music Albums')
})

test('arrow keys move spatial focus between cards', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(400)
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  // Invariant: arrows move focus to a navigable element, never lost to body.
  const active = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    isNav: !!document.activeElement?.hasAttribute?.('data-nav'),
  }))
  expect(active.isNav).toBe(true)
  expect(['BUTTON', 'A']).toContain(active.tag)
})

test('nav link routes to a content page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Movies' }).click()
  await expect(page).toHaveURL(/\/movies$/)
  await expect(page.locator('h1')).toContainText('Movies')
})

test('poster click opens detail', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(400)
  await page.locator('.row button').first().click()
  await expect(page).toHaveURL(/\/title\//)
})
