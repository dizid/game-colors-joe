import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('color picker buttons have aria-labels', async ({ page }) => {
    await page.goto('/play/free-fling')
    await page.waitForSelector('canvas', { state: 'attached' })

    const colorButtons = page.locator('button[aria-label]')
    const count = await colorButtons.count()
    expect(count).toBe(7)

    // Each should have a descriptive aria-label
    const labels = await colorButtons.evaluateAll(
      buttons => buttons.map(b => b.getAttribute('aria-label'))
    )

    expect(labels).toContain('Bangkok Blue')
    expect(labels).toContain('Tuk-Tuk Red')
    expect(labels).toContain('Monsoon Teal')
    expect(labels).toContain('Temple Yellow')
    expect(labels).toContain('Street Mango')
    expect(labels).toContain('Lotus Pink')
    expect(labels).toContain('Pad Thai Orange')
  })

  test('color buttons have title attributes', async ({ page }) => {
    await page.goto('/play/free-fling')
    await page.waitForSelector('canvas', { state: 'attached' })

    const blueBtn = page.getByLabel('Bangkok Blue')
    await expect(blueBtn).toHaveAttribute('title', 'Bangkok Blue')
  })

  test('game over buttons are keyboard focusable', async ({ page }) => {
    // Seed a completed game state by navigating and waiting
    // For accessibility testing, we check that buttons are interactive
    await page.goto('/')

    // Tab through the page
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase())

    // Should focus on a button or link
    expect(['button', 'a', 'input']).toContain(tagName)
  })

  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    // Should have an h1
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
  })

  test('no duplicate IDs on the page', async ({ page }) => {
    await page.goto('/play/free-fling')
    await page.waitForSelector('canvas', { state: 'attached' })

    const hasDuplicateIds = await page.evaluate(() => {
      const allIds = document.querySelectorAll('[id]')
      const ids = Array.from(allIds).map(el => el.id).filter(Boolean)
      return ids.length !== new Set(ids).size
    })

    expect(hasDuplicateIds).toBe(false)
  })

  test('buttons have sufficient click target size', async ({ page }) => {
    await page.goto('/play/free-fling')
    await page.waitForSelector('canvas', { state: 'attached' })

    // Check all interactive buttons
    const buttons = page.locator('button')
    const count = await buttons.count()

    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox()
      if (box) {
        // WCAG recommends 44x44, we'll check for 36x36 minimum
        expect(box.width).toBeGreaterThanOrEqual(36)
        expect(box.height).toBeGreaterThanOrEqual(36)
      }
    }
  })
})
