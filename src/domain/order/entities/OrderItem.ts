import { Entity } from '../../shared/Entity.js';
import { Money } from '../value-objects/Money.js';

export interface OrderItemProps {
    productId: string;
    productName: string;
    unitPrice: Money;
    quantity: number;
    price: Money;
}

export class OrderItem extends Entity<string> {
    private readonly _productId: string;
    private readonly _productName: string
    private readonly _unitPrice: Money;
    private readonly _quantity: number;
    private readonly _price: Money;

    constructor(
        id: string,
        props: OrderItemProps
    ) {
        super(id);
        if (props.quantity <= 0) {
            throw new Error('Quantity must be greater than zero');
        }
        if (props.unitPrice.amount <= 0) {
            throw new Error('Unit price must be greater than zero');
        }

        this._productId = props.productId;
        this._productName = props.productName;
        this._unitPrice = props.unitPrice;
        this._quantity = props.quantity;
        this._price = props.price;
    }

    get productId(): string {
        return this._productId;
    }

    get productName(): string {
        return this._productName;
    }

    get unitPrice(): Money {
        return this._unitPrice;
    }

    get quantity(): number {
        return this._quantity;
    }

    get price(): Money {
        return this._price;
    }

    get subtotal(): Money {
        return this._unitPrice.multiply(this._quantity)
    }
}   