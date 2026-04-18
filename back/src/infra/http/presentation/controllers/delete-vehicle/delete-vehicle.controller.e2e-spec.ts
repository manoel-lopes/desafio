import type { INestApplication } from '@nestjs/common'
import { uniqueVehicleBody } from '@tests/helpers/domain/enterprise/vehicles/unique-vehicle-body'
import {
  createVehicleRequest,
  deleteVehicleRequest,
  getVehicleByIdRequest,
} from '@tests/helpers/domain/enterprise/vehicles/vehicle-requests'
import { makeApp } from '@tests/helpers/app/make-app'
import { truncateVehicles } from '@tests/helpers/e2e/truncate-vehicles'
import { getJsonBody } from '@tests/helpers/get-json-body'
import { getStringProp } from '@tests/helpers/get-string-prop'

describe('DeleteVehicle', () => {
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

  it('should delete vehicle', async () => {
    const body = uniqueVehicleBody()
    const created = await createVehicleRequest(app, body)
    const id = getStringProp(getJsonBody(created.body), 'id')
    const del = await deleteVehicleRequest(app, id)

    expect(del.status).toBe(204)

    const missing = await getVehicleByIdRequest(app, id)
    expect(missing.status).toBe(404)
  })

  it('should return 404 when deleting unknown id', async () => {
    const response = await deleteVehicleRequest(app, '00000000-0000-0000-0000-000000000000')

    expect(response.status).toBe(404)
  })

  it('should return 422 when id is not a uuid', async () => {
    const response = await deleteVehicleRequest(app, 'not-a-uuid')

    expect(response.status).toBe(422)
  })
})
