import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  UsePipes,
} from '@nestjs/common'
import { ApiNoContentResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger'
import { DeleteVehicleUseCase } from '@/domain/application/usecases/delete-vehicle/delete-vehicle.use-case'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { vehicleParamsSchema } from '@/shared/validation/domain/vehicle.schema'

@Controller('vehicles')
@ApiTags('vehicles')
export class DeleteVehicleController {
  constructor (private readonly deleteVehicle: DeleteVehicleUseCase) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Vehicle deleted' })
  @ApiNotFoundResponse({ description: 'Vehicle not found' })
  @UsePipes(new ZodValidationPipe(vehicleParamsSchema))
  async handle (@Param() params: ReturnType<typeof vehicleParamsSchema.parse>) {
    try {
      await this.deleteVehicle.execute({ id: params.id })
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
