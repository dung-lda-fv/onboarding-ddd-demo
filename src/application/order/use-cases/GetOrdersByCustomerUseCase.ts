import { IOrderRepository } from "../../../domain/order/repositories/IOrderRepository.js";
import { OrderMapper } from "../dtos/OrderMapper.js";
import { OrderDTO } from "../dtos/OrderDTOs.js";

export class GetOrdersByCustomerUseCase {
    constructor(
        private readonly orderRepository: IOrderRepository
    ) {}

    async execute(customerId: string): Promise<OrderDTO[]> {
        // 1. Validate input (application concern)
        if (!customerId) {
            throw new Error('Customer ID is required');
        }

        // 2. Retrieve orders from repository (infrastructure concern — via port)
        const orders = await this.orderRepository.findByCustomerId(customerId);
        if (!orders || orders.length === 0) {
            throw new Error('No orders found for this customer');
        }

        // 3. Return DTOs (application concern)
        return orders.map(order => OrderMapper.toDTO(order));
    }
}