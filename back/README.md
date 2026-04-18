# Vehicle API (NestJS)

REST API for vehicle CRUD built with NestJS 11 (Fastify), Prisma 7, PostgreSQL, and Redis cache infrastructure. No authentication — all `/vehicles` routes are public.

## Prerequisites

- Node.js 22+
- pnpm
- Docker (optional, for Postgres/Redis or full stack)

## Installation

```bash
pnpm install
cp .env.example .env.development
# Edit DB_* and DATABASE_URL to match your Postgres
pnpm exec prisma generate
```

## Running locally

1. Start Postgres and Redis (example using project compose files):

```bash
pnpm run db:up
```

(`db:up:dev` is the same command.)

2. Apply migrations and run the API:

```bash
pnpm exec dotenv -e .env.development -- prisma migrate deploy
pnpm run start:dev
```

- API: `http://localhost:3333` (default `PORT`)
- Swagger (development only): `http://localhost:3333/docs`

## Running with Docker

Use a `.env` file with hosts pointing at compose services:

```bash
cp .env.example .env
# Set DB_HOST=postgres, REDIS_HOST=redis, and DATABASE_URL using those hostnames (see comments in .env.example)
docker compose up -d --build
```

- API: `http://localhost:3333` (or your `PORT`)
- Logs: `pnpm run docker:logs`
- Stop: `pnpm run docker:down`
- Stop and remove volumes: `docker compose down -v`

The API container runs `prisma migrate deploy` before `node dist/main.js`.

## Testing

```bash
pnpm run lint
pnpm run check-types
pnpm run test:unit
```

End-to-end tests use `.env.test` (Postgres on the host port from `DB_PORT`, default `5433`, and Redis on `REDIS_PORT`). The flow is:

```bash
pnpm db:up:test
pnpm migrate:test
pnpm test:e2e
```

`db:up:test` starts Postgres and Redis for tests and waits until both pass Docker healthchecks (so `migrate:test` does not hit a cold-start race). `migrate:test` applies migrations to the test database. The first Nest app bootstrap in an e2e run provisions an isolated Postgres schema (migrations applied there); Jest global teardown drops it.

If the database is not reachable, schema preparation fails with a message that points you to `db:up:test` and `migrate:test`.

## API routes

Interactive OpenAPI (development only): `http://localhost:3333/docs`.

Validation uses `ZodValidationPipe`: missing required fields → **400** with the first issue message; other schema failures (e.g. invalid UUID, out-of-range `ano`) → **422**. Nest error bodies look like:

```json
{
  "statusCode": 400,
  "message": "…",
  "error": "Bad Request"
}
```

(`message` may be a string or array depending on Nest/Fastify; `error` matches the status.)

### Vehicle response shape

All vehicle endpoints return this object (dates as ISO 8601 strings; `updatedAt` is `null` until updated):

```json
{
  "id": "0195f0a0-0000-7000-8000-000000000001",
  "plate": "ABC1D23",
  "chassi": "9BWZZZ377VT004251",
  "renavam": "12345678901",
  "modelo": "Civic",
  "marca": "Honda",
  "ano": 2024,
  "createdAt": "2026-04-18T12:00:00.000Z",
  "updatedAt": null
}
```

### `POST /vehicles` — create

**Body (JSON)** — all required:

| Field | Rules |
|-------|--------|
| `plate` | string, trimmed, 1–10 chars |
| `chassi` | string, trimmed, 1–32 chars |
| `renavam` | string, trimmed, 1–20 chars |
| `modelo` | string, trimmed, 1–120 chars |
| `marca` | string, trimmed, 1–120 chars |
| `ano` | integer, 1900 … current year + 1 |

```bash
curl -sS -X POST http://localhost:3333/vehicles \
  -H 'Content-Type: application/json' \
  -d '{"plate":"ABC1D23","chassi":"9BWZZZ377VT004251","renavam":"12345678901","modelo":"Civic","marca":"Honda","ano":2024}'
```

| Status | Body |
|--------|------|
| **201** | Vehicle object (see above) |
| **400** / **422** | Validation (pipe rules above) |
| **409** | `{"statusCode":409,"message":"Vehicle already exists","error":"Conflict"}` |

### `GET /vehicles` — list (paginated)

**Query** (all optional; defaults apply):

| Param | Default | Rules |
|-------|---------|--------|
| `page` | `1` | integer ≥ 1 |
| `pageSize` | `20` | integer 1–100 |
| `order` | `desc` | `asc` or `desc` |

An optional `include` query string is accepted by validation but not used by the handler.

```bash
curl -sS 'http://localhost:3333/vehicles?page=1&pageSize=20&order=desc'
```

**200** example:

```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 42,
  "totalPages": 3,
  "order": "desc",
  "items": [
    {
      "id": "0195f0a0-0000-7000-8000-000000000001",
      "plate": "ABC1D23",
      "chassi": "9BWZZZ377VT004251",
      "renavam": "12345678901",
      "modelo": "Civic",
      "marca": "Honda",
      "ano": 2024,
      "createdAt": "2026-04-18T12:00:00.000Z",
      "updatedAt": null
    }
  ]
}
```

### `GET /vehicles/:id` — get by id

**Path:** `id` must be a UUID.

```bash
curl -sS http://localhost:3333/vehicles/0195f0a0-0000-7000-8000-000000000001
```

| Status | Body |
|--------|------|
| **200** | Vehicle object |
| **404** | `{"statusCode":404,"message":"Vehicle not found","error":"Not Found"}` |
| **422** | Invalid `id` (not a UUID) |

### `PATCH /vehicles/:id` — partial update

**Path:** `id` UUID. **Body:** any subset of create fields (same rules per field when present).

```bash
curl -sS -X PATCH http://localhost:3333/vehicles/0195f0a0-0000-7000-8000-000000000001 \
  -H 'Content-Type: application/json' \
  -d '{"modelo":"Civic Touring"}'
```

| Status | Body |
|--------|------|
| **200** | Updated vehicle object |
| **404** | Same as GET by id |
| **409** | Same as create (duplicate unique field) |
| **400** / **422** | Validation |

### `DELETE /vehicles/:id` — delete

**Path:** `id` UUID.

```bash
curl -sS -o /dev/null -w '%{http_code}\n' -X DELETE \
  http://localhost:3333/vehicles/0195f0a0-0000-7000-8000-000000000001
```

| Status | Body |
|--------|------|
| **204** | Empty |
| **404** | `{"statusCode":404,"message":"Vehicle not found","error":"Not Found"}` |
| **422** | Invalid `id` |

## Project structure

- `src/domain` — entities, use cases, repository ports
- `src/infra` — Prisma, HTTP controllers, env, events
- `src/core` — shared domain primitives (pagination, events)
- `prisma/` — schema and migrations
- `__tests__/` — test helpers, factories, builders

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm run start:dev` | Dev server with hot reload |
| `pnpm run build` | Compile to `dist/` |
| `pnpm run test:unit` | Unit tests (Jest + ts-jest) |
| `pnpm run db:up:test` | Start Postgres and Redis for E2E (see `.env.test`) |
| `pnpm run migrate:test` | Apply migrations to the test database |
| `pnpm run test:e2e` | E2E tests (Jest + ts-jest, isolated DB schema) |
| `pnpm exec dotenv -e .env.development -- prisma migrate dev` | Create/apply migrations (dev) |
| `pnpm run docker:build` / `docker:up` / `docker:down` / `docker:logs` | Docker Compose helpers |

## License

MIT. See [LICENSE](LICENSE). Replace `[year]` and `[author]` in `LICENSE` with your copyright line.
