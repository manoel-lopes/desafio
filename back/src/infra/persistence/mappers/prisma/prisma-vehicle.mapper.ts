import type { Vehicle as PrismaVehicle } from '@prisma/client'
import { FuelType } from '@/domain/enterprise/entities/fuel-type'
import { Vehicle } from '@/domain/enterprise/entities/vehicle.entity'

function fuelFromPrisma (raw: PrismaVehicle['fuel']): FuelType {
  switch (raw) {
    case 'GASOLINE':
      return FuelType.GASOLINE
    case 'ETHANOL':
      return FuelType.ETHANOL
    case 'DIESEL':
      return FuelType.DIESEL
    case 'FLEX':
      return FuelType.FLEX
    case 'ELECTRIC':
      return FuelType.ELECTRIC
    case 'HYBRID':
      return FuelType.HYBRID
    default: {
      const exhaustive: never = raw
      throw new Error(`Unexpected fuel value: ${String(exhaustive)}`)
    }
  }
}

export class PrismaVehicleMapper {
  static toDomain (raw: PrismaVehicle): Vehicle {
    return Vehicle.restore({
      id: raw.id,
      plate: raw.plate,
      chassis: raw.chassis,
      renavam: raw.renavam,
      model: raw.model,
      brand: raw.brand,
      year: raw.year,
      fuel: fuelFromPrisma(raw.fuel),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    })
  }
}
