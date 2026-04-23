// tests/e2e/feat-001.test.ts
// E2E Test — feat-001: "User places an order and receives confirmation"
//
// Map trực tiếp từ test_steps trong feature_list.json:
//   1. Navigate to the product page order
//   2. Click 'Order Now' button
//   3. Verify: confirmation message is displayed
//   4. Verify: confirmation message appears within 2 seconds

import { test, expect } from '@playwright/test'

test.describe('feat-001: Order a product and receive confirmation', () => {
  test('user đặt hàng thành công và nhận confirmation trong 2 giây', async ({ page }) => {
    // ── Step 1: Navigate to the product page ─────────────────────
    await page.goto('/')
    await expect(page.locator('.product-name')).toBeVisible()
    await expect(page.locator('.product-price')).toContainText('VND')

    // ── Step 2: Click 'Order Now' button ─────────────────────────
    const orderBtn = page.getByRole('button', { name: 'Order Now' })
    await expect(orderBtn).toBeVisible()
    await expect(orderBtn).toBeEnabled()

    const startTime = Date.now()
    await orderBtn.click()

    // ── Step 3: Verify confirmation message is displayed ─────────
    const confirmMsg = page.locator('#confirmation-message')
    await expect(confirmMsg).toBeVisible({ timeout: 2000 })
    await expect(confirmMsg).toHaveClass(/success/)
    await expect(confirmMsg).toContainText('Order confirmed')
    await expect(confirmMsg).toContainText('Order ID:')
    await expect(confirmMsg).toContainText('Status:')

    // ── Step 4: Verify confirmation appears within 2 seconds ──────
    const elapsed = Date.now() - startTime
    expect(elapsed, `Confirmation took ${elapsed}ms, expected < 2000ms`).toBeLessThan(2000)
  })

  test('button bị disabled ngay sau khi click (tránh double-submit)', async ({ page }) => {
    await page.goto('/')

    const orderBtn = page.locator('#order-now-btn')
    await orderBtn.click()

    // Ngay sau khi click, button phải disabled (tránh double-submit)
    await expect(orderBtn).toBeDisabled()
  })

  test('API POST /orders trả về 201 với dữ liệu hợp lệ', async ({ request }) => {
    const startTime = Date.now()

    const response = await request.post('/orders', {
      data: {
        customerId: 'e2e-test-customer',
        items: [
          {
            productId: 'laptop-thinkpad-x1',
            productName: 'Laptop ThinkPad X1 Carbon',
            unitPrice: 20000000,
            currency: 'VND',
            quantity: 1,
          },
        ],
      },
    })

    const elapsed = Date.now() - startTime

    // Kiểm tra HTTP status
    expect(response.status()).toBe(201)

    // Kiểm tra response body
    const order = await response.json()
    expect(order.id).toBeDefined()
    expect(order.customerId).toBe('e2e-test-customer')
    expect(order.status).toBe('Pending')
    expect(order.items).toHaveLength(1)
    expect(order.totalAmount).toBe(20000000)

    // Kiểm tra response time < 2 giây
    expect(elapsed, `API took ${elapsed}ms, expected < 2000ms`).toBeLessThan(2000)
  })
})
