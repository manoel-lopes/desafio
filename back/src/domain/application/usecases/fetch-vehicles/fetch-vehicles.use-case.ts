import { Inject, Injectable } from '@nestjs/common'
import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { VehiclesRepository } from '@/domain/application/repositories/vehicles.repository'
import { VehiclesRepositoryToken } from '@/domain/application/repositories/vehicles.repository'
import type { Vehicle } from '@/domain/enterprise/entities/vehicle.entity'

@Injectable()
export class FetchVehiclesUseCase {
  constructor (
    @Inject(VehiclesRepositoryToken) private readonly vehiclesRepository: VehiclesRepository
  ) {}

  async execute (input: PaginationParams): Promise<PaginatedItems<Vehicle>> {
    return this.vehiclesRepository.findMany(input)
  }
}
