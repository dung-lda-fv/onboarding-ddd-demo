// This is a port, just only an interface of Notification service, after confirm or cancel order, we will send notification to customer
export interface INotificationService {
    sendOrderConfirmation({
        customerId,
        orderId,
        totalAmount,
        currency
    }: {
        customerId: string;
        orderId: string;
        totalAmount: number;
        currency: string;
    }): Promise<void>;

    sendOrderCancellation({
        customerId,
        orderId,
        reason
    }: {
        customerId: string;
        orderId: string;
        reason: string;
    }): Promise<void>;
}


