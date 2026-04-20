import { Order } from '../../../domain/order/entities/Order.js';
import { OrderDTO, OrderItemDTO } from './OrderDTOs.js';

export class OrderMapper {
    static toDTO(order: Order): OrderDTO {
        const items: OrderItemDTO[] = order.items.map(item => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            unitPrice: item.unitPrice.amount,
            currency: item.unitPrice.currency,
            quantity: item.quantity,
            subTotal: item.subtotal.amount,
        }))

        const total = order.totalAmount
        return {
            id: order.id,
            customerId: order.customerId,
            status: order.status,
            items,
            totalAmount: total.amount,
            currency: total.currency,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
        }
    }
}