import Database from 'better-sqlite3'
import { IOrderRepository } from '../../../domain/order/repositories/IOrderRepository.js'
import { Order } from '../../../domain/order/entities/Order.js'
import { OrderItem } from '../../../domain/order/entities/OrderItem.js'
import { Money } from '../../../domain/order/value-objects/Money.js'
import { OrderStatus } from '../../../domain/order/value-objects/OrderStatus.js'

interface OrderRow {
  id: string
  customer_id: string
  status: string
  created_at: string
  updated_at: string
}

interface OrderItemRow {
  id: string
  order_id: string
  product_id: string
  product_name: string
  unit_price: number
  currency: string
  quantity: number
}

export class SqliteOrderRepository implements IOrderRepository {
  private counter = 0

  constructor(private readonly db: Database.Database) {}

  nextId(): string {
    this.counter++
    return `order-${Date.now()}-${this.counter}`
  }

  async save(order: Order): Promise<void> {
    const saveOrder = this.db.prepare(`
      INSERT INTO orders (id, customer_id, currency, status, created_at, updated_at)
      VALUES (@id, @customerId, @currency, @status, @createdAt, @updatedAt)
      ON CONFLICT(id) DO UPDATE SET
        status     = @status,
        updated_at = @updatedAt
    `)

    const saveItem = this.db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity, price)
      VALUES (@id, @orderId, @productId, @productName, @unitPrice, @currency, @quantity, @price)
      ON CONFLICT(id) DO NOTHING
    `)

    const transaction = this.db.transaction(() => {
      saveOrder.run({
        id: order.id,
        customerId: order.customerId,
        currency: order.currency,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      })

      for (const item of order.items) {
        saveItem.run({
          id: item.id,
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          unitPrice: item.unitPrice.amount,
          currency: item.unitPrice.currency,
          quantity: item.quantity,
          price: item.price.amount,
        })
      }
    })

    transaction()
  }

  async findById(id: string): Promise<Order | null> {
    const row = this.db.prepare(
      'SELECT * FROM orders WHERE id = ?'
    ).get(id) 

    if (!row) return null

    return this.reconstituteOrder(row as OrderRow)
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const orderRows = this.db.prepare('SELECT * FROM orders WHERE customer_id = ?').all(customerId)
    return Promise.all(orderRows.map((row: any) => this.findById(row.id) as Promise<Order>)).then(orders => orders.filter(order => order !== null) as Order[])
  }

  async findAll(): Promise<Order[]> {
    const orderRows = this.db.prepare('SELECT * FROM orders').all()
    return Promise.all(orderRows.map((row: any) => this.findById(row.id) as Promise<Order>)).then(orders => orders.filter(order => order !== null) as Order[])
  }

  async delete(id: string): Promise<void> {
    this.db.prepare('DELETE FROM orders WHERE id = ?').run(id)
  }

  private reconstituteOrder(row: OrderRow): Order {
    const itemRows = this.db.prepare(
        'SELECT * FROM order_items WHERE order_id = ?'
    ).all(row.id) as OrderItemRow[]

    const items = itemRows.map(i =>
        new OrderItem(i.id, {
            productId: i.product_id,
            productName: i.product_name,
            unitPrice: Money.of(i.unit_price, i.currency),
            quantity: i.quantity,
            price: Money.of(i.unit_price * i.quantity, i.currency),
        })
    )

    return Order.reconstitute(
        row.id,
        row.customer_id,
        row.status as OrderStatus,
        items,
        new Date(row.created_at),
        new Date(row.updated_at),
    )
   }
}