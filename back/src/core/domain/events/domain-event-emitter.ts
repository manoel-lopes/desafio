import type { DomainEvent } from '@/core/domain/events/domain-event'

export abstract class DomainEventEmitter {
  abstract emit<T extends DomainEvent> (event: T): void
}
