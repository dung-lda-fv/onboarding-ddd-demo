// app.js — Product page frontend logic
// Calls the Order Management API and shows confirmation to the user.

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('order-now-btn')
  const msgEl = document.getElementById('confirmation-message')

  btn.addEventListener('click', async () => {
    btn.disabled = true
    btn.textContent = 'Processing...'
    msgEl.className = ''
    msgEl.textContent = ''

    try {
      const response = await fetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'demo-customer-001',
          items: [
            {
              productId: 'laptop-thinkpad-x1',
              productName: 'Laptop ThinkPad X1 Carbon',
              unitPrice: 20000000,
              currency: 'VND',
              quantity: 1,
            },
          ],
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(err.message || `HTTP ${response.status}`)
      }

      const order = await response.json()

      localStorage.setItem('customerId', order.customerId)

      msgEl.innerHTML = `
        <div>✓ Order confirmed! Your order has been placed successfully.</div>
        <div class="order-id">Order ID: ${order.id} &nbsp;|&nbsp; Status: ${order.status}</div>
      `
      msgEl.className = 'success'
    } catch (error) {
      msgEl.textContent = `✗ Order failed: ${error.message}`
      msgEl.className = 'error'
      btn.disabled = false
      btn.textContent = 'Order Now'
    }
  })
})
