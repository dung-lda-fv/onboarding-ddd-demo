// tests/e2e/smoke.test.ts
// Gate 4: Smoke Tests — kiểm tra nhanh server có healthy không (<10s)
// Chạy bởi: npx playwright test --project=smoke

import { test, expect } from '@playwright/test'

test.describe('Smoke: Server health', () => {
  test('GET /health trả về status ok', async ({ request }) => {
    const response = await request.get('/health')
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.status).toBe('ok')
    expect(body.timestamp).toBeDefined()
  })

  test('Product page load được (HTML hiển thị)', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Order Management/)
    await expect(page.locator('.product-name')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Order Now' })).toBeVisible()
  })
})
