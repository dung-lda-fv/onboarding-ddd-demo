import { IOrderRepository } from "../../../domain/order/repositories/IOrderRepository.js";
import { INotificationService } from "../../../domain/order/services/INotificationService.js";
import { ConfirmOrderCommand, OrderDTO } from "../dtos/OrderDTOs.js";
import { OrderMapper } from "../dtos/OrderMapper.js";
import { OrderConfirmedEvent } from "../../../domain/order/events/OrderEvents.js";

/** Notify: these steps always follow the this sequence
 * 1. Validate input (application concern)
 * 2. Retrieve domain object (domain concern)
 * 3. Execute business logic (domain concern)
 * 4. Persist (infrastructure concern — via port)
 * 5. Return DTO (application concern)
 **/        

export class ConfirmOrderUseCase {
    constructor(
        private orderRepository: IOrderRepository,
        private notificationService: INotificationService
    ) {}

    async execute(command: ConfirmOrderCommand): Promise<OrderDTO> {
        // 1. Validate input (application concern)

        // 2. Retrieve domain object (domain concern)
        const order = await this.orderRepository.findById(command.orderId);
        if (!order) {
            throw new Error('Order ID is required');
        }

        // 3. Execute business logic (domain concern)
        order.confirm();

        // 4. Persist (infrastructure concern — via port)
        await this.orderRepository.save(order);

        for (const event of order.domainEvents) {
            if (event instanceof OrderConfirmedEvent) {
                await this.notificationService.sendOrderConfirmation({
                    customerId: event.customerId,
                    orderId: event.orderId,
                    totalAmount: event.totalAmount,
                    currency: event.currency
                });
            }
        }

        order.clearDomainEvents();

        // 5. Return DTO (application concern)
        return OrderMapper.toDTO(order);    
    }
}