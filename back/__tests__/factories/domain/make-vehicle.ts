import { randomBytes } from 'node:crypto'
import type { CreateVehicleData } from '@/domain/application/repositories/vehicles.repository'
import { FuelType } from '@/domain/enterprise/entities/fuel-type'

let seq = 0
const MODELS = ['Sedan', 'Hatch', 'SUV', 'Pickup', 'Coupe']
const BRANDS = ['BrandA', 'BrandB', 'BrandC', 'BrandD']
const FUELS = [
  FuelType.GASOLINE,
  FuelType.ETHANOL,
  FuelType.DIESEL,
  FuelType.FLEX,
  FuelType.ELECTRIC,
  FuelType.HYBRID,
]

function alphanumericUpper (length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const bytes = randomBytes(length)
  let result = ''
  for (let i = 0; i < length; i += 1) {
    const byte = bytes[i]
    if (byte === undefined) {
      break
    }
    result += chars[byte % chars.length]
  }
  return result
}

function pickAt<T> (items: T[], index: number): T {
  const i = index % items.length
  const value = items[i]
  if (value !== undefined) {
    return value
  }
  const fallback = items[0]
  if (fallback === undefined) {
    throw new Error('pickAt: empty items')
  }
  return fallback
}

function intInRange (min: number, max: number): number {
  const span = max - min + 1
  const n = randomBytes(4).readUInt32BE(0) % span
  return min + n
}

export function makeVehicleData (override: Partial<CreateVehicleData> = {}): CreateVehicleData {
  seq += 1
  const n = seq
  return {
    plate: `ZZ${String(n).padStart(4, '0')}`,
    chassis: `CH${alphanumericUpper(10)}`,
    renavam: `RN${String(n).padStart(7, '0')}`,
    model: pickAt(MODELS, n),
    brand: pickAt(BRANDS, n),
    year: intInRange(2010, 2024),
    fuel: pickAt(FUELS, n),
    ...override,
  }
}
