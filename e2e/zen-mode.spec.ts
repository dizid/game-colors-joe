import { test, expect } from '@playwright/test'

test.describe('Zen Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/play/zen')
    await page.evaluate(() => localStorage.clear())
    await page.waitForSelector('canvas', { state: 'attached' })
    await page.waitForTimeout(300)
  })

  test('shows "Zen Mode" label instead of score', async ({ page }) => {
    await expect(page.getByText('Zen Mode')).toBeVisible()
  })

  test('does not display a timer', async ({ page }) => {
    await expect(page.getByText('Time')).not.toBeVisible()
  })

  test('does not display score HUD', async ({ page }) => {
    // "Score" label should not be visible in zen mode
    const scoreLabel = page.locator('text=Score').first()
    // We need to be specific - the word "Score" shouldn't appear as a HUD element
    await expect(page.locator('div:has-text("Score") >> .font-mono')).not.toBeVisible()
  })

  test('allows painting without time pressure', async ({ page }) => {
    const canvas = page.locator('canvas').last()
    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()

    // Paint several splats
    for (let i = 0; i < 3; i++) {
      await page.mouse.click(
        box!.x + box!.width * (0.3 + i * 0.2),
        box!.y + box!.height * 0.5
      )
      await page.waitForTimeout(200)
    }

    // Game should still be running (no game over modal)
    await expect(page.getByText('Play Again')).not.toBeVisible()
  })

  test('color picker works in zen mode', async ({ page }) => {
    // Click on Tuk-Tuk Red
    const redButton = page.getByLabel('Tuk-Tuk Red')
    await redButton.click()

    // Red should now be selected (has scale-110 class)
    await expect(redButton).toHaveClass(/scale-110/)

    // Bangkok Blue should no longer be selected
    const blueButton = page.getByLabel('Bangkok Blue')
    await expect(blueButton).not.toHaveClass(/scale-110/)
  })

  test('pause works in zen mode', async ({ page }) => {
    const pauseButton = page.locator('button:has(svg)')
    await pauseButton.click()
    await expect(page.getByText('Paused')).toBeVisible()
    await page.getByText('Resume').click()
    await expect(page.getByText('Paused')).not.toBeVisible()
  })

  test('can quit to menu from zen mode', async ({ page }) => {
    const pauseButton = page.locator('button:has(svg)')
    await pauseButton.click()
    await page.getByText('Quit to Menu').click()
    await expect(page).toHaveURL('/')
  })

  test('game does not end on its own (no timer)', async ({ page }) => {
    // Wait a reasonable time
    await page.waitForTimeout(3000)

    // Game over modal should NOT appear
    await expect(page.getByText('Play Again')).not.toBeVisible()

    // Canvas should still be interactive
    const canvas = page.locator('canvas').last()
    const box = await canvas.boundingBox()
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2)
    // No error = still interactive
  })
})
