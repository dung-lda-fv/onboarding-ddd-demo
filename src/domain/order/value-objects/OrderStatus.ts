export enum OrderStatus {
    PENDING = 'Pending',
    CONFIRMED = 'Confirmed',
    SHIPPED = 'Shipped',
    DELIVERED = 'Delivered',
    CANCELLED = 'Cancelled'
}

export function assertValidTransition(
  from: OrderStatus,
  to: OrderStatus,
): void {
  const allowed: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  }

  if (!allowed[from].includes(to)) {
    throw new Error(`Invalid order status transition: ${from} → ${to}`)
  }
}

