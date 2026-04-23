// history.js — Order History page logic

const customerIdInput = document.getElementById('customer-id-input')
const loadBtn = document.getElementById('load-btn')
const ordersSection = document.getElementById('orders-section')
const orderList = document.getElementById('order-list')
const emptyState = document.getElementById('empty-state')
const errorState = document.getElementById('error-state')

// Pre-fill customerId from localStorage if available
const savedCustomerId = localStorage.getItem('customerId')
if (savedCustomerId) {
  customerIdInput.value = savedCustomerId
}

loadBtn.addEventListener('click', () => loadOrders(customerIdInput.value.trim()))

async function loadOrders(customerId) {
  if (!customerId) {
    showError('Vui lòng nhập Customer ID.')
    return
  }

  clearStates()
  loadBtn.disabled = true
  loadBtn.textContent = 'Đang tải...'

  try {
    const response = await fetch(`/orders/customer/${encodeURIComponent(customerId)}`)
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(err.error || `HTTP ${response.status}`)
    }

    const orders = await response.json()
    ordersSection.style.display = 'block'
    renderOrders(orders, customerId)
  } catch (err) {
    showError(`Không thể tải đơn hàng: ${err.message}`)
  } finally {
    loadBtn.disabled = false
    loadBtn.textContent = 'Xem đơn hàng'
  }
}

function renderOrders(orders, customerId) {
  orderList.innerHTML = ''

  if (!orders || orders.length === 0) {
    emptyState.style.display = 'block'
    return
  }

  emptyState.style.display = 'none'

  for (const order of orders) {
    const productNames = order.items.map(i => i.productName).join(', ')
    const createdAt = new Date(order.createdAt).toLocaleString('vi-VN')

    const card = document.createElement('div')
    card.className = 'order-card'
    card.dataset.orderId = order.id
    card.setAttribute('role', 'listitem')

    const canCancel = order.status === 'Pending'

    card.innerHTML = `
      <div class="order-info">
        <div class="order-product">${productNames}</div>
        <div class="order-meta">Ngày đặt: ${createdAt} &nbsp;|&nbsp; Tổng: ${order.totalAmount.toLocaleString('vi-VN')} ${order.currency}</div>
        <span class="order-status status-${order.status}">${order.status}</span>
      </div>
      ${canCancel
        ? `<button class="cancel-btn" data-order-id="${order.id}">Huỷ đơn</button>`
        : ''}
    `

    orderList.appendChild(card)
  }

  // Attach cancel handlers
  orderList.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => cancelOrder(btn.dataset.orderId, customerId))
  })
}

async function cancelOrder(orderId, customerId) {
  const btn = orderList.querySelector(`.cancel-btn[data-order-id="${orderId}"]`)
  if (btn) {
    btn.disabled = true
    btn.textContent = 'Đang huỷ...'
  }

  const startTime = Date.now()

  try {
    const response = await fetch(`/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, reason: 'Cancelled by customer' }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(err.error || `HTTP ${response.status}`)
    }

    const elapsed = Date.now() - startTime
    console.log(`[history] Cancel completed in ${elapsed}ms`)

    // Reload orders để hiển thị status mới
    await loadOrders(customerId)
  } catch (err) {
    showError(`Không thể huỷ đơn: ${err.message}`)
    if (btn) {
      btn.disabled = false
      btn.textContent = 'Huỷ đơn'
    }
  }
}

function clearStates() {
  errorState.style.display = 'none'
  errorState.textContent = ''
  emptyState.style.display = 'none'
  orderList.innerHTML = ''
}

function showError(msg) {
  errorState.textContent = msg
  errorState.style.display = 'block'
}
