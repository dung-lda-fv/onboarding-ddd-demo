import { IOrderRepository } from "../../../domain/order/repositories/IOrderRepository.js";
import { Order } from "../../../domain/order/entities/Order.js";
export class InMemoryOrderRepository implements IOrderRepository {
    private store = new Map<string, Order>();
    private counter = 0;

    nextId(): string {
        this.counter++;
        return `order-${this.counter}`;
    }

    async save(order: Order): Promise<void> {
        this.store.set(order.id, order);
    }

    async findById(id: string): Promise<Order | null> {
        return this.store.get(id) || null;
    }

    async findByCustomerId(customerId: string): Promise<Order[]> {
        return Array.from(this.store.values()).filter(order => order.customerId === customerId);
    }

    findAll(): Order[] {
        return Array.from(this.store.values());
    }

    async delete(id: string): Promise<void> {
        this.store.delete(id);
    }

    clear(): void {
        this.store.clear();
        this.counter = 0;
    }
}