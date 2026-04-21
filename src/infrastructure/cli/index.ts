import { CreateOrderUseCase } from '../../application/order/use-cases/CreateOrderUseCase.js'
import { ConfirmOrderUseCase } from '../../application/order/use-cases/ConfirmOrderUseCase.js'
import { CancelOrderUseCase } from '../../application/order/use-cases/CancelOrderUseCase.js'
import { GetOrderUseCase } from '../../application/order/use-cases/GetOrderUseCase.js'
import { InMemoryOrderRepository } from '../persistence/memory/InMemoryOrderRepository.js'
import { ConsoleNotificationAdapter } from '../notification/ConsoleNotificationAdapter.js'

// ── 1. Infrastructure adapters ────────────────────────
const orderRepository = new InMemoryOrderRepository()
const repo = new InMemoryOrderRepository()
const notifier = new ConsoleNotificationAdapter()
const createOrder = new CreateOrderUseCase(repo)
const confirmOrder = new ConfirmOrderUseCase(repo, notifier)
const cancelOrder = new CancelOrderUseCase(repo, notifier)
const getOrder = new GetOrderUseCase(repo)

// ── 2. CLI commands ────────────────────────────────
const [, , command, ...args] = process.argv

async function run() {
    switch(command) {
        case 'create': {
            const [customerId, ...itemArgs] = args
            const itemFieldsList = itemArgs.some(arg => arg.includes(','))
                ? itemArgs.map(arg => arg.split(','))
                : (() => {
                    if (itemArgs.length % 5 !== 0) {
                        throw new Error('Invalid create command arguments. Each order item must include: productId productName unitPrice currency quantity')
                    }
                    const chunks: string[][] = []
                    for (let i = 0; i < itemArgs.length; i += 5) {
                        chunks.push(itemArgs.slice(i, i + 5))
                    }
                    return chunks
                })()
            const items = itemFieldsList.map(fields => {
                const [productId, productName, unitPrice, currency, quantity] = fields
                return { productId, productName, unitPrice: Number(unitPrice), currency, quantity: Number(quantity) }
            })
            const result = await createOrder.execute({ customerId, items })
            console.log('Order created:', result)
            break
        }

        case 'confirm': {
            const [orderId] = args
            const result = await confirmOrder.execute({ orderId })
            console.log('Order confirmed:', result)
            break
        }

        case 'cancel': {
            const [orderId, reason] = args
            const result = await cancelOrder.execute({ orderId, reason })
            console.log('Order cancelled:', result)
            break
        }

        case 'get': {
            const [orderId] = args
            const result = await getOrder.execute(orderId)
            console.log('Order details:', result)
            break
        }

        default:
            console.log('Unknown command. Use "create", "confirm", "cancel", or "get".')
    }
}

run().catch(err => {
    console.error('Error:', err.message)
})