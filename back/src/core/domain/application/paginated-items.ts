import type { Entity } from '@/core/domain/entity'

export interface PaginatedItems<T extends Entity> {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  items: T[]
  order: 'asc' | 'desc'
}
