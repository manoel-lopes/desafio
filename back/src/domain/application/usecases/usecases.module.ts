import { Global, Module } from '@nestjs/common'
import { CreateVehicleUseCase } from '@/domain/application/usecases/create-vehicle/create-vehicle.use-case'
import { DeleteVehicleUseCase } from '@/domain/application/usecases/delete-vehicle/delete-vehicle.use-case'
import { FetchVehiclesUseCase } from '@/domain/application/usecases/fetch-vehicles/fetch-vehicles.use-case'
import { GetVehicleByIdUseCase } from '@/domain/application/usecases/get-vehicle-by-id/get-vehicle-by-id.use-case'
import { UpdateVehicleUseCase } from '@/domain/application/usecases/update-vehicle/update-vehicle.use-case'
import { RepositoriesModule } from '@/infra/persistence/repositories/repositories.module'

@Global()
@Module({
  imports: [RepositoriesModule],
  providers: [
    CreateVehicleUseCase,
    GetVehicleByIdUseCase,
    FetchVehiclesUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
  ],
  exports: [
    CreateVehicleUseCase,
    GetVehicleByIdUseCase,
    FetchVehiclesUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
  ],
})
export class UseCasesModule {}
