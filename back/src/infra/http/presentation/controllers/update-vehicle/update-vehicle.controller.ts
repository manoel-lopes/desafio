import {
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { VehicleAlreadyExistsError } from '@/domain/application/usecases/errors/vehicle-already-exists.error'
import { UpdateVehicleUseCase } from '@/domain/application/usecases/update-vehicle/update-vehicle.use-case'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { vehicleToHttp } from '@/infra/http/presentation/helpers/vehicle-to-http'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { updateVehicleBodySchema, vehicleParamsSchema } from '@/shared/validation/domain/vehicle.schema'

@Controller('vehicles')
@ApiTags('vehicles')
export class UpdateVehicleController {
  constructor (private readonly updateVehicle: UpdateVehicleUseCase) {}

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'Vehicle id (UUID)', schema: { type: 'string', format: 'uuid' } })
  @ApiBody({
    description: 'Partial vehicle (all fields optional)',
    schema: {
      type: 'object',
      example: { model: 'Updated model', year: 2024 },
    },
  })
  @ApiOkResponse({ description: 'Vehicle updated' })
  @ApiNotFoundResponse({ description: 'Vehicle not found' })
  async handle (
    @Param(new ZodValidationPipe(vehicleParamsSchema)) params: ReturnType<typeof vehicleParamsSchema.parse>,
    @Body(new ZodValidationPipe(updateVehicleBodySchema)) body: ReturnType<typeof updateVehicleBodySchema.parse>
  ) {
    try {
      const vehicle = await this.updateVehicle.execute({ id: params.id, data: body })
      return vehicleToHttp(vehicle)
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof VehicleAlreadyExistsError) {
        throw new ConflictException(error.message)
      }
      throw error
    }
  }
}
