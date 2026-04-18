import type { INestApplication } from '@nestjs/common'
import { uniqueVehicleBody } from '@tests/helpers/domain/enterprise/vehicles/unique-vehicle-body'
import {
  createVehicleRequest,
  getVehicleByIdRequest,
} from '@tests/helpers/domain/enterprise/vehicles/vehicle-requests'
import { makeApp } from '@tests/helpers/app/make-app'
import { truncateVehicles } from '@tests/helpers/e2e/truncate-vehicles'
import { getJsonBody } from '@tests/helpers/get-json-body'
import { getStringProp } from '@tests/helpers/get-string-prop'

describe('GetVehicleById', () => {
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

  it('should return vehicle', async () => {
    const body = uniqueVehicleBody()
    const created = await createVehicleRequest(app, body)
    const createdJson = getJsonBody(created.body)
    const id = getStringProp(createdJson, 'id')
    const response = await getVehicleByIdRequest(app, id)

    expect(response.status).toBe(200)
    expect(getStringProp(getJsonBody(response.body), 'id')).toBe(id)
  })

  it('should return 404 when missing', async () => {
    const response = await getVehicleByIdRequest(app, '00000000-0000-0000-0000-000000000000')

    expect(response.status).toBe(404)
  })

  it('should return 422 when id is not a uuid', async () => {
    const response = await getVehicleByIdRequest(app, 'not-a-uuid')

    expect(response.status).toBe(422)
  })
})
