import { OrderItem } from "./OrderItem.js";
import { OrderCreatedEvent, OrderConfirmedEvent, OrderCancelEvent } from "../events/OrderEvents.js";
import { AggregateRoot } from "../../shared/AggregateRoot.js";
import { assertValidTransition, OrderStatus } from "../value-objects/OrderStatus.js";
import { Money } from "../value-objects/Money.js";

export interface createOrderProps {
    customerId: string;
    currency: string;
    items: OrderItem[];
}

export class Order extends AggregateRoot<string> {
    private _customerId: string;
    private _currency: string;  
    private _items: Map<string, OrderItem> = new Map()
    private _status: OrderStatus;
    private _createdAt: Date;
    private _updatedAt: Date;

    constructor(id: string, props: createOrderProps) {
        super(id);
        this._customerId = props.customerId;
        this._currency = props.currency;
        this._items = new Map(props.items.map(item => [item.id, item]));
        this._status = OrderStatus.PENDING;
        this._createdAt = new Date();
        this._updatedAt = new Date();
    }

    static create(id: string, props: createOrderProps): Order {
        if (props.items.some(item => item.quantity <= 0)) {
            throw new Error('All order items must have quantity greater than zero');
        }

        if (!props.currency) {
            throw new Error('Currency is required');
        }

        if (!props.customerId) {
            throw new Error('customerId is required');
        }

        const order = new Order(id, props);
        order.addDomainEvent(new OrderCreatedEvent(order.id, order._customerId));
        return order;
    }

    // Reconstitute an order from persisted data (e.g., from a database).
    static reconstitute(
        id: string, 
        customerId: string,
        status: OrderStatus,
        items: OrderItem[],
        createdAt: Date,
        updatedAt: Date
    ): Order {
        const order = new Order(id, { customerId, currency: 'VND', items })
        order._status = status
        order._createdAt = createdAt
        order._updatedAt = updatedAt
        order._items = new Map(items.map(item => [item.id, item]))
        return order
    }

    get customerId(): string {
        return this._customerId;
    }

    get currency(): string {
        return this._currency;
    }

    get status(): OrderStatus {
        return this._status;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    get items(): OrderItem[] {
        return Array.from(this._items.values());
    }

    get totalAmount(): Money {
        return this.items.reduce(
            (total, item) => total.add(item.subtotal),
            Money.zero(this.items[0]?.unitPrice.currency ?? 'VND'),
        )
    }

    get isEmpty(): boolean {
        return this._items.size === 0;
    }

    addItem(item: OrderItem): void {
        if (this._status !== OrderStatus.PENDING) {
            throw new Error(`Cannot add items to an order with status: ${this._status}`);
        }

        this._items.set(item.id, item);
        this._updatedAt = new Date();
    }

    removeItem(itemId: string): void {
        if (this._status !== OrderStatus.PENDING) {
            throw new Error(`Cannot remove items from an order with status: ${this._status}`);
        }
        
        this._items.delete(itemId);
        this._updatedAt = new Date();
    }

    confirm() {
        if (this.isEmpty) {
            throw new Error('Cannot confirm an empty order');
        }
        assertValidTransition(this._status, OrderStatus.CONFIRMED);
        this._status = OrderStatus.CONFIRMED;
        this._updatedAt = new Date();
        this.addDomainEvent(
            new OrderConfirmedEvent(
                this.id,
                this._customerId,
                this.totalAmount.amount,
                this._currency
            )
        );
    }

    ship() {
        if (this._status !== OrderStatus.CONFIRMED) {
            throw new Error('Only confirmed orders can be shipped');
        }

        assertValidTransition(this._status, OrderStatus.SHIPPED)
        this._status = OrderStatus.SHIPPED
        this._updatedAt = new Date()
    }

    cancel(reason: string) {
        if (!reason || reason.trim().length === 0) {
            throw new Error('Cancellation reason is required');
        }
        assertValidTransition(this._status, OrderStatus.CANCELLED);
        this._status = OrderStatus.CANCELLED;
        this._updatedAt = new Date();
        this.addDomainEvent(
            new OrderCancelEvent(
                this.id,
                this._customerId,
                reason
            )
        );
    }
}