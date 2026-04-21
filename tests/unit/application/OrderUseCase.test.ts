import { describe, it, expect, beforeEach } from 'vitest'
import { CreateOrderUseCase } from '../../../src/application/order/use-cases/CreateOrderUseCase.js'
import { ConfirmOrderUseCase } from '../../../src/application/order/use-cases/ConfirmOrderUseCase.js'
import { CancelOrderUseCase } from '../../../src/application/order/use-cases/CancelOrderUseCase.js'
import { InMemoryOrderRepository } from '../../../src/infrastructure/persistence/memory/InMemoryOrderRepository.js'
import { INotificationService } from '../../../src/domain/order/services/INotificationService.js'
import { OrderStatus } from '../../../src/domain/order/value-objects/OrderStatus.js'
import { GetOrdersByCustomerUseCase } from '../../../src/application/order/use-cases/GetOrdersByCustomerUseCase.js'
import { OrderDTO } from '../../../src/application/order/dtos/OrderDTOs.js'

class FakeNotificationService implements INotificationService {
  confirmationsSent: Array<{ orderId: string }> = []
  cancellationsSent: Array<{ orderId: string }> = []

  async sendOrderConfirmation(params: {
    orderId: string
    customerId: string
    totalAmount: number
    currency: string
  }) {
    this.confirmationsSent.push({ orderId: params.orderId })
  }

  async sendOrderCancellation(params: {
    orderId: string
    customerId: string
    reason: string
  }) {
    this.cancellationsSent.push({ orderId: params.orderId })
  }
}

describe('Order use cases', () => {
  let repo: InMemoryOrderRepository
  let notifier: FakeNotificationService
  let createOrder: CreateOrderUseCase
  let confirmOrder: ConfirmOrderUseCase
  let cancelOrder: CancelOrderUseCase
  let getOrdersByCustomer: GetOrdersByCustomerUseCase

  beforeEach(() => {
    repo = new InMemoryOrderRepository()
    notifier = new FakeNotificationService()
    createOrder = new CreateOrderUseCase(repo)
    confirmOrder = new ConfirmOrderUseCase(repo, notifier)
    cancelOrder = new CancelOrderUseCase(repo, notifier)
    getOrdersByCustomer = new GetOrdersByCustomerUseCase(repo)
  })

  describe('CreateOrderUseCase', () => {
    it('tạo order và trả về DTO', async () => {
      const result = await createOrder.execute({
        customerId: 'cust-1',
        items: [{
          productId: 'prod-1',
          productName: 'Laptop',
          unitPrice: 20_000_000,
          currency: 'VND',
          quantity: 1,
        }],
      })

      expect(result.id).toBeDefined()
      expect(result.customerId).toBe('cust-1')
      expect(result.status).toBe(OrderStatus.PENDING)
      expect(result.items).toHaveLength(1)
      expect(result.totalAmount).toBe(20_000_000)
    })

    it('persist order vào repository', async () => {
      const result = await createOrder.execute({
        customerId: 'cust-1',
        items: [{
          productId: 'p1',
          productName: 'Chuột',
          unitPrice: 500_000,
          currency: 'VND',
          quantity: 2,
        }],
      })

      const saved = await repo.findById(result.id)
      expect(saved).not.toBeNull()
      expect(saved!.customerId).toBe('cust-1')
    })

    it('ném lỗi khi không có customerId', async () => {
      await expect(
        createOrder.execute({ customerId: '', items: [] })
      ).rejects.toThrow('customer ID is required')
    })

    it('ném lỗi khi không có items', async () => {
      await expect(
        createOrder.execute({ customerId: 'c1', items: [] })
      ).rejects.toThrow('At least one order item is required')
    })
  })

  describe('ConfirmOrderUseCase', () => {
    it('confirm order và gửi notification', async () => {
      const created = await createOrder.execute({
        customerId: 'cust-1',
        items: [{
          productId: 'p1',
          productName: 'Bàn phím',
          unitPrice: 800_000,
          currency: 'VND',
          quantity: 1,
        }],
      })

      const confirmed = await confirmOrder.execute({ orderId: created.id })

      expect(confirmed.status).toBe(OrderStatus.CONFIRMED)
      expect(notifier.confirmationsSent).toHaveLength(1)
      expect(notifier.confirmationsSent[0].orderId).toBe(created.id)
    })

    it('ném lỗi khi order không tồn tại', async () => {
      await expect(
        confirmOrder.execute({ orderId: 'non-existent' })
      ).rejects.toThrow('Order ID is required')
    })
  })

  describe('CancelOrderUseCase', () => {
    it('cancel order và gửi notification', async () => {
      const created = await createOrder.execute({
        customerId: 'cust-1',
        items: [{
          productId: 'p1',
          productName: 'Màn hình',
          unitPrice: 5_000_000,
          currency: 'VND',
          quantity: 1,
        }],
      })

      const cancelled = await cancelOrder.execute({
        orderId: created.id,
        reason: 'Khách đổi ý',
      })

      expect(cancelled.status).toBe(OrderStatus.CANCELLED)
      expect(notifier.cancellationsSent).toHaveLength(1)
    })

    it('ném lỗi khi order không tồn tại', async () => {
      await expect(
        cancelOrder.execute({ orderId: 'xyz', reason: 'test' })
      ).rejects.toThrow('Order not found')
    })
  })

  describe("GetOrdersByCustomerUseCase", () => {
    it('lấy tất cả orders của một customer', async () => {
        // Arrange — tạo 2 orders cho cust-1, 1 order cho cust-2
        await createOrder.execute({
            customerId: 'cust-1',
            items: [{
              productId: 'p1',
              productName: 'Sạc dự phòng',
              unitPrice: 300_000,
              currency: 'VND',
              quantity: 1,
            }],
        })
        await createOrder.execute({
            customerId: 'cust-1',
            items: [{
              productId: 'p2',
              productName: 'Tai nghe',
              unitPrice: 1_000_000,
              currency: 'VND',
              quantity: 1,
            }],
        })
        await createOrder.execute({
            customerId: 'cust-2',
            items: [{
              productId: 'p3',
              productName: 'Chuột',
              unitPrice: 500_000,
              currency: 'VND',
              quantity: 1,
            }],
        })  

        // Act — gọi use case
        const orders = await getOrdersByCustomer.execute('cust-1')
        // Assert — expect trả về đúng 2 orders của cust-1
        expect(orders).toHaveLength(2)
        expect(orders.every((order: OrderDTO) => order.customerId === 'cust-1')).toBe(true)
    })
  });
})