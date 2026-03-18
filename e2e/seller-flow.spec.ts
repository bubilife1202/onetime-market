import { test, expect } from '@playwright/test'

const BASE = 'https://app-five-beryl-65.vercel.app'

// Login via API and store auth cookie for all tests
test.beforeEach(async ({ context }) => {
  const res = await context.request.post(`${BASE}/api/auth/login`, {
    data: { email: 'demo@market.kr', password: 'demo1234' },
  })
  expect(res.status()).toBe(200)
})

test('dashboard – stats cards exist', async ({ page }) => {
  await page.goto(`${BASE}/dashboard`)
  await expect(page.locator('h1', { hasText: '대시보드' })).toBeVisible()
  // Wait for loading to finish — stats cards appear after fetch
  await expect(page.locator('text=총 주문수')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('text=매출액')).toBeVisible()
  await expect(page.locator('text=미발송')).toBeVisible()
  await expect(page.locator('text=전환율')).toBeVisible()
})

test('rounds – round list page loads', async ({ page }) => {
  await page.goto(`${BASE}/rounds`)
  await expect(page.locator('h1', { hasText: '회차 관리' })).toBeVisible()
  // Filter buttons should be present
  await expect(page.locator('button', { hasText: '전체' })).toBeVisible({ timeout: 15000 })
  await expect(page.locator('button', { hasText: '라이브' })).toBeVisible()
  await expect(page.locator('button', { hasText: '마감' })).toBeVisible()
})

test('rounds/new – creation form exists', async ({ page }) => {
  await page.goto(`${BASE}/rounds/new`)
  await expect(page.locator('h1', { hasText: '새 회차 만들기' })).toBeVisible()
  // Step 1 form fields
  await expect(page.locator('text=회차 이름')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('text=시작 일시')).toBeVisible()
  await expect(page.locator('text=종료 일시')).toBeVisible()
})

test('shipping – page loads', async ({ page }) => {
  await page.goto(`${BASE}/shipping`)
  await expect(page.locator('h1', { hasText: '배송관리' })).toBeVisible()
  // Table headers or empty state should appear
  await expect(
    page.locator('text=주문번호').or(page.locator('text=배송 관리할 주문이 없습니다'))
  ).toBeVisible({ timeout: 15000 })
})

test('refunds – page loads', async ({ page }) => {
  await page.goto(`${BASE}/refunds`)
  await expect(page.locator('h1', { hasText: '취소/환불 관리' })).toBeVisible()
  // Tabs should be present
  await expect(page.locator('button', { hasText: '전체' })).toBeVisible({ timeout: 15000 })
  await expect(page.locator('button', { hasText: '취소요청' })).toBeVisible()
  await expect(page.locator('button', { hasText: '환불요청' })).toBeVisible()
})

test('settings – page loads', async ({ page }) => {
  await page.goto(`${BASE}/settings`)
  await expect(page.locator('h1', { hasText: '설정' })).toBeVisible()
  // Form fields
  await expect(page.locator('text=스토어 이름')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('text=대표자명')).toBeVisible()
  await expect(page.locator('button', { hasText: '설정 저장' })).toBeVisible()
})
