import { IOrderRepository } from "../../../domain/order/repositories/IOrderRepository.js";
import { INotificationService } from "../../../domain/order/services/INotificationService.js";
import { CancelOrderCommand, OrderDTO } from "../dtos/OrderDTOs.js";
import { OrderMapper } from "../dtos/OrderMapper.js";

export class CancelOrderUseCase {
    constructor(
        private orderRepository: IOrderRepository,
        private notificationService: INotificationService
    ) {}

    async execute(command: CancelOrderCommand): Promise<OrderDTO> {
        // 1. Validate input (application concern)
        if (!command.orderId) {
            throw new Error('Order ID is required');
        }
        if (!command.reason) {
            throw new Error('Cancellation reason is required');
        }

        // 2. Retrieve order (domain concern)
        const order = await this.orderRepository.findById(command.orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // 3. Execute business logic (domain concern)
        order.cancel(command.reason);

        // 4. Persist (infrastructure concern — via port)
        await this.orderRepository.save(order);

        // 5. Send cancellation notification (domain concern via port)
        await this.notificationService.sendOrderCancellation({
            customerId: order.customerId,
            orderId: order.id,
            reason: command.reason
        });

        // 6. Return DTO (application concern)
        return OrderMapper.toDTO(order);    
    }
}