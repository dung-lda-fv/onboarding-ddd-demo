// This file defines the base Entity class for the domain model.
export abstract class Entity<TId> {
  constructor(protected readonly _id: TId) {}

  get id(): TId {
    return this._id
  }

  // Two entities are considered equal if they have the same ID and are of the same type.
  equals(other: Entity<TId>): boolean {
    if (!(other instanceof Entity)) return false
    return this._id === other._id
  }
}
