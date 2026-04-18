import { randomUUID } from 'node:crypto'
import type { CreateVehicleData } from '@/domain/application/repositories/vehicles.repository'
import { aVehicle } from '@tests/builders/vehicle.builder'

export function uniqueVehicleBody (): CreateVehicleData {
  const s = randomUUID().replaceAll('-', '').slice(0, 10)
  return aVehicle()
    .withPlate(`Z${s.slice(0, 7)}`)
    .withChassis(`CH${s}`)
    .withRenavam(`RN${s.slice(0, 8)}`)
    .build()
}
