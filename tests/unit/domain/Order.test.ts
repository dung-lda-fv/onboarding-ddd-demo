import { describe, it, expect } from 'vitest'
import { Order } from '../../../src/domain/order/entities/Order.js'
import { OrderItem } from '../../../src/domain/order/entities/OrderItem.js'
import { Money } from '../../../src/domain/order/value-objects/Money.js'
import { OrderStatus } from '../../../src/domain/order/value-objects/OrderStatus.js'
import {
  OrderConfirmedEvent,
  OrderCancelEvent,
  OrderCreatedEvent,
} from '../../../src/domain/order/events/OrderEvents.js'

function makeItem(id = 'item-1', qty = 2, price = 50_000): OrderItem {
  return new OrderItem(id, {
    productId: 'prod-1',
    productName: 'Cà phê sữa',
    unitPrice: Money.of(price, 'VND'),
    quantity: qty,
    price: Money.of(price * qty, 'VND'),
  })
}

function makeOrder(id = 'order-1'): Order {
  return Order.create(id, { customerId: 'cust-1', currency: 'VND', items: [] })
}

describe('Order aggregate', () => {
  describe('tạo order', () => {
    it('tạo order mới với status PENDING', () => {
      const order = makeOrder()
      expect(order.status).toBe(OrderStatus.PENDING)
      expect(order.isEmpty).toBe(true)
    })

    it('emit OrderCreatedEvent khi tạo', () => {
      const order = makeOrder()
      expect(order.domainEvents).toHaveLength(1)
      expect(order.domainEvents[0]).toBeInstanceOf(OrderCreatedEvent)
    })

    it('ném lỗi khi không có customerId', () => {
      expect(() =>
        Order.create('o-1', { customerId: '', currency: 'VND', items: [makeItem()] })
      ).toThrow('customerId is required')
    })  
  })

  describe('addItem', () => {
    it('thêm item vào order PENDING', () => {
      const order = makeOrder()
      order.addItem(makeItem())
      expect(order.items).toHaveLength(1)
      expect(order.isEmpty).toBe(false)
    })

    it('tính tổng đúng với nhiều items', () => {
      const order = makeOrder()
      order.addItem(makeItem('item-1', 2, 50_000))
      order.addItem(makeItem('item-2', 3, 30_000))
      expect(order.totalAmount.amount).toBe(190_000)
    })

    it('không thể thêm item sau khi confirm', () => {
      const order = makeOrder()
      order.addItem(makeItem())
      order.confirm()
      expect(() => order.addItem(makeItem('item-2'))).toThrow('Cannot add items')
    })
  })

  describe('confirm', () => {
    it('confirm order PENDING thành công', () => {
      const order = makeOrder()
      order.addItem(makeItem())
      order.confirm()
      expect(order.status).toBe(OrderStatus.CONFIRMED)
    })

    it('emit OrderConfirmedEvent với đúng data', () => {
      const order = makeOrder()
      order.addItem(makeItem())
      order.clearDomainEvents()
      order.confirm()

      const event = order.domainEvents[0] as OrderConfirmedEvent
      expect(event).toBeInstanceOf(OrderConfirmedEvent)
      expect(event.orderId).toBe('order-1')
      expect(event.totalAmount).toBe(100_000)
    })

    it('không thể confirm order rỗng', () => {
      const order = makeOrder()
      expect(() => order.confirm()).toThrow('Cannot confirm an empty order')
    })

    it('không thể confirm order đã cancel', () => {
      const order = makeOrder()
      order.addItem(makeItem())
      order.cancel('test')
      expect(() => order.confirm()).toThrow('Invalid order status transition')
    })
  })

  describe('cancel', () => {
    it('cancel order PENDING thành công', () => {
      const order = makeOrder()
      order.addItem(makeItem())
      order.cancel('Khách đổi ý')
      expect(order.status).toBe(OrderStatus.CANCELLED)
    })

    it('emit OrderCancelledEvent với đúng reason', () => {
      const order = makeOrder()
      order.addItem(makeItem())
      order.clearDomainEvents()
      order.cancel('Khách đổi ý')

      const event = order.domainEvents[0] as OrderCancelEvent
      expect(event).toBeInstanceOf(OrderCancelEvent)
      expect(event.reason).toBe('Khách đổi ý')
    })

    it('ném lỗi khi cancel không có lý do', () => {
      const order = makeOrder()
      order.addItem(makeItem())
      expect(() => order.cancel('')).toThrow('Cancellation reason is required')
    })

    it('không thể cancel order đã SHIPPED', () => {
      const order = makeOrder()
      order.addItem(makeItem())
      order.confirm()
      order.ship()
      expect(() => order.cancel('quá muộn')).toThrow('Invalid order status transition')
    })
  })
})