import { Test } from '@nestjs/testing'
import { VehiclesRepositoryToken } from '@/domain/application/repositories/vehicles.repository'
import { CreateVehicleUseCase } from '@/domain/application/usecases/create-vehicle/create-vehicle.use-case'
import { InMemoryVehiclesRepository } from '@/infra/persistence/repositories/in-memory/in-memory-vehicles.repository'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { DeleteVehicleUseCase } from './delete-vehicle.use-case'
import { makeVehicleData } from '@tests/factories/domain/make-vehicle'

describe('DeleteVehicleUseCase', () => {
  it('should delete vehicle', async () => {
    const repo = new InMemoryVehiclesRepository()
    const create = await makeCreate(repo)
    const created = await create.execute(makeVehicleData())
    const sut = await makeSut(repo)

    await sut.execute({ id: created.id })

    const missing = await repo.findById(created.id)
    expect(missing).toBeNull()
  })

  it('should throw when not found', async () => {
    const repo = new InMemoryVehiclesRepository()
    const sut = await makeSut(repo)

    await expect(
      sut.execute({ id: '00000000-0000-0000-0000-000000000000' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})

async function makeSut (repo: InMemoryVehiclesRepository) {
  const moduleRef = await Test.createTestingModule({
    providers: [
      DeleteVehicleUseCase,
      { provide: VehiclesRepositoryToken, useValue: repo },
    ],
  }).compile()
  return moduleRef.get(DeleteVehicleUseCase)
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
