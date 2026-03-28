import { test, expect } from '@playwright/test'

test.describe('Navigation & Routing', () => {
  test('home page loads at root URL', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText("Joe's")
  })

  test('direct navigation to /play/free-fling works', async ({ page }) => {
    await page.goto('/play/free-fling')
    await page.waitForSelector('canvas', { state: 'attached' })
    await expect(page.getByText('Score')).toBeVisible()
    await expect(page.getByText('Time')).toBeVisible()
  })

  test('direct navigation to /play/zen works', async ({ page }) => {
    await page.goto('/play/zen')
    await page.waitForSelector('canvas', { state: 'attached' })
    await expect(page.getByText('Zen Mode')).toBeVisible()
  })

  test('navigating from game back to menu and back to game works', async ({ page }) => {
    // Start on menu
    await page.goto('/')
    await expect(page.getByText('Free Fling')).toBeVisible()

    // Go to game
    await page.getByText('Free Fling').click()
    await expect(page).toHaveURL('/play/free-fling')
    await page.waitForSelector('canvas', { state: 'attached' })

    // Go back to menu via pause
    await page.keyboard.press('Escape')
    await page.getByText('Quit to Menu').click()
    await expect(page).toHaveURL('/')

    // Go to zen mode
    await page.getByText('Zen Mode').click()
    await expect(page).toHaveURL('/play/zen')
    await page.waitForSelector('canvas', { state: 'attached' })
    await expect(page.getByText('Zen Mode')).toBeVisible()
  })

  test('page title is correct', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle("Joe's Splat Factory")
  })

  test('favicon is set', async ({ page }) => {
    await page.goto('/')
    const favicon = page.locator('link[rel="icon"]')
    await expect(favicon).toHaveAttribute('href', '/favicon.svg')
  })
})
