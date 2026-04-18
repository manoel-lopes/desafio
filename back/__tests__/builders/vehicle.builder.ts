import type { CreateVehicleData } from '@/domain/application/repositories/vehicles.repository'
import { FuelType } from '@/domain/enterprise/entities/fuel-type'

export class VehicleBuilder {
  private props: CreateVehicleData = {
    plate: 'ABC0001',
    chassis: 'CHASSI0000000001',
    renavam: 'REN0000001',
    model: 'Sedan',
    brand: 'Acme',
    year: 2020,
    fuel: FuelType.GASOLINE,
  }

  withPlate (plate: string): this {
    this.props.plate = plate
    return this
  }

  withChassis (chassis: string): this {
    this.props.chassis = chassis
    return this
  }

  withRenavam (renavam: string): this {
    this.props.renavam = renavam
    return this
  }

  withModel (model: string): this {
    this.props.model = model
    return this
  }

  withBrand (brand: string): this {
    this.props.brand = brand
    return this
  }

  withYear (year: number): this {
    this.props.year = year
    return this
  }

  withFuel (fuel: FuelType): this {
    this.props.fuel = fuel
    return this
  }

  build (): CreateVehicleData {
    return { ...this.props }
  }
}

export function aVehicle (): VehicleBuilder {
  return new VehicleBuilder()
}
