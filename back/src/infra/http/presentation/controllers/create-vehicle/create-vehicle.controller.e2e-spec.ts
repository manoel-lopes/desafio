import type { INestApplication } from '@nestjs/common'
import type { CreateVehicleData } from '@/domain/application/repositories/vehicles.repository'
import { uniqueVehicleBody } from '@tests/helpers/domain/enterprise/vehicles/unique-vehicle-body'
import { createVehicleRequest } from '@tests/helpers/domain/enterprise/vehicles/vehicle-requests'
import { makeApp } from '@tests/helpers/app/make-app'
import { truncateVehicles } from '@tests/helpers/e2e/truncate-vehicles'
import { getJsonBody } from '@tests/helpers/get-json-body'
import { getStringProp } from '@tests/helpers/get-string-prop'

describe('CreateVehicle', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
  })

  beforeEach(async () => {
    await truncateVehicles(app)
  })

  it('should create vehicle', async () => {
    const body = uniqueVehicleBody()
    const response = await createVehicleRequest(app, body)

    expect(response.status).toBe(201)
    const json = getJsonBody(response.body)
    expect(json.plate).toBe(body.plate)
    expect(json.fuel).toBe(body.fuel)
    expect(getStringProp(json, 'id').length > 0).toBe(true)
  })

  it('should return 409 when duplicate plate', async () => {
    const body = uniqueVehicleBody()
    const first = await createVehicleRequest(app, body)
    expect(first.status).toBe(201)

    const conflict = await createVehicleRequest(app, {
      ...uniqueVehicleBody(),
      plate: body.plate,
    })

    expect(conflict.status).toBe(409)
  })

  it('should return 400 when required field missing', async () => {
    const body = uniqueVehicleBody()
    const withoutPlate: Record<string, unknown> = { ...body }
    delete withoutPlate.plate
    const response = await createVehicleRequest(app, withoutPlate as CreateVehicleData)

    expect(response.status).toBe(400)
  })

  it('should return 409 when duplicate chassis', async () => {
    const firstBody = uniqueVehicleBody()
    const first = await createVehicleRequest(app, firstBody)
    expect(first.status).toBe(201)

    const conflict = await createVehicleRequest(app, {
      ...uniqueVehicleBody(),
      chassis: firstBody.chassis,
    })

    expect(conflict.status).toBe(409)
  })

  it('should return 409 when duplicate renavam', async () => {
    const firstBody = uniqueVehicleBody()
    const first = await createVehicleRequest(app, firstBody)
    expect(first.status).toBe(201)

    const conflict = await createVehicleRequest(app, {
      ...uniqueVehicleBody(),
      renavam: firstBody.renavam,
    })

    expect(conflict.status).toBe(409)
  })

  it('should return 422 when year below min', async () => {
    const body = uniqueVehicleBody()
    const response = await createVehicleRequest(app, { ...body, year: 1800 })

    expect(response.status).toBe(422)
  })

})
