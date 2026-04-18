import { Module } from '@nestjs/common'
import { CreateVehicleController } from './create-vehicle/create-vehicle.controller'
import { DeleteVehicleController } from './delete-vehicle/delete-vehicle.controller'
import { FetchVehiclesController } from './fetch-vehicles/fetch-vehicles.controller'
import { GetVehicleByIdController } from './get-vehicle-by-id/get-vehicle-by-id.controller'
import { UpdateVehicleController } from './update-vehicle/update-vehicle.controller'

@Module({
  controllers: [
    FetchVehiclesController,
    CreateVehicleController,
    GetVehicleByIdController,
    UpdateVehicleController,
    DeleteVehicleController,
  ],
})
export class ControllersModule {}
