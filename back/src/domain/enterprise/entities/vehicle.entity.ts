import type { Entity } from '@/core/domain/entity'
import type { FuelType } from '@/domain/enterprise/entities/fuel-type'

export interface VehicleProps {
  id: string
  plate: string
  chassis: string
  renavam: string
  model: string
  brand: string
  year: number
  fuel: FuelType
  createdAt: Date
  updatedAt: Date | null
}

export class Vehicle implements Entity {
  readonly id: string
  readonly plate: string
  readonly chassis: string
  readonly renavam: string
  readonly model: string
  readonly brand: string
  readonly year: number
  readonly fuel: FuelType
  readonly createdAt: Date
  readonly updatedAt: Date | null

  private constructor (props: VehicleProps) {
    this.id = props.id
    this.plate = props.plate
    this.chassis = props.chassis
    this.renavam = props.renavam
    this.model = props.model
    this.brand = props.brand
    this.year = props.year
    this.fuel = props.fuel
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static restore (props: VehicleProps): Vehicle {
    return new Vehicle(props)
  }
}
