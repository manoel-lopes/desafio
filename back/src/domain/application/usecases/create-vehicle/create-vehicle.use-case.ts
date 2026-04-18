import { Inject, Injectable } from '@nestjs/common'
import {
  type CreateVehicleData,
  type VehiclesRepository,
  VehiclesRepositoryToken,
} from '@/domain/application/repositories/vehicles.repository'
import { VehicleAlreadyExistsError } from '@/domain/application/usecases/errors/vehicle-already-exists.error'
import type { Vehicle } from '@/domain/enterprise/entities/vehicle.entity'

@Injectable()
export class CreateVehicleUseCase {
  constructor (
    @Inject(VehiclesRepositoryToken) private readonly vehiclesRepository: VehiclesRepository
  ) {}

  async execute (input: CreateVehicleData): Promise<Vehicle> {
    const [byPlate, byChassis, byRenavam] = await Promise.all([
      this.vehiclesRepository.findByPlate(input.plate),
      this.vehiclesRepository.findByChassis(input.chassis),
      this.vehiclesRepository.findByRenavam(input.renavam),
    ])
    if (byPlate || byChassis || byRenavam) {
      throw new VehicleAlreadyExistsError()
    }
    return this.vehiclesRepository.create(input)
  }
}
