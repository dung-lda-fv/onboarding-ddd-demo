import express from 'express'

// Infrastructure — concrete implementations
import { InMemoryOrderRepository } from './infrastructure/persistence/memory/InMemoryOrderRepository.js'
import { ConsoleNotificationAdapter } from './infrastructure/notification/ConsoleNotificationAdapter.js'
import { OrderController } from './infrastructure/http/controllers/OrderController.js'
import { createOrderRouter } from './infrastructure/http/routes/orderRoutes.js'

// Application — use cases
import { CreateOrderUseCase } from './application/order/use-cases/CreateOrderUseCase.js'
import { ConfirmOrderUseCase } from './application/order/use-cases/ConfirmOrderUseCase.js'
import { CancelOrderUseCase } from './application/order/use-cases/CancelOrderUseCase.js'
import { GetOrderUseCase } from './application/order/use-cases/GetOrderUseCase.js'
import { SqliteOrderRepository } from './infrastructure/persistence/sqllite/SqliteOrderRepository.js'
import { CreateDatabase } from './infrastructure/persistence/sqllite/database.js'

// ── 1. Infrastructure adapters ────────────────────────
const db = CreateDatabase(); // Creates or opens the SQLite database file
const orderRepository = new SqliteOrderRepository(db);
const notificationService = new ConsoleNotificationAdapter()

// ── 2. Application use cases ──────────────────────────
const createOrderUseCase = new CreateOrderUseCase(orderRepository)
const confirmOrderUseCase = new ConfirmOrderUseCase(orderRepository, notificationService)
const cancelOrderUseCase = new CancelOrderUseCase(orderRepository, notificationService)
const getOrderUseCase = new GetOrderUseCase(orderRepository)

// ── 3. HTTP controller ────────────────────────────────
const orderController = new OrderController(
  createOrderUseCase,
  cancelOrderUseCase,
  confirmOrderUseCase,
  getOrderUseCase,
)

// ── 4. Express app ────────────────────────────────────
const app = express()
app.use(express.json())
app.use('/orders', createOrderRouter(orderController))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── 5. Start server ───────────────────────────────────
const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`
  Order Management API
  ──────────────────────────────
  Running  : http://localhost:${PORT}
  Health   : http://localhost:${PORT}/health

  Endpoints:
    POST   /orders
    GET    /orders/:id
    POST   /orders/:id/confirm
    POST   /orders/:id/cancel
  `)
})