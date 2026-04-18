import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

// 400 Bad Request
export const badRequestErrorSchema = z.object({
  statusCode: z.literal(400),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.literal('Bad Request'),
})
export class BadRequestErrorDto extends createZodDto(badRequestErrorSchema) {}

// 401 Unauthorized
export const unauthorizedErrorSchema = z.object({
  statusCode: z.literal(401),
  message: z.string(),
  error: z.literal('Unauthorized'),
})
export class UnauthorizedErrorDto extends createZodDto(unauthorizedErrorSchema) {}

// 403 Forbidden
export const forbiddenErrorSchema = z.object({
  statusCode: z.literal(403),
  message: z.string(),
  error: z.literal('Forbidden'),
})
export class ForbiddenErrorDto extends createZodDto(forbiddenErrorSchema) {}

// 404 Not Found
export const notFoundErrorSchema = z.object({
  statusCode: z.literal(404),
  message: z.string(),
  error: z.literal('Not Found'),
})
export class NotFoundErrorDto extends createZodDto(notFoundErrorSchema) {}

// 409 Conflict
export const conflictErrorSchema = z.object({
  statusCode: z.literal(409),
  message: z.string(),
  error: z.literal('Conflict'),
})
export class ConflictErrorDto extends createZodDto(conflictErrorSchema) {}

// 422 Unprocessable Entity
export const unprocessableEntityErrorSchema = z.object({
  statusCode: z.literal(422),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.literal('Unprocessable Entity'),
})
export class UnprocessableEntityErrorDto extends createZodDto(unprocessableEntityErrorSchema) {}

// 500 Internal Server Error
export const internalServerErrorSchema = z.object({
  statusCode: z.literal(500),
  message: z.string(),
  error: z.literal('Internal Server Error'),
})
export class InternalServerErrorDto extends createZodDto(internalServerErrorSchema) {}
