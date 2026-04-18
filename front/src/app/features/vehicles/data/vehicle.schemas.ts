import { z } from 'zod';
import { FUEL_TYPES } from './vehicle.model';

export const createVehicleSchema = z.object({
  plate: z
    .string()
    .trim()
    .min(1, 'Placa é obrigatória')
    .max(10, 'Placa deve ter no máximo 10 caracteres'),
  chassi: z
    .string()
    .trim()
    .min(1, 'Chassi é obrigatório')
    .max(32, 'Chassi deve ter no máximo 32 caracteres'),
  renavam: z
    .string()
    .trim()
    .min(1, 'Renavam é obrigatório')
    .max(20, 'Renavam deve ter no máximo 20 caracteres'),
  modelo: z
    .string()
    .trim()
    .min(1, 'Modelo é obrigatório')
    .max(120, 'Modelo deve ter no máximo 120 caracteres'),
  marca: z
    .string()
    .trim()
    .min(1, 'Marca é obrigatória')
    .max(120, 'Marca deve ter no máximo 120 caracteres'),
  ano: z.coerce
    .number()
    .int('Ano deve ser um número inteiro')
    .min(1900, 'Ano deve ser no mínimo 1900')
    .max(new Date().getFullYear() + 1, `Ano deve ser no máximo ${new Date().getFullYear() + 1}`),
  fuel: z.enum(FUEL_TYPES, { message: 'Combustível é obrigatório' }),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export type CreateVehicleFormData = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleFormData = z.infer<typeof updateVehicleSchema>;
