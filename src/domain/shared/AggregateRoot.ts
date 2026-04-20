import { Entity } from './Entity.js'

export interface DomainEvent {
  readonly occurredAt: Date
  readonly eventType: string
}

export abstract class AggregateRoot<TId> extends Entity<TId> {
  private _domainEvents: DomainEvent[] = []

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event)
  }

  clearDomainEvents(): void {
    this._domainEvents = []
  }
}