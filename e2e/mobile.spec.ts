import { test, expect } from '@playwright/test'

// Mobile viewport tests - use viewport size instead of device descriptors
// to avoid worker isolation issues with defaultBrowserType

test.describe('Mobile Viewport', () => {
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 13 dimensions
    hasTouch: true,
    isMobile: true,
  })

  test('main menu is fully visible on mobile', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h1')).toContainText("Joe's")
    await expect(page.getByText('Splat Factory')).toBeVisible()
    await expect(page.getByText('Free Fling')).toBeVisible()
    await expect(page.getByText('Zen Mode')).toBeVisible()
  })

  test('mode buttons are clickable on mobile', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Free Fling').click()
    await expect(page).toHaveURL('/play/free-fling')
  })

  test('game renders on mobile viewport', async ({ page }) => {
    await page.goto('/play/free-fling')
    await page.waitForSelector('canvas', { state: 'attached' })

    const canvases = page.locator('canvas')
    await expect(canvases.first()).toBeVisible()
  })

  test('color picker fits within mobile screen', async ({ page }) => {
    await page.goto('/play/free-fling')
    await page.waitForSelector('canvas', { state: 'attached' })

    const colorButtons = page.locator('button[aria-label]')
    const count = await colorButtons.count()
    expect(count).toBe(7)

    for (let i = 0; i < count; i++) {
      await expect(colorButtons.nth(i)).toBeVisible()
    }
  })

  test('touch gestures work on mobile canvas', async ({ page }) => {
    await page.goto('/play/free-fling')
    await page.waitForSelector('canvas', { state: 'attached' })
    await page.waitForTimeout(300)

    const canvas = page.locator('canvas').last()
    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()

    // Simulate touch tap
    await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.waitForTimeout(500)

    // Score should increase
    const scoreEl = page.locator('.font-mono.tabular-nums').first()
    const scoreText = await scoreEl.textContent()
    const score = parseInt(scoreText!.replace(/,/g, ''))
    expect(score).toBeGreaterThan(0)
  })

  test('HUD elements are visible on mobile', async ({ page }) => {
    await page.goto('/play/free-fling')
    await page.waitForSelector('canvas', { state: 'attached' })

    await expect(page.getByText('Score')).toBeVisible()
    await expect(page.getByText('Time')).toBeVisible()
  })

  test('pause button is accessible on mobile', async ({ page }) => {
    await page.goto('/play/free-fling')
    await page.waitForSelector('canvas', { state: 'attached' })

    const pauseButton = page.locator('button:has(svg)')
    await expect(pauseButton).toBeVisible()

    const box = await pauseButton.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.width).toBeGreaterThanOrEqual(36)
    expect(box!.height).toBeGreaterThanOrEqual(36)
  })
})

test.describe('Tablet Viewport', () => {
  test.use({
    viewport: { width: 810, height: 1080 }, // iPad-like dimensions
  })

  test('game renders properly on tablet', async ({ page }) => {
    await page.goto('/play/free-fling')
    await page.waitForSelector('canvas', { state: 'attached' })

    const canvases = page.locator('canvas')
    await expect(canvases.first()).toBeVisible()

    await expect(page.getByText('Score')).toBeVisible()
    await expect(page.getByText('Time')).toBeVisible()

    const colorButtons = page.locator('button[aria-label]')
    expect(await colorButtons.count()).toBe(7)
  })
})
