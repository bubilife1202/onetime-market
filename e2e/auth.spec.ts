import { test, expect } from '@playwright/test'

test.describe('Landing & Auth Flow', () => {
  test('landing page loads with "원타임 마켓" visible', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    await expect(page.getByText('원타임 마켓').first()).toBeVisible()
  })

  test('login page loads', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('원타임 마켓').first()).toBeVisible()
    await expect(page.locator('input#email')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
  })

  test('login with demo credentials redirects to /dashboard', async ({ page }) => {
    await page.goto('/login')

    // Fill credentials (form has default values, but fill explicitly)
    await page.locator('input#email').fill('demo@market.kr')
    await page.locator('input#password').fill('demo1234')

    // Submit login
    await page.getByRole('button', { name: '로그인' }).click()

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('dashboard shows seller content', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.locator('input#email').fill('demo@market.kr')
    await page.locator('input#password').fill('demo1234')
    await page.getByRole('button', { name: '로그인' }).click()
    await page.waitForURL('**/dashboard', { timeout: 15000 })

    // Verify dashboard content
    await expect(page.getByText('대시보드')).toBeVisible()
    // Check for round timeline or seller-specific content
    await expect(page.getByText('봄맞이 라이브 특가').first()).toBeVisible({ timeout: 10000 })
  })
})
