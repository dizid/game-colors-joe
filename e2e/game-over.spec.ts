import { test, expect } from '@playwright/test'

test.describe('Game Over Modal', () => {
  // Helper to fast-forward the game to completion
  async function playUntilGameOver(page: import('@playwright/test').Page) {
    await page.goto('/play/free-fling')
    await page.evaluate(() => localStorage.clear())
    await page.waitForSelector('canvas', { state: 'attached' })
    await page.waitForTimeout(300)

    // Do some clicks to generate a score
    const canvas = page.locator('canvas').last()
    const box = await canvas.boundingBox()
    if (!box) throw new Error('Canvas not found')

    for (let i = 0; i < 8; i++) {
      await page.mouse.click(
        box.x + box.width * (0.2 + (i % 4) * 0.2),
        box.y + box.height * (0.3 + (i % 3) * 0.2)
      )
      await page.waitForTimeout(100)
    }

    // Fast-forward time by manipulating the game state via page evaluation
    // The game runs a RAF loop with delta time, so we can't easily fast-forward
    // Instead, wait for the game to actually finish (60 seconds is too long)
    // We'll use a trick: modify the timeRemaining via the DOM/Vue reactivity

    // Wait for game over by checking for the modal every second
    // But this is too slow for 60s. Instead, let's use page.evaluate to
    // directly trigger the end condition
    await page.evaluate(() => {
      // Access Vue's reactive state through the component internals
      // This is a test-only hack to avoid waiting 60 seconds
      const app = document.querySelector('#app')
      if (app && (app as any).__vue_app__) {
        // Try to find and end the game
      }
    })

    // Since we can't easily access Vue internals, let's wait with a timeout
    // For CI, we'd mock the timer. For now, wait up to 65 seconds.
    await page.waitForSelector('text=Play Again', { timeout: 65000 })
  }

  test('shows game over modal after time expires', async ({ page }) => {
    test.setTimeout(70000) // Allow time for the full game
    await playUntilGameOver(page)

    await expect(page.getByText('Play Again')).toBeVisible()
    await expect(page.getByText('Share')).toBeVisible()
    await expect(page.getByText('Back to Menu')).toBeVisible()
  })

  test('shows score breakdown in game over modal', async ({ page }) => {
    test.setTimeout(70000)
    await playUntilGameOver(page)

    // Score breakdown should show these stats
    await expect(page.getByText('Splats', { exact: true })).toBeVisible()
    await expect(page.getByText('Max Combo', { exact: true })).toBeVisible()
    await expect(page.getByText('Coverage', { exact: true })).toBeVisible()
  })

  test('shows canvas preview in game over modal', async ({ page }) => {
    test.setTimeout(70000)
    await playUntilGameOver(page)

    // The canvas preview image should be visible
    const artPreview = page.locator('img[alt="Your artwork"]')
    await expect(artPreview).toBeVisible()
  })

  test('play again restarts the game', async ({ page }) => {
    test.setTimeout(70000)
    await playUntilGameOver(page)

    // Click Play Again
    await page.getByText('Play Again').click()

    // Modal should disappear
    await expect(page.getByText('Play Again')).not.toBeVisible()

    // Score should reset to 0
    const scoreEl = page.locator('.font-mono.tabular-nums').first()
    await expect(scoreEl).toContainText('0')

    // Timer should reset
    const timerEl = page.locator('.font-mono.tabular-nums').last()
    const timerText = await timerEl.textContent()
    expect(timerText).toMatch(/^60s$/)
  })

  test('back to menu returns to home page', async ({ page }) => {
    test.setTimeout(70000)
    await playUntilGameOver(page)

    await page.getByText('Back to Menu').click()
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1')).toContainText('Splat Factory')
  })

  test('high score persists to menu after game', async ({ page }) => {
    test.setTimeout(70000)
    await playUntilGameOver(page)

    // Get the score from the modal
    const scoreText = await page.locator('.font-mono.font-bold').first().textContent()
    const score = parseInt(scoreText!.replace(/,/g, ''))

    // Go back to menu
    await page.getByText('Back to Menu').click()

    // If we scored > 0, the best score should now show
    if (score > 0) {
      await expect(page.getByText('Best:')).toBeVisible()
    }
  })
})
