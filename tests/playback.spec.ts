import { test, expect } from '@playwright/test'

// Real-stream integration check: needs the Hub on :8080 + the `tester` user +
// a transcoded title. Skipped unless RUN_PLAYBACK=1 (it can't run in CI).
const RUN = process.env.RUN_PLAYBACK === '1'
const MEDIA_ID = '9ac1bfd7-ab46-4517-9ccf-181d3966f697'

test.skip(!RUN, 'set RUN_PLAYBACK=1 with the Hub running')

test('real HLS stream actually plays', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('Username').fill('tester')
  await page.getByPlaceholder('Password').fill('viewrr-e2e-pass')
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL('http://localhost:5173/')

  await page.goto(`/watch/${MEDIA_ID}`)
  // Playback must reach HAVE_CURRENT_DATA and the clock must advance.
  await page.waitForFunction(
    () => {
      const v = document.querySelector('video')
      return !!v && v.readyState >= 2 && v.currentTime > 0
    },
    { timeout: 30_000 },
  )
  const state = await page.evaluate(() => {
    const v = document.querySelector('video')!
    return { readyState: v.readyState, currentTime: v.currentTime, videoW: v.videoWidth }
  })
  expect(state.readyState).toBeGreaterThanOrEqual(2)
  expect(state.currentTime).toBeGreaterThan(0)
  expect(state.videoW).toBeGreaterThan(0)
})
