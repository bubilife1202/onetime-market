import { test, expect } from '@playwright/test'

test.describe('Buyer Flow - /m/spring-live-3', () => {
  const marketUrl = '/m/spring-live-3'

  test('1. Market page loads successfully', async ({ page }) => {
    await page.goto(marketUrl)

    // Wait for the page to fully render (either market content or error)
    // The store name "꽃보다농장" should appear if data loads
    const storeName = page.getByText('꽃보다농장')
    const errorText = page.getByText('마켓을 찾을 수 없습니다')
    const appError = page.getByText('Application error')

    // Wait for either success or error state
    await expect(storeName.or(errorText).or(appError)).toBeVisible({ timeout: 15000 })

    // Verify it's not an error page
    await expect(errorText).not.toBeVisible()
    await expect(appError).not.toBeVisible()
    await expect(storeName).toBeVisible()
  })

  test('2. Live badge or round info is displayed', async ({ page }) => {
    await page.goto(marketUrl)

    // Wait for page content
    await expect(page.getByText('꽃보다농장')).toBeVisible({ timeout: 15000 })

    // Look for either the "라이브 중" badge or round info text
    const liveBadge = page.getByText('라이브 중')
    const roundInfo = page.getByText(/제\d+회/)

    const hasLiveBadge = await liveBadge.isVisible().catch(() => false)
    const hasRoundInfo = await roundInfo.first().isVisible().catch(() => false)

    expect(hasLiveBadge || hasRoundInfo).toBeTruthy()
  })

  test('3. Product cards exist (at least 1 product)', async ({ page }) => {
    await page.goto(marketUrl)

    // Wait for products to load - "담기" buttons appear on product cards
    const addButtons = page.getByRole('button', { name: '담기' })
    await expect(addButtons.first()).toBeVisible({ timeout: 15000 })

    const count = await addButtons.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('4. Trust layer exists', async ({ page }) => {
    await page.goto(marketUrl)

    // Trust layer shows "인증된 판매자"
    const trustLayer = page.getByText('인증된 판매자')
    await expect(trustLayer).toBeVisible({ timeout: 15000 })
  })

  test('5. Countdown/market close banner exists', async ({ page }) => {
    await page.goto(marketUrl)
    await expect(page.getByText('꽃보다농장')).toBeVisible({ timeout: 15000 })

    // MarketCloseBanner shows either countdown text or expired text
    const countdownText = page.getByText('마감')
    await expect(countdownText.first()).toBeVisible({ timeout: 10000 })
  })

  test('6. Add product to cart and navigate to checkout', async ({ page }) => {
    await page.goto(marketUrl)

    // Wait for product cards
    const addButton = page.getByRole('button', { name: '담기' }).first()
    await expect(addButton).toBeVisible({ timeout: 15000 })

    // Check if market is expired (look for expired banner or "품절" buttons only)
    const expiredBanner = page.getByText('마켓이 마감되었습니다')
    if (await expiredBanner.isVisible().catch(() => false)) {
      test.skip(true, 'Market is expired - cannot add to cart')
      return
    }

    // Select option from dropdown (all products have options in this market)
    const firstSelect = page.locator('select').first()
    if (await firstSelect.isVisible().catch(() => false)) {
      const options = firstSelect.locator('option')
      const optionCount = await options.count()
      if (optionCount > 1) {
        const optionValue = await options.nth(1).getAttribute('value')
        if (optionValue) {
          await firstSelect.selectOption(optionValue)
        }
      }
    }

    // Now the add button should be enabled
    await expect(addButton).toBeEnabled({ timeout: 3000 })
    await addButton.click()

    // Cart bar should appear at bottom with "주문하기" button
    const orderButton = page.getByRole('button', { name: '주문하기' })
    await expect(orderButton).toBeVisible({ timeout: 5000 })

    // Click order button to go to checkout
    await orderButton.click()

    // Should navigate to checkout page
    await page.waitForURL(/\/checkout/, { timeout: 10000 })
    expect(page.url()).toContain('/checkout')
  })

  test('7. Full buyer journey: add to cart → checkout → order complete', async ({ page }) => {
    // Step 1: Go to market page
    await page.goto(marketUrl)

    // Step 2: Wait for products and add to cart
    const addButton = page.getByRole('button', { name: '담기' }).first()
    await expect(addButton).toBeVisible({ timeout: 15000 })

    // Check if market is expired
    const expiredBanner = page.getByText('마켓이 마감되었습니다')
    if (await expiredBanner.isVisible().catch(() => false)) {
      test.skip(true, 'Market is expired - cannot complete buyer journey')
      return
    }

    // Select option from dropdown (required before add button becomes enabled)
    const firstSelect = page.locator('select').first()
    if (await firstSelect.isVisible().catch(() => false)) {
      const options = firstSelect.locator('option')
      const optionCount = await options.count()
      if (optionCount > 1) {
        const optionValue = await options.nth(1).getAttribute('value')
        if (optionValue) {
          await firstSelect.selectOption(optionValue)
        }
      }
    }

    await expect(addButton).toBeEnabled({ timeout: 3000 })
    await addButton.click()

    // Step 3: Navigate to checkout
    const orderButton = page.getByRole('button', { name: '주문하기' })
    await expect(orderButton).toBeVisible({ timeout: 5000 })
    await orderButton.click()
    await page.waitForURL(/\/checkout/, { timeout: 10000 })

    // Step 4: Verify checkout page loaded
    await expect(page.getByText('주문/결제')).toBeVisible({ timeout: 10000 })

    // Step 5: Fill shipping form
    await page.fill('input[placeholder*="이름"]', '테스트 구매자')
    await page.fill('input[placeholder*="연락처"]', '010-9999-8888')
    await page.fill('input[placeholder*="주소 *"]', '서울시 강남구 테헤란로 123')
    await page.fill('input[placeholder*="상세주소"]', '테스트빌딩 101호')

    // Step 6: Agree to refund policy
    const checkbox = page.locator('input[type="checkbox"]')
    await checkbox.check()

    // Step 7: Select payment method
    const paymentMethod = page.getByText('신용/체크카드')
    if (await paymentMethod.isVisible().catch(() => false)) {
      await paymentMethod.click()
    }

    // Step 8: Click pay button
    const payButton = page.locator('button:has-text("결제하기")')
    await expect(payButton).toBeEnabled({ timeout: 5000 })
    await payButton.click()

    // Step 9: Wait for payment processing (2s simulated delay) and navigation to completion
    await page.waitForURL(/\/complete\//, { timeout: 20000 })

    // Step 10: Verify order completion page
    await expect(page.getByText('주문이 완료되었습니다')).toBeVisible({ timeout: 10000 })

    // Check order number is displayed
    await expect(page.getByText('주문번호').first()).toBeVisible()

    // Check buyer name confirmation
    await expect(page.getByText(/테스트 구매자님.*감사합니다/)).toBeVisible()

    // Check action buttons exist
    await expect(page.getByText('주문 조회하기')).toBeVisible()
    await expect(page.getByText('마켓으로 돌아가기')).toBeVisible()
  })
})
