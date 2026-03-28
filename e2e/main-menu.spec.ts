import { test, expect } from '@playwright/test'

test.describe('Main Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays the game title correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText("Joe's")
    await expect(page.locator('h1')).toContainText('Splat Factory')
  })

  test('displays a rotating tagline', async ({ page }) => {
    // Tagline is now randomized from a pool - just check the paragraph exists and has text
    const tagline = page.locator('h1 + p')
    await expect(tagline).toBeVisible()
    const text = await tagline.textContent()
    expect(text!.trim().length).toBeGreaterThan(10)
  })

  test('displays the footer credit', async ({ page }) => {
    await expect(page.getByText("Inspired by Joe's street art in Thailand")).toBeVisible()
  })

  test('shows Free Fling mode button with description', async ({ page }) => {
    await expect(page.getByText('Free Fling')).toBeVisible()
    await expect(page.getByText('60 seconds of pure paint chaos')).toBeVisible()
  })

  test('shows Zen Mode button with description', async ({ page }) => {
    await expect(page.getByText('Zen Mode')).toBeVisible()
    await expect(page.getByText('No timer. No score. Just paint.')).toBeVisible()
  })

  test('shows exactly 2 game mode buttons', async ({ page }) => {
    // Both mode buttons are inside the mode selector div
    const modeButtons = page.locator('button:has-text("Free Fling"), button:has-text("Zen Mode")')
    await expect(modeButtons).toHaveCount(2)
  })

  test('navigates to Free Fling game when clicking Free Fling', async ({ page }) => {
    await page.getByText('Free Fling').click()
    await expect(page).toHaveURL('/play/free-fling')
  })

  test('navigates to Zen Mode game when clicking Zen Mode', async ({ page }) => {
    await page.getByText('Zen Mode').click()
    await expect(page).toHaveURL('/play/zen')
  })

  test('does not show best score initially (no prior games)', async ({ page }) => {
    // Clear localStorage to ensure clean state
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await expect(page.getByText('Best:')).not.toBeVisible()
  })
})
