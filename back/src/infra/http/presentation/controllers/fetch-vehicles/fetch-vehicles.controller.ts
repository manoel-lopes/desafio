import { Controller, Get, Query, UsePipes } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { FetchVehiclesUseCase } from '@/domain/application/usecases/fetch-vehicles/fetch-vehicles.use-case'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { vehicleToHttp } from '@/infra/http/presentation/helpers/vehicle-to-http'
import { paginationQuerySchema } from '@/shared/validation/core/pagination.schema'

@Controller('vehicles')
@ApiTags('vehicles')
export class FetchVehiclesController {
  constructor (private readonly fetchVehicles: FetchVehiclesUseCase) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated vehicles' })
  @UsePipes(new ZodValidationPipe(paginationQuerySchema))
  async handle (@Query() query: ReturnType<typeof paginationQuerySchema.parse>) {
    const result = await this.fetchVehicles.execute({
      page: query.page,
      pageSize: query.pageSize,
      order: query.order,
    })
    return {
      page: result.page,
      pageSize: result.pageSize,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      order: result.order,
      items: result.items.map(vehicleToHttp),
    }
  }
}
