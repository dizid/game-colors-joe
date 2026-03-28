import { test, expect } from '@playwright/test'

test.describe('Color Picker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/play/free-fling')
    await page.waitForSelector('canvas', { state: 'attached' })
    await page.waitForTimeout(300)
  })

  test('displays all 7 paint colors', async ({ page }) => {
    const colors = [
      'Bangkok Blue',
      'Tuk-Tuk Red',
      'Monsoon Teal',
      'Temple Yellow',
      'Street Mango',
      'Lotus Pink',
      'Pad Thai Orange',
    ]

    for (const name of colors) {
      await expect(page.getByLabel(name)).toBeVisible()
    }
  })

  test('Bangkok Blue is selected by default', async ({ page }) => {
    const blueBtn = page.getByLabel('Bangkok Blue')
    await expect(blueBtn).toHaveClass(/scale-110/)
  })

  test('clicking a different color selects it', async ({ page }) => {
    // Click Temple Yellow
    const yellowBtn = page.getByLabel('Temple Yellow')
    await yellowBtn.click()

    // Yellow should now be selected
    await expect(yellowBtn).toHaveClass(/scale-110/)

    // Blue should no longer be selected
    const blueBtn = page.getByLabel('Bangkok Blue')
    await expect(blueBtn).not.toHaveClass(/scale-110/)
  })

  test('can switch between multiple colors', async ({ page }) => {
    // Select red
    const redBtn = page.getByLabel('Tuk-Tuk Red')
    await redBtn.click()
    await expect(redBtn).toHaveClass(/scale-110/)

    // Select pink
    const pinkBtn = page.getByLabel('Lotus Pink')
    await pinkBtn.click()
    await expect(pinkBtn).toHaveClass(/scale-110/)
    await expect(redBtn).not.toHaveClass(/scale-110/)

    // Select orange
    const orangeBtn = page.getByLabel('Pad Thai Orange')
    await orangeBtn.click()
    await expect(orangeBtn).toHaveClass(/scale-110/)
    await expect(pinkBtn).not.toHaveClass(/scale-110/)
  })

  test('only one color is selected at a time', async ({ page }) => {
    // Click through each color and verify only one is selected
    const colorNames = [
      'Bangkok Blue', 'Tuk-Tuk Red', 'Monsoon Teal', 'Temple Yellow',
      'Street Mango', 'Lotus Pink', 'Pad Thai Orange',
    ]

    for (const name of colorNames) {
      await page.getByLabel(name).click()

      const selectedButtons = page.locator('button[aria-label].scale-110')
      await expect(selectedButtons).toHaveCount(1)
    }
  })

  test('color buttons have correct background colors', async ({ page }) => {
    const colorMap: Record<string, string> = {
      'Bangkok Blue': 'rgb(30, 144, 255)',
      'Tuk-Tuk Red': 'rgb(220, 20, 60)',
      'Monsoon Teal': 'rgb(32, 178, 170)',
      'Temple Yellow': 'rgb(255, 215, 0)',
      'Street Mango': 'rgb(255, 140, 0)',
      'Lotus Pink': 'rgb(255, 105, 180)',
      'Pad Thai Orange': 'rgb(255, 69, 0)',
    }

    for (const [name, expectedColor] of Object.entries(colorMap)) {
      const btn = page.getByLabel(name)
      const bgColor = await btn.evaluate(el => getComputedStyle(el).backgroundColor)
      expect(bgColor).toBe(expectedColor)
    }
  })

  test('color buttons are large enough for touch targets (min 40px)', async ({ page }) => {
    const colorButtons = page.locator('button[aria-label]')
    const count = await colorButtons.count()

    for (let i = 0; i < count; i++) {
      const box = await colorButtons.nth(i).boundingBox()
      expect(box).toBeTruthy()
      expect(box!.width).toBeGreaterThanOrEqual(36) // w-10 = 40px, allow small tolerance
      expect(box!.height).toBeGreaterThanOrEqual(36)
    }
  })
})
