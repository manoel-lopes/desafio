import { Inject, Injectable } from '@nestjs/common'
import type { VehiclesRepository } from '@/domain/application/repositories/vehicles.repository'
import { VehiclesRepositoryToken } from '@/domain/application/repositories/vehicles.repository'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@Injectable()
export class DeleteVehicleUseCase {
  constructor (
    @Inject(VehiclesRepositoryToken) private readonly vehiclesRepository: VehiclesRepository
  ) {}

  async execute (input: { id: string }): Promise<void> {
    const existing = await this.vehiclesRepository.findById(input.id)
    if (!existing) {
      throw new ResourceNotFoundError('Vehicle')
    }
    await this.vehiclesRepository.delete(input.id)
  }
}
