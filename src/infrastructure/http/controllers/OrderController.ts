import { Request, Response } from "express";
import { CreateOrderUseCase } from "../../../application/order/use-cases/CreateOrderUseCase.js";
import { CancelOrderUseCase } from "../../../application/order/use-cases/CancelOrderUseCase.js";
import { ConfirmOrderUseCase } from "../../../application/order/use-cases/ConfirmOrderUseCase.js";
import { GetOrderUseCase } from "../../../application/order/use-cases/GetOrderUseCase.js";
import { GetOrdersByCustomerUseCase } from "../../../application/order/use-cases/GetOrdersByCustomerUseCase.js";

export class OrderController {
    constructor(
        private readonly createOrder: CreateOrderUseCase,
        private readonly cancelOrder: CancelOrderUseCase,
        private readonly confirmOrder: ConfirmOrderUseCase,
        private readonly getOrderById: GetOrderUseCase,
        private readonly getOrdersByCustomer: GetOrdersByCustomerUseCase,
    ) {}   
    
    async create(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.createOrder.execute(req.body);
            res.status(201).json(result);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async cancel(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.cancelOrder.execute(req.body);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    private requireSingleParam(value: string | string[] | undefined, name: string): string {
        if (Array.isArray(value)) {
            if (value.length === 0) {
                throw new Error(`${name} is required`);
            }
            return value[0];
        }
        if (!value) {
            throw new Error(`${name} is required`);
        }
        return value;
    }

    async confirm(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.confirmOrder.execute({
                orderId: this.requireSingleParam(req.params.orderId, 'orderId')
            });
            res.status(200).json(result);
        } catch (err) {
            this.handleError(res, err);
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const orderId = this.requireSingleParam(req.params.id, 'id');
            const result = await this.getOrderById.execute(orderId);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async getByCustomerId(req: Request, res: Response): Promise<void> {
        try {
            const customerId = this.requireSingleParam(req.params.customerId, 'customerId');
            const result = await this.getOrdersByCustomer.execute(customerId);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    private handleError(res: Response, err: unknown): void {
        const message = err instanceof Error ? err.message : 'Unknown error'

        if (message.includes('not found')) {
            res.status(404).json({ error: message })
            return
        }

        if (message.includes('Invalid order status transition')) {
            res.status(422).json({ error: message })
            return
        }

        if (message.includes('required') || message.includes('must have')) {
            res.status(400).json({ error: message })
            return
        }

        console.error('[OrderController] Unhandled error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
}