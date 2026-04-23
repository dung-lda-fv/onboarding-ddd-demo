// tests/e2e/feat-002.test.ts
// E2E Test — feat-002: "Cancel Order — status updates to Cancelled"
//
// Map trực tiếp từ test_steps trong feature_list.json:
//   1. Log in to the application
//   2. Navigate to the order history page
//   3. Verify: the order is listed with status 'Pending'
//   4. Click 'Cancel Order' button
//   5. Verify: the order status is updated to 'Canceled'
//   6. Verify: status update appears within 2 seconds
//   7. Verify: each order entry shows product name, order date, and status

import { test, expect, APIRequestContext } from '@playwright/test'

const CUSTOMER_ID = 'e2e-cancel-customer'

async function createOrder(request: APIRequestContext) {
  const res = await request.post('/orders', {
    data: {
      customerId: CUSTOMER_ID,
      items: [{
        productId: 'laptop-thinkpad-x1',
        productName: 'Laptop ThinkPad X1 Carbon',
        unitPrice: 20000000,
        currency: 'VND',
        quantity: 1,
      }],
    },
  })
  expect(res.status()).toBe(201)
  return res.json()
}

test.describe('feat-002: Cancel Order and update status', () => {
  test('full flow: đặt hàng → xem history → cancel → status Cancelled', async ({ page, request }) => {
    // ── Step 1: "Log in" — điều hướng đến history page với customerId ─────
    const order = await createOrder(request)
    expect(order.status).toBe('Pending')

    await page.goto('/history.html')
    await expect(page).toHaveTitle(/Order Management/)

    // Nhập Customer ID (login)
    await page.locator('#customer-id-input').fill(CUSTOMER_ID)
    await page.locator('#load-btn').click()

    // ── Step 2: Navigate to the order history page ─────────────────────────
    await expect(page.locator('#orders-section')).toBeVisible()

    // ── Step 3: Verify order is listed with status 'Pending' ──────────────
    const orderCard = page.locator(`.order-card[data-order-id="${order.id}"]`)
    await expect(orderCard).toBeVisible()
    await expect(orderCard.locator('.order-status')).toHaveText('Pending')

    // ── Step 7 (partial): each entry shows product name, order date, status ─
    await expect(orderCard.locator('.order-product')).toContainText('Laptop ThinkPad X1 Carbon')
    await expect(orderCard.locator('.order-meta')).toContainText('Ngày đặt:')
    await expect(orderCard.locator('.order-status')).toBeVisible()

    // ── Step 4: Click 'Cancel Order' button ───────────────────────────────
    const cancelBtn = orderCard.locator('.cancel-btn')
    await expect(cancelBtn).toBeVisible()
    await expect(cancelBtn).toBeEnabled()

    const startTime = Date.now()
    await cancelBtn.click()

    // ── Step 5 & 6: Verify status updated to Cancelled within 2 seconds ───
    const updatedCard = page.locator(`.order-card[data-order-id="${order.id}"]`)
    await expect(updatedCard.locator('.order-status')).toHaveText('Cancelled', { timeout: 2000 })

    const elapsed = Date.now() - startTime
    expect(elapsed, `Status update took ${elapsed}ms, expected < 2000ms`).toBeLessThan(2000)

    // Cancelled order không còn nút Cancel
    await expect(updatedCard.locator('.cancel-btn')).not.toBeAttached()
  })

  test('API GET /orders/customer/:customerId trả về danh sách đơn hàng', async ({ request }) => {
    const order = await createOrder(request)

    const res = await request.get(`/orders/customer/${CUSTOMER_ID}`)
    expect(res.status()).toBe(200)

    const orders = await res.json()
    expect(Array.isArray(orders)).toBe(true)
    expect(orders.length).toBeGreaterThanOrEqual(1)

    const found = orders.find((o: { id: string }) => o.id === order.id)
    expect(found).toBeDefined()
    expect(found.status).toBe('Pending')
    expect(found.items[0].productName).toBe('Laptop ThinkPad X1 Carbon')
    expect(found.createdAt).toBeDefined()
  })

  test('API POST /orders/:id/cancel cập nhật status thành Cancelled', async ({ request }) => {
    const order = await createOrder(request)

    const startTime = Date.now()
    const cancelRes = await request.post(`/orders/${order.id}/cancel`, {
      data: { orderId: order.id, reason: 'Cancelled by customer' },
    })
    const elapsed = Date.now() - startTime

    expect(cancelRes.status()).toBe(200)

    const cancelled = await cancelRes.json()
    expect(cancelled.status).toBe('Cancelled')
    expect(cancelled.id).toBe(order.id)

    expect(elapsed, `Cancel API took ${elapsed}ms, expected < 2000ms`).toBeLessThan(2000)
  })

  test('history page hiển thị empty state khi không có đơn hàng', async ({ page }) => {
    await page.goto('/history.html')
    await page.locator('#customer-id-input').fill('no-orders-customer-xyz')
    await page.locator('#load-btn').click()

    await expect(page.locator('#empty-state')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('#empty-state')).toContainText('Chưa có đơn hàng')
  })
})
