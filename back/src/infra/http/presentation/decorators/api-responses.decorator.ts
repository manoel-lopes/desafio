import { applyDecorators, Type } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import {
  BadRequestErrorDto,
  ConflictErrorDto,
  ForbiddenErrorDto,
  InternalServerErrorDto,
  NotFoundErrorDto,
  UnauthorizedErrorDto,
  UnprocessableEntityErrorDto,
} from './error-response.dto'

type SuccessResponseOptions = {
  type?: Type<unknown>
  description?: string
}

type ErrorResponseOptions = { description?: string } | string

export function ApiCreatedResponse (options: SuccessResponseOptions | string = 'Resource created successfully') {
  const opts = typeof options === 'string' ? { description: options } : options
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: opts.description ?? 'Resource created successfully',
      type: opts.type
    })
  )
}

export function ApiOkResponse (options: SuccessResponseOptions | string = 'Request successful') {
  const opts = typeof options === 'string' ? { description: options } : options
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: opts.description ?? 'Request successful',
      type: opts.type
    })
  )
}

export function ApiNoContentResponse (description = 'Request successful, no content returned') {
  return applyDecorators(
    ApiResponse({ status: 204, description })
  )
}

export function ApiBadRequestResponse (options?: ErrorResponseOptions) {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: getDescription(options, 'Bad request - validation error'),
      type: BadRequestErrorDto
    })
  )
}

export function ApiUnauthorizedResponse (options?: ErrorResponseOptions) {
  return applyDecorators(
    ApiResponse({
      status: 401,
      description: getDescription(options, 'Unauthorized - invalid or missing authentication token'),
      type: UnauthorizedErrorDto
    })
  )
}

export function ApiForbiddenResponse (options?: ErrorResponseOptions) {
  return applyDecorators(
    ApiResponse({
      status: 403,
      description: getDescription(options, 'Forbidden - user is not the author'),
      type: ForbiddenErrorDto
    })
  )
}

export function ApiNotFoundResponse (options?: ErrorResponseOptions) {
  return applyDecorators(
    ApiResponse({
      status: 404,
      description: getDescription(options, 'Resource not found'),
      type: NotFoundErrorDto
    })
  )
}

export function ApiConflictResponse (options?: ErrorResponseOptions) {
  return applyDecorators(
    ApiResponse({
      status: 409,
      description: getDescription(options, 'Conflict - resource already exists'),
      type: ConflictErrorDto
    })
  )
}

export function ApiUnprocessableEntityResponse (options?: ErrorResponseOptions) {
  return applyDecorators(
    ApiResponse({
      status: 422,
      description: getDescription(options, 'Unprocessable entity - validation error'),
      type: UnprocessableEntityErrorDto
    })
  )
}

export function ApiInternalServerErrorResponse (options?: ErrorResponseOptions) {
  return applyDecorators(
    ApiResponse({
      status: 500,
      description: getDescription(options, 'Internal server error'),
      type: InternalServerErrorDto
    })
  )
}

function getDescription (options: ErrorResponseOptions | undefined, defaultDesc: string): string {
  if (!options) return defaultDesc
  return typeof options === 'string' ? options : (options.description ?? defaultDesc)
}
