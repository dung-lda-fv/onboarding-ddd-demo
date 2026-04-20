import { INotificationService } from "../../domain/order/services/INotificationService.js";

export class ConsoleNotificationAdapter implements INotificationService {
    async sendOrderConfirmation(params: {
        orderId: string;
        customerId: string;
        totalAmount: number;
        currency: string;
    }): Promise<void> {
        console.log(
            `Order Confirmation: Order ${params.orderId} 
            Customer ${params.customerId} 
            Total amount ${params.totalAmount} ${params.currency}
            SentAt ${new Date().toISOString()}`
        );
    }

    async sendOrderCancellation(params: {
        orderId: string;
        customerId: string;
        reason: string;
    }): Promise<void> {
        console.log(
            `Order Cancellation: Order ${params.orderId} 
            Customer ${params.customerId} 
            Reason: ${params.reason}
            SentAt ${new Date().toISOString()}`
        );
    }
}