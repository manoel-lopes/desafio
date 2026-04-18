import type { Vehicle } from '@/domain/enterprise/entities/vehicle.entity'

export function vehicleToHttp (vehicle: Vehicle) {
  return {
    id: vehicle.id,
    plate: vehicle.plate,
    chassis: vehicle.chassis,
    renavam: vehicle.renavam,
    model: vehicle.model,
    brand: vehicle.brand,
    year: vehicle.year,
    fuel: vehicle.fuel,
    createdAt: vehicle.createdAt.toISOString(),
    updatedAt: vehicle.updatedAt ? vehicle.updatedAt.toISOString() : null,
  }
}
