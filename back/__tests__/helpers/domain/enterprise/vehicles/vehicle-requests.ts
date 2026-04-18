import type { LightMyRequestResponse } from 'fastify'
import { INestApplication } from '@nestjs/common'
import type { CreateVehicleData } from '@/domain/application/repositories/vehicles.repository'

function getFastify (app: INestApplication) {
  return app.getHttpAdapter().getInstance()
}

function isRecord (value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseJsonBody (raw: string): Record<string, unknown> | null {
  if (raw === '') {
    return null
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (isRecord(parsed)) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

function wrap (reply: LightMyRequestResponse) {
  return {
    status: reply.statusCode,
    body: parseJsonBody(reply.body),
    raw: reply,
  }
}

export async function createVehicleRequest (
  app: INestApplication,
  body: CreateVehicleData
) {
  const reply = await getFastify(app).inject({
    method: 'POST',
    url: '/vehicles',
    payload: body,
  })
  return wrap(reply)
}

export async function getVehicleByIdRequest (app: INestApplication, id: string) {
  const reply = await getFastify(app).inject({
    method: 'GET',
    url: `/vehicles/${id}`,
  })
  return wrap(reply)
}

export async function fetchVehiclesRequest (
  app: INestApplication,
  query: Record<string, string> = {}
) {
  const qs = new URLSearchParams(query).toString()
  const url = qs === '' ? '/vehicles' : `/vehicles?${qs}`
  const reply = await getFastify(app).inject({
    method: 'GET',
    url,
  })
  return wrap(reply)
}

export async function updateVehicleRequest (
  app: INestApplication,
  id: string,
  body: Record<string, unknown>
) {
  const reply = await getFastify(app).inject({
    method: 'PATCH',
    url: `/vehicles/${id}`,
    payload: body,
  })
  return wrap(reply)
}

export async function deleteVehicleRequest (app: INestApplication, id: string) {
  const reply = await getFastify(app).inject({
    method: 'DELETE',
    url: `/vehicles/${id}`,
  })
  return wrap(reply)
}
