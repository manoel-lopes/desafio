import { Global, Module } from '@nestjs/common'
import { VehiclesRepositoryToken } from '@/domain/application/repositories/vehicles.repository'
import { PrismaModule } from '@/infra/persistence/prisma.module'
import { CacheModule } from '@/infra/persistence/repositories/cache/cache.module'
import { PrismaVehiclesRepository } from '@/infra/persistence/repositories/prisma/prisma-vehicles.repository'

@Global()
@Module({
  imports: [PrismaModule, CacheModule],
  providers: [
    PrismaVehiclesRepository,
    {
      provide: VehiclesRepositoryToken,
      useClass: PrismaVehiclesRepository,
    },
  ],
  exports: [VehiclesRepositoryToken],
})
export class RepositoriesModule {}
