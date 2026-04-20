import { DomainEvent } from "../../shared/AggregateRoot.js";

export class OrderCreatedEvent implements DomainEvent {
    readonly occurredAt: Date = new Date();
    readonly eventType = 'OrderCreated'

    constructor(public readonly orderId: string, public readonly customerId: string) {
        this.orderId = orderId;
        this.customerId = customerId;
    }
}

export class OrderConfirmedEvent implements DomainEvent {
    readonly occurredAt: Date = new Date();
    readonly eventType = 'OrderConfirmed';

    constructor(
        public readonly orderId: string,
        public readonly customerId: string,
        public readonly totalAmount: number,
        public readonly currency: string
    ) {
  
    }
}

export class OrderCancelEvent implements DomainEvent {
    readonly occurredAt: Date = new Date();
    readonly eventType = 'OrderCancelled';
    
    constructor(
        public readonly orderId: string, 
        public readonly customerId: string,
        public readonly reason: string
    ) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.reason = reason;
    }
}