import { Inject, Injectable } from '@nestjs/common'
import type { VehiclesRepository } from '@/domain/application/repositories/vehicles.repository'
import { VehiclesRepositoryToken } from '@/domain/application/repositories/vehicles.repository'
import type { Vehicle } from '@/domain/enterprise/entities/vehicle.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@Injectable()
export class GetVehicleByIdUseCase {
  constructor (
    @Inject(VehiclesRepositoryToken) private readonly vehiclesRepository: VehiclesRepository
  ) {}

  async execute (input: { id: string }): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findById(input.id)
    if (!vehicle) {
      throw new ResourceNotFoundError('Vehicle')
    }
    return vehicle
  }
}
