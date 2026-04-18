import type { INestApplication } from '@nestjs/common'
import { uniqueVehicleBody } from '@tests/helpers/domain/enterprise/vehicles/unique-vehicle-body'
import {
  createVehicleRequest,
  fetchVehiclesRequest,
} from '@tests/helpers/domain/enterprise/vehicles/vehicle-requests'
import { makeApp } from '@tests/helpers/app/make-app'
import { truncateVehicles } from '@tests/helpers/e2e/truncate-vehicles'
import { getJsonBody } from '@tests/helpers/get-json-body'

describe('FetchVehicles', () => {
  let app: INestApplication | undefined

  function requireApp (): INestApplication {
    if (app === undefined) {
      throw new Error('Nest application failed to bootstrap')
    }
    return app
  }

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
  })

  beforeEach(async () => {
    await truncateVehicles(requireApp())
  })

  it('should list vehicles with pagination', async () => {
    const nestApp = requireApp()
    await createVehicleRequest(nestApp, uniqueVehicleBody())
    await createVehicleRequest(nestApp, uniqueVehicleBody())

    const response = await fetchVehiclesRequest(nestApp, { page: '1', pageSize: '10' })

    expect(response.status).toBe(200)
    const json = getJsonBody(response.body)
    expect(json.totalItems).toBe(2)
    expect(Array.isArray(json.items)).toBe(true)
  })

  it('should default pagination when no query params', async () => {
    const response = await fetchVehiclesRequest(requireApp(), {})

    expect(response.status).toBe(200)
    const json = getJsonBody(response.body)
    expect(json.page).toBe(1)
    expect(json.pageSize).toBe(20)
  })

  it('should return empty items on out-of-range page', async () => {
    const nestApp = requireApp()
    await createVehicleRequest(nestApp, uniqueVehicleBody())

    const response = await fetchVehiclesRequest(nestApp, { page: '999', pageSize: '10' })

    expect(response.status).toBe(200)
    const json = getJsonBody(response.body)
    expect(json.items).toEqual([])
    expect(json.totalItems).toBe(1)
  })

  it('should return 422 when pageSize is invalid', async () => {
    const response = await fetchVehiclesRequest(requireApp(), { page: '1', pageSize: 'abc' })

    expect(response.status).toBe(422)
  })
})
