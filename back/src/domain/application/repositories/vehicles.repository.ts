import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { Vehicle } from '@/domain/enterprise/entities/vehicle.entity'
import type { FuelType } from '@/domain/enterprise/entities/fuel-type'

export type CreateVehicleData = {
  plate: string
  chassis: string
  renavam: string
  model: string
  brand: string
  year: number
  fuel: FuelType
}

export type UpdateVehicleData = Partial<Omit<CreateVehicleData, never>>

export type VehiclesRepository = {
  create: (data: CreateVehicleData) => Promise<Vehicle>
  findById: (id: string) => Promise<Vehicle | null>
  findByPlate: (plate: string) => Promise<Vehicle | null>
  findByChassis: (chassis: string) => Promise<Vehicle | null>
  findByRenavam: (renavam: string) => Promise<Vehicle | null>
  findMany: (params: PaginationParams) => Promise<PaginatedItems<Vehicle>>
  update: (input: { where: { id: string }; data: UpdateVehicleData }) => Promise<Vehicle>
  delete: (id: string) => Promise<void>
}

export const VehiclesRepositoryToken = Symbol('VehiclesRepository')
