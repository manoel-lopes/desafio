import type { INestApplication } from '@nestjs/common'
import { uniqueVehicleBody } from '@tests/helpers/domain/enterprise/vehicles/unique-vehicle-body'
import {
  createVehicleRequest,
  updateVehicleRequest,
} from '@tests/helpers/domain/enterprise/vehicles/vehicle-requests'
import { makeApp } from '@tests/helpers/app/make-app'
import { truncateVehicles } from '@tests/helpers/e2e/truncate-vehicles'
import { getJsonBody } from '@tests/helpers/get-json-body'
import { getStringProp } from '@tests/helpers/get-string-prop'

describe('UpdateVehicle', () => {
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

  it('should update vehicle', async () => {
    const body = uniqueVehicleBody()
    const created = await createVehicleRequest(app, body)
    const id = getStringProp(getJsonBody(created.body), 'id')
    const response = await updateVehicleRequest(app, id, { model: 'Updated' })

    expect(response.status).toBe(200)
    expect(getJsonBody(response.body).model).toBe('Updated')
  })

  it('should accept partial PATCH (only brand)', async () => {
    const body = uniqueVehicleBody()
    const created = await createVehicleRequest(app, body)
    const id = getStringProp(getJsonBody(created.body), 'id')
    const response = await updateVehicleRequest(app, id, { brand: 'NewBrand' })

    expect(response.status).toBe(200)
    const json = getJsonBody(response.body)
    expect(json.brand).toBe('NewBrand')
    expect(json.model).toBe(body.model)
  })

  it('should return 404 when updating unknown id', async () => {
    const response = await updateVehicleRequest(
      app,
      '00000000-0000-0000-0000-000000000000',
      { model: 'X' }
    )

    expect(response.status).toBe(404)
  })

  it('should return 409 when new plate collides', async () => {
    const bodyA = uniqueVehicleBody()
    const bodyB = uniqueVehicleBody()
    const createdA = await createVehicleRequest(app, bodyA)
    const createdB = await createVehicleRequest(app, bodyB)
    expect(createdA.status).toBe(201)
    expect(createdB.status).toBe(201)
    const idB = getStringProp(getJsonBody(createdB.body), 'id')
    const response = await updateVehicleRequest(app, idB, { plate: bodyA.plate })

    expect(response.status).toBe(409)
  })

  it('should return 422 when year invalid type', async () => {
    const body = uniqueVehicleBody()
    const created = await createVehicleRequest(app, body)
    const id = getStringProp(getJsonBody(created.body), 'id')
    const response = await updateVehicleRequest(app, id, { year: 'not-a-number' })

    expect(response.status).toBe(422)
  })
})
