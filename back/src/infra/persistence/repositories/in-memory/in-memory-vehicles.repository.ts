import { uuidv7 } from 'uuidv7'
import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  CreateVehicleData,
  UpdateVehicleData,
  VehiclesRepository,
} from '@/domain/application/repositories/vehicles.repository'
import { Vehicle } from '@/domain/enterprise/entities/vehicle.entity'
import { formatPagination } from '@/infra/persistence/helpers/format-pagination.helper'

export class InMemoryVehiclesRepository implements VehiclesRepository {
  private items: Vehicle[] = []

  async create (data: CreateVehicleData): Promise<Vehicle> {
    const now = new Date()
    const vehicle = Vehicle.restore({
      id: uuidv7(),
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    this.items.push(vehicle)
    return vehicle
  }

  async findById (id: string): Promise<Vehicle | null> {
    return this.items.find((v) => v.id === id) ?? null
  }

  async findByPlate (plate: string): Promise<Vehicle | null> {
    return this.items.find((v) => v.plate === plate) ?? null
  }

  async findByChassis (chassis: string): Promise<Vehicle | null> {
    return this.items.find((v) => v.chassis === chassis) ?? null
  }

  async findByRenavam (renavam: string): Promise<Vehicle | null> {
    return this.items.find((v) => v.renavam === renavam) ?? null
  }

  async findMany (params: PaginationParams): Promise<PaginatedItems<Vehicle>> {
    const { page, pageSize, skip, take } = formatPagination(
      params.page ?? 1,
      params.pageSize ?? 20
    )
    const order = params.order ?? 'desc'
    const sorted = [...this.items].sort((a, b) =>
      order === 'asc'
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime()
    )
    const totalItems = sorted.length
    const totalPages = Math.ceil(totalItems / pageSize) || 0
    const items = sorted.slice(skip, skip + take)
    return {
      page,
      pageSize,
      totalItems,
      totalPages,
      items,
      order,
    }
  }

  async update (input: { where: { id: string }; data: UpdateVehicleData }): Promise<Vehicle> {
    const index = this.items.findIndex((v) => v.id === input.where.id)
    const existing = this.items[index]
    if (!existing) {
      throw new Error('Vehicle not found')
    }
    const updated = Vehicle.restore({
      id: existing.id,
      plate: input.data.plate ?? existing.plate,
      chassis: input.data.chassis ?? existing.chassis,
      renavam: input.data.renavam ?? existing.renavam,
      model: input.data.model ?? existing.model,
      brand: input.data.brand ?? existing.brand,
      year: input.data.year ?? existing.year,
      fuel: input.data.fuel ?? existing.fuel,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    })
    this.items[index] = updated
    return updated
  }

  async delete (id: string): Promise<void> {
    this.items = this.items.filter((v) => v.id !== id)
  }
}
