import { Test } from '@nestjs/testing'
import { VehiclesRepositoryToken } from '@/domain/application/repositories/vehicles.repository'
import { CreateVehicleUseCase } from '@/domain/application/usecases/create-vehicle/create-vehicle.use-case'
import { InMemoryVehiclesRepository } from '@/infra/persistence/repositories/in-memory/in-memory-vehicles.repository'
import { FetchVehiclesUseCase } from './fetch-vehicles.use-case'
import { makeVehicleData } from '@tests/factories/domain/make-vehicle'

describe('FetchVehiclesUseCase', () => {
  it('should return paginated vehicles', async () => {
    const repo = new InMemoryVehiclesRepository()
    const create = await makeCreate(repo)
    await create.execute(makeVehicleData())
    await create.execute(makeVehicleData())
    const sut = await makeSut(repo)

    const result = await sut.execute({ page: 1, pageSize: 10, order: 'desc' })

    expect(result.totalItems).toBe(2)
    expect(result.items.length).toBe(2)
  })
})

async function makeSut (repo: InMemoryVehiclesRepository) {
  const moduleRef = await Test.createTestingModule({
    providers: [
      FetchVehiclesUseCase,
      { provide: VehiclesRepositoryToken, useValue: repo },
    ],
  }).compile()
  return moduleRef.get(FetchVehiclesUseCase)
}

async function makeCreate (repo: InMemoryVehiclesRepository) {
  const moduleRef = await Test.createTestingModule({
    providers: [
      CreateVehicleUseCase,
      { provide: VehiclesRepositoryToken, useValue: repo },
    ],
  }).compile()
  return moduleRef.get(CreateVehicleUseCase)
}
