import { Inject, Injectable } from '@nestjs/common'
import type { UpdateVehicleData, VehiclesRepository } from '@/domain/application/repositories/vehicles.repository'
import { VehiclesRepositoryToken } from '@/domain/application/repositories/vehicles.repository'
import { VehicleAlreadyExistsError } from '@/domain/application/usecases/errors/vehicle-already-exists.error'
import type { Vehicle } from '@/domain/enterprise/entities/vehicle.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@Injectable()
export class UpdateVehicleUseCase {
  constructor (
    @Inject(VehiclesRepositoryToken) private readonly vehiclesRepository: VehiclesRepository
  ) {}

  async execute (input: { id: string; data: UpdateVehicleData }): Promise<Vehicle> {
    const existing = await this.vehiclesRepository.findById(input.id)
    if (!existing) {
      throw new ResourceNotFoundError('Vehicle')
    }
    const keys = Object.keys(input.data)
    if (keys.length === 0) {
      return existing
    }
    await this.assertUniqueFields(existing.id, input.data, existing)
    return this.vehiclesRepository.update({
      where: { id: input.id },
      data: input.data,
    })
  }

  private async assertUniqueFields (
    id: string,
    data: UpdateVehicleData,
    existing: Vehicle
  ): Promise<void> {
    const plate = data.plate ?? existing.plate
    const chassis = data.chassis ?? existing.chassis
    const renavam = data.renavam ?? existing.renavam
    if (data.plate && data.plate !== existing.plate) {
      const other = await this.vehiclesRepository.findByPlate(plate)
      if (other && other.id !== id) {
        throw new VehicleAlreadyExistsError()
      }
    }
    if (data.chassis && data.chassis !== existing.chassis) {
      const other = await this.vehiclesRepository.findByChassis(chassis)
      if (other && other.id !== id) {
        throw new VehicleAlreadyExistsError()
      }
    }
    if (data.renavam && data.renavam !== existing.renavam) {
      const other = await this.vehiclesRepository.findByRenavam(renavam)
      if (other && other.id !== id) {
        throw new VehicleAlreadyExistsError()
      }
    }
  }
}
