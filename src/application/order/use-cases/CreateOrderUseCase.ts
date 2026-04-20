import { IOrderRepository } from "../../../domain/order/repositories/IOrderRepository.js";
import { Order } from "../../../domain/order/entities/Order.js";
import { OrderItem } from "../../../domain/order/entities/OrderItem.js";
import { OrderMapper } from "../dtos/OrderMapper.js";
import { OrderDTO } from "../dtos/OrderDTOs.js";
import { CreateOrderCommand } from "../dtos/OrderDTOs.js";
import { Money } from "../../../domain/order/value-objects/Money.js";

/** Notify: these steps always follow the this sequence
 * 1. Validate input (application concern)
 * 2. Create domain object (domain concern)
 * 3. Execute business logic (domain concern)
 * 4. Persist (infrastructure concern — via port)
 * 5. Return DTO (application concern)
 **/
export class CreateOrderUseCase {
    constructor(private orderRepository: IOrderRepository) {}

    async execute(command: CreateOrderCommand): Promise<OrderDTO> {
        // 1. Validate input (application concern)
        if (!command.customerId) {
            throw new Error('Customer ID is required');
        }
        if (!command.items || command.items.length === 0) {
            throw new Error('At least one order item is required');
        }
        if (!command.items.every(item => item.quantity > 0)) {
            throw new Error('All order items must have quantity greater than zero');
        }
        if (!command.items.every(item => item.unitPrice > 0)) {
            throw new Error('All order items must have unit price greater than zero');
        }

        // 2. Create domain object (domain concern)
        const orderId = this.orderRepository.nextId();
        const currency = command.items[0].currency;
        const orderItems = command.items.map(item => new OrderItem(
            this.orderRepository.nextId(),
            {
                productId: item.productId,
                productName: item.productName,
                unitPrice: Money.of(item.unitPrice, currency),
                quantity: item.quantity,
                price: Money.of(item.unitPrice * item.quantity, currency)
            }
        ))

        const order = Order.create(orderId, {
            customerId: command.customerId,
            currency,
            items: orderItems
        })

        // 3. Execute business logic (domain concern)

        // 4. Persist (infrastructure concern — via port)
        await this.orderRepository.save(order);

        // 5. Return DTO (application concern)
        return OrderMapper.toDTO(order);    
    }
}