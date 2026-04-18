import { Test } from '@nestjs/testing'
import { VehiclesRepositoryToken } from '@/domain/application/repositories/vehicles.repository'
import { CreateVehicleUseCase } from '@/domain/application/usecases/create-vehicle/create-vehicle.use-case'
import { VehicleAlreadyExistsError } from '@/domain/application/usecases/errors/vehicle-already-exists.error'
import { InMemoryVehiclesRepository } from '@/infra/persistence/repositories/in-memory/in-memory-vehicles.repository'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { UpdateVehicleUseCase } from './update-vehicle.use-case'
import { makeVehicleData } from '@tests/factories/domain/make-vehicle'

describe('UpdateVehicleUseCase', () => {
  it('should update vehicle', async () => {
    const repo = new InMemoryVehiclesRepository()
    const create = await makeCreate(repo)
    const created = await create.execute(makeVehicleData({ model: 'Old' }))
    const sut = await makeSut(repo)

    const result = await sut.execute({
      id: created.id,
      data: { model: 'New' },
    })

    expect(result.model).toBe('New')
  })

  it('should throw when vehicle not found', async () => {
    const repo = new InMemoryVehiclesRepository()
    const sut = await makeSut(repo)

    await expect(
      sut.execute({
        id: '00000000-0000-0000-0000-000000000000',
        data: { model: 'X' },
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should reject duplicate plate', async () => {
    const repo = new InMemoryVehiclesRepository()
    const create = await makeCreate(repo)
    const first = await create.execute(makeVehicleData({ plate: 'P1' }))
    const second = await create.execute(makeVehicleData({ plate: 'P2' }))
    const sut = await makeSut(repo)

    await expect(
      sut.execute({
        id: second.id,
        data: { plate: first.plate },
      })
    ).rejects.toBeInstanceOf(VehicleAlreadyExistsError)
  })
})

async function makeSut (repo: InMemoryVehiclesRepository) {
  const moduleRef = await Test.createTestingModule({
    providers: [
      UpdateVehicleUseCase,
      { provide: VehiclesRepositoryToken, useValue: repo },
    ],
  }).compile()
  return moduleRef.get(UpdateVehicleUseCase)
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
