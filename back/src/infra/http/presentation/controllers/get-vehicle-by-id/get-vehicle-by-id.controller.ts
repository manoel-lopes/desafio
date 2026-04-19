import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UsePipes,
} from '@nestjs/common'
import { ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { GetVehicleByIdUseCase } from '@/domain/application/usecases/get-vehicle-by-id/get-vehicle-by-id.use-case'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { vehicleToHttp } from '@/infra/http/presentation/helpers/vehicle-to-http'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { vehicleParamsSchema } from '@/shared/validation/domain/vehicle.schema'

@Controller('vehicles')
@ApiTags('vehicles')
export class GetVehicleByIdController {
  constructor (private readonly getVehicleById: GetVehicleByIdUseCase) {}

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Vehicle id (UUID)', schema: { type: 'string', format: 'uuid' } })
  @ApiOkResponse({ description: 'Vehicle found' })
  @ApiNotFoundResponse({ description: 'Vehicle not found' })
  @UsePipes(new ZodValidationPipe(vehicleParamsSchema))
  async handle (@Param() params: ReturnType<typeof vehicleParamsSchema.parse>) {
    try {
      const vehicle = await this.getVehicleById.execute({ id: params.id })
      return vehicleToHttp(vehicle)
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
