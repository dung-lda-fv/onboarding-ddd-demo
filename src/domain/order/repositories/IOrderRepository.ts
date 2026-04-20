import { Order} from "../entities/Order.js";

// This is port, just only an interface of Order repository
export interface IOrderRepository {
    save(order: Order): Promise<void>;
    findById(id: string): Promise<Order | null>;
    findByCustomerId(customerId: string): Promise<Order[]>;
    delete(id: string): Promise<void>;
    nextId(): string; // Method to generate the next unique ID for an order
}