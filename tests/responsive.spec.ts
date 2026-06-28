import { test } from '@playwright/test'

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 }, // iPhone-ish
  { name: 'ipad', width: 820, height: 1180 }, // iPad
]
const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/movies', name: 'movies' },
  { path: '/title/0', name: 'detail' },
]

for (const vp of VIEWPORTS) {
  for (const r of ROUTES) {
    test(`${vp.name} ${r.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(r.path)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(300)
      await page.screenshot({ path: `test-results/${vp.name}-${r.name}.png` })
    })
  }
}
