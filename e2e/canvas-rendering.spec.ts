import { test, expect } from '@playwright/test'

test.describe('Canvas Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/play/free-fling')
    await page.waitForSelector('canvas', { state: 'attached' })
    await page.waitForTimeout(300)
  })

  test('persistent canvas has white background', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // Check that canvas has pixel data (is not empty)
    const hasWhiteBg = await page.evaluate(() => {
      const canvas = document.querySelectorAll('canvas')[0]
      const ctx = canvas.getContext('2d')
      if (!ctx) return false

      // Sample center pixel
      const data = ctx.getImageData(
        Math.floor(canvas.width / 2),
        Math.floor(canvas.height / 2),
        1, 1
      ).data

      // Should be close to white (#FAFAF7)
      return data[0] >= 240 && data[1] >= 240 && data[2] >= 230 && data[3] >= 250
    })

    expect(hasWhiteBg).toBe(true)
  })

  test('clicking paints onto the persistent canvas', async ({ page }) => {
    const animCanvas = page.locator('canvas').last()
    const box = await animCanvas.boundingBox()
    expect(box).toBeTruthy()

    // Check pixel count before clicking
    const pixelsBefore = await page.evaluate(() => {
      const canvas = document.querySelectorAll('canvas')[0]
      const ctx = canvas.getContext('2d')
      if (!ctx) return 0
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      let painted = 0
      for (let i = 3; i < data.length; i += 16) {
        // Check if pixel is NOT white (has been painted)
        const r = data[i - 3], g = data[i - 2], b = data[i - 1]
        if (r < 240 || g < 240 || b < 230) painted++
      }
      return painted
    })

    // Click several times
    for (let i = 0; i < 5; i++) {
      await page.mouse.click(
        box!.x + box!.width * (0.2 + i * 0.15),
        box!.y + box!.height * 0.5
      )
      await page.waitForTimeout(300)
    }

    // Wait for splats to render to persistent canvas
    await page.waitForTimeout(1000)

    // Check pixel count after clicking
    const pixelsAfter = await page.evaluate(() => {
      const canvas = document.querySelectorAll('canvas')[0]
      const ctx = canvas.getContext('2d')
      if (!ctx) return 0
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      let painted = 0
      for (let i = 3; i < data.length; i += 16) {
        const r = data[i - 3], g = data[i - 2], b = data[i - 1]
        if (r < 240 || g < 240 || b < 230) painted++
      }
      return painted
    })

    // More pixels should be painted now
    expect(pixelsAfter).toBeGreaterThan(pixelsBefore)
  })

  test('canvas has proper DPR scaling', async ({ page }) => {
    const canvasDimensions = await page.evaluate(() => {
      const canvas = document.querySelectorAll('canvas')[0]
      return {
        width: canvas.width,
        height: canvas.height,
        cssWidth: parseInt(canvas.style.width),
        cssHeight: parseInt(canvas.style.height),
        dpr: window.devicePixelRatio,
      }
    })

    // Canvas pixel dimensions should be CSS dimensions * DPR (capped at 2)
    const expectedDpr = Math.min(canvasDimensions.dpr, 2)
    const expectedWidth = Math.floor(canvasDimensions.cssWidth * expectedDpr)
    const expectedHeight = Math.floor(canvasDimensions.cssHeight * expectedDpr)

    expect(canvasDimensions.width).toBe(expectedWidth)
    expect(canvasDimensions.height).toBe(expectedHeight)
  })

  test('wood frame border is visible around canvas', async ({ page }) => {
    // The frame is a div with border-[#8B7355]
    const frame = page.locator('.border-\\[\\#8B7355\\]').first()
    await expect(frame).toBeVisible()
  })
})
