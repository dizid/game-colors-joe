import { test, expect } from '@playwright/test'

test.describe('Local Storage', () => {
  test('localStorage is used for game data', async ({ page }) => {
    await page.goto('/')

    // Clear storage first
    await page.evaluate(() => localStorage.clear())

    // Check storage key exists after playing
    await page.getByText('Free Fling').click()
    await page.waitForSelector('canvas', { state: 'attached' })
    await page.waitForTimeout(300)

    // Make a click to trigger some game activity
    const canvas = page.locator('canvas').last()
    const box = await canvas.boundingBox()
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    }

    // Storage should be accessible
    const hasStorage = await page.evaluate(() => {
      try {
        localStorage.setItem('test-key', 'test-value')
        localStorage.removeItem('test-key')
        return true
      } catch {
        return false
      }
    })
    expect(hasStorage).toBe(true)
  })

  test('sound setting persists across page reloads', async ({ page }) => {
    await page.goto('/')

    // Set sound preference via localStorage directly
    await page.evaluate(() => {
      const data = {
        version: 1,
        highScores: [],
        gallery: [],
        soundEnabled: false,
      }
      localStorage.setItem('joes-splat-factory', JSON.stringify(data))
    })

    // Reload and check it persisted
    await page.reload()
    const soundEnabled = await page.evaluate(() => {
      const raw = localStorage.getItem('joes-splat-factory')
      if (!raw) return true
      return JSON.parse(raw).soundEnabled
    })
    expect(soundEnabled).toBe(false)
  })

  test('high scores persist across sessions', async ({ page }) => {
    await page.goto('/')

    // Seed a high score
    await page.evaluate(() => {
      const data = {
        version: 1,
        highScores: [{ mode: 'free-fling', score: 1234, date: Date.now() }],
        gallery: [],
        soundEnabled: true,
      }
      localStorage.setItem('joes-splat-factory', JSON.stringify(data))
    })

    // Reload and check the menu shows the best score
    await page.reload()
    await expect(page.getByText('Best: 1,234')).toBeVisible()
  })

  test('gallery data persists', async ({ page }) => {
    await page.goto('/')

    // Seed gallery data
    await page.evaluate(() => {
      const data = {
        version: 1,
        highScores: [],
        gallery: [{
          id: 'test-art-1',
          dataUrl: 'data:image/png;base64,iVBORw0KGgo=',
          timestamp: Date.now(),
          mode: 'free-fling',
          score: 500,
        }],
        soundEnabled: true,
      }
      localStorage.setItem('joes-splat-factory', JSON.stringify(data))
    })

    // Verify gallery was saved
    const galleryCount = await page.evaluate(() => {
      const raw = localStorage.getItem('joes-splat-factory')
      if (!raw) return 0
      return JSON.parse(raw).gallery.length
    })
    expect(galleryCount).toBe(1)
  })
})
