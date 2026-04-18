import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
} from '@nestjs/common'
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { CreateVehicleUseCase } from '@/domain/application/usecases/create-vehicle/create-vehicle.use-case'
import { VehicleAlreadyExistsError } from '@/domain/application/usecases/errors/vehicle-already-exists.error'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { vehicleToHttp } from '@/infra/http/presentation/helpers/vehicle-to-http'
import { createVehicleBodySchema } from '@/shared/validation/domain/vehicle.schema'

@Controller('vehicles')
@ApiTags('vehicles')
export class CreateVehicleController {
  constructor (private readonly createVehicle: CreateVehicleUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Vehicle created' })
  @UsePipes(new ZodValidationPipe(createVehicleBodySchema))
  async handle (@Body() body: ReturnType<typeof createVehicleBodySchema.parse>) {
    try {
      const vehicle = await this.createVehicle.execute(body)
      return vehicleToHttp(vehicle)
    } catch (error) {
      if (error instanceof VehicleAlreadyExistsError) {
        throw new ConflictException(error.message)
      }
      throw error
    }
  }
}
