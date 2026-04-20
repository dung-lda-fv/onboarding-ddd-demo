export interface CreateOrderItemInput{
    productId: string,
    productName: string,
    unitPrice: number,
    quantity: number,
    currency: string
}

export interface CreateOrderCommand {
    customerId: string;
    items: CreateOrderItemInput[];
}

export interface ConfirmOrderCommand {
    orderId: string;
}

export interface CancelOrderCommand {
    orderId: string;
    reason: string;
}

//output
export interface OrderItemDTO {
    id: string,
    productId: string,
    productName: string,
    unitPrice: number,
    currency: string
    quantity: number,
    subTotal: number,
}

export interface OrderDTO {
    id: string;
    customerId: string;
    status: string;
    items: OrderItemDTO[];
    totalAmount: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
}