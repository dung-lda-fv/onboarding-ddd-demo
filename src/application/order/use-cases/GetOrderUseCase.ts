import { IOrderRepository } from "../../../domain/order/repositories/IOrderRepository.js";
import { OrderMapper } from "../dtos/OrderMapper.js";
import { OrderDTO } from "../dtos/OrderDTOs.js";
export class GetOrderUseCase {
    constructor(
        private readonly orderRepository: IOrderRepository
    ) {}

    async execute(orderId: string): Promise<OrderDTO> {
        // 1. Validate input (application concern)
        if (!orderId) {
            throw new Error('Order ID is required');
        }

        // 2. Retrieve order from repository (infrastructure concern — via port)
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // 3. Return DTO (application concern)
        return OrderMapper.toDTO(order);
    }
}