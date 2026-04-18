import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { FuelType } from '@/domain/enterprise/entities/fuel-type'

export const createVehicleBodySchema = z.object({
  plate: z.string().trim().min(1).max(10),
  chassis: z.string().trim().min(1).max(32),
  renavam: z.string().trim().min(1).max(20),
  model: z.string().trim().min(1).max(120),
  brand: z.string().trim().min(1).max(120),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  fuel: z.nativeEnum(FuelType),
})

export class CreateVehicleBodyDto extends createZodDto(createVehicleBodySchema) {}

export const updateVehicleBodySchema = createVehicleBodySchema.partial()

export class UpdateVehicleBodyDto extends createZodDto(updateVehicleBodySchema) {}

export const vehicleParamsSchema = z.object({
  id: z.string().uuid(),
})

export class VehicleParamsDto extends createZodDto(vehicleParamsSchema) {}

export const vehicleResponseSchema = z.object({
  id: z.string().uuid(),
  plate: z.string(),
  chassis: z.string(),
  renavam: z.string(),
  model: z.string(),
  brand: z.string(),
  year: z.number(),
  fuel: z.nativeEnum(FuelType),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
})

export class VehicleResponseDto extends createZodDto(vehicleResponseSchema) {}
