import { Test } from '@nestjs/testing'
import { VehiclesRepositoryToken } from '@/domain/application/repositories/vehicles.repository'
import { VehicleAlreadyExistsError } from '@/domain/application/usecases/errors/vehicle-already-exists.error'
import { InMemoryVehiclesRepository } from '@/infra/persistence/repositories/in-memory/in-memory-vehicles.repository'
import { CreateVehicleUseCase } from './create-vehicle.use-case'
import { makeVehicleData } from '@tests/factories/domain/make-vehicle'

describe('CreateVehicleUseCase', () => {
  it('should create a vehicle', async () => {
    const repo = new InMemoryVehiclesRepository()
    const sut = await makeSut(repo)
    const request = makeVehicleData()

    const result = await sut.execute(request)

    expect(result.plate).toBe(request.plate)
    expect(result.id.length > 0).toBe(true)
  })

  it('should reject duplicate plate', async () => {
    const repo = new InMemoryVehiclesRepository()
    const sut = await makeSut(repo)
    const request = makeVehicleData({ plate: 'SAME01' })
    await sut.execute(request)

    const second = makeVehicleData({ plate: 'SAME01' })

    await expect(sut.execute(second)).rejects.toBeInstanceOf(VehicleAlreadyExistsError)
  })
})

async function makeSut (repo: InMemoryVehiclesRepository) {
  const moduleRef = await Test.createTestingModule({
    providers: [
      CreateVehicleUseCase,
      { provide: VehiclesRepositoryToken, useValue: repo },
    ],
  }).compile()
  return moduleRef.get(CreateVehicleUseCase)
}
