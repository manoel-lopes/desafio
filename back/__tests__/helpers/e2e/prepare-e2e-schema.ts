import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { config } from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

config({ path: '.env', override: true, quiet: true })
config({ path: '.env.test', override: true, quiet: true })

function getE2eSchemaStatePath (): string {
  const workerId = process.env.JEST_WORKER_ID ?? '1'
  return path.join(process.cwd(), `.e2e-schema-state.${workerId}.json`)
}

type E2eSchemaState = {
  schemaId: string
  adminDatabaseUrl: string
}

function isE2eSchemaState (value: unknown): value is E2eSchemaState {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  if (!('schemaId' in value) || !('adminDatabaseUrl' in value)) {
    return false
  }
  const schemaId = value.schemaId
  const adminDatabaseUrl = value.adminDatabaseUrl
  return typeof schemaId === 'string' && typeof adminDatabaseUrl === 'string'
}

function getBaseDatabaseUrl (): string {
  const databaseUrl = process.env.DATABASE_URL
  if (databaseUrl?.startsWith('postgresql://')) {
    return databaseUrl
  }
  const dbUser = process.env.DB_USER
  const dbPassword = process.env.DB_PASSWORD
  const dbHost = process.env.DB_HOST ?? 'localhost'
  const dbPort = process.env.DB_PORT ?? '5432'
  const dbName = process.env.DB_NAME
  return `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public`
}

function generateUniqueDatabaseURL (schemaId: string) {
  const baseDatabaseURL = getBaseDatabaseUrl()
  const url = new URL(baseDatabaseURL)
  url.searchParams.set('schema', schemaId)
  return url.toString()
}

function createPrismaClient (connectionString: string): PrismaClient {
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

function isDatabaseUnreachableError (error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }
  const message = error.message.toLowerCase()
  return (
    message.includes("can't reach database server") ||
    message.includes('connection refused') ||
    message.includes('econnrefused')
  )
}

async function dropSchemaBestEffort (adminDatabaseUrl: string, schemaId: string): Promise<void> {
  const client = createPrismaClient(adminDatabaseUrl)
  try {
    await client.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  } catch {
    // ignore
  } finally {
    await client.$disconnect().catch(() => {})
  }
}

const migrateDeployLockPath = path.join(os.tmpdir(), 'prisma-e2e-migrate-deploy.lock')

function removeStaleMigrateLock (): void {
  if (!fs.existsSync(migrateDeployLockPath)) {
    return
  }
  try {
    const stat = fs.statSync(migrateDeployLockPath)
    if (Date.now() - stat.mtimeMs > 180_000) {
      fs.rmSync(migrateDeployLockPath, { recursive: true, force: true })
    }
  } catch {
    // ignore
  }
}

async function runWithMigrateDeployLock (fn: () => void): Promise<void> {
  const deadline = Date.now() + 300_000
  while (true) {
    removeStaleMigrateLock()
    try {
      fs.mkdirSync(migrateDeployLockPath)
      break
    } catch {
      if (Date.now() > deadline) {
        throw new Error('Timeout waiting for Prisma migrate deploy lock')
      }
      await delay(50)
    }
  }
  try {
    fn()
  } finally {
    try {
      fs.rmdirSync(migrateDeployLockPath)
    } catch {
      // ignore
    }
  }
}

let preparePromise: Promise<void> | undefined

export async function prepareE2eSchemaOnce (): Promise<void> {
  if (preparePromise) {
    await preparePromise
    return
  }
  preparePromise = (async () => {
    const schemaId = randomUUID()
    const baseDatabaseURL = getBaseDatabaseUrl()
    const databaseURL = generateUniqueDatabaseURL(schemaId)
    const adminDatabaseUrl = baseDatabaseURL.replace(/\?schema=.*$/, '')
    process.env.DATABASE_URL = databaseURL
    let tempPrisma: PrismaClient | undefined
    try {
      tempPrisma = createPrismaClient(adminDatabaseUrl)
      await tempPrisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaId}"`)
      await tempPrisma.$disconnect()
      tempPrisma = undefined
      await runWithMigrateDeployLock(() => {
        execSync('pnpm prisma migrate deploy', {
          stdio: 'pipe',
          env: { ...process.env, DATABASE_URL: databaseURL },
        })
      })
      const state: E2eSchemaState = { schemaId, adminDatabaseUrl }
      fs.writeFileSync(getE2eSchemaStatePath(), JSON.stringify(state), 'utf8')
    } catch (error) {
      if (tempPrisma) {
        await tempPrisma.$disconnect().catch(() => {})
      }
      await dropSchemaBestEffort(adminDatabaseUrl, schemaId)
      if (isDatabaseUnreachableError(error)) {
        throw new Error(
          'E2E database is not reachable. Start Postgres and Redis, then apply migrations:\n' +
            '  pnpm db:up:test\n' +
            '  pnpm migrate:test\n' +
            `Original error: ${error instanceof Error ? error.message : String(error)}`
        )
      }
      throw error
    }
  })()
  await preparePromise
}

async function teardownE2eSchemaFromPath (stateFilePath: string): Promise<void> {
  if (!fs.existsSync(stateFilePath)) {
    return
  }
  let raw: string
  try {
    raw = fs.readFileSync(stateFilePath, 'utf8')
  } catch {
    return
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    fs.unlinkSync(stateFilePath)
    return
  }
  if (!isE2eSchemaState(parsed)) {
    fs.unlinkSync(stateFilePath)
    return
  }
  const state = parsed
  const client = createPrismaClient(state.adminDatabaseUrl)
  try {
    await client.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${state.schemaId}" CASCADE`)
  } finally {
    await client.$disconnect()
    fs.unlinkSync(stateFilePath)
  }
}

export async function teardownAllE2eSchemaStateFiles (): Promise<void> {
  const cwd = process.cwd()
  let entries: string[]
  try {
    entries = fs.readdirSync(cwd)
  } catch {
    return
  }
  const stateFiles = entries.filter(
    (name) => name.startsWith('.e2e-schema-state.') && name.endsWith('.json')
  )
  for (const name of stateFiles) {
    await teardownE2eSchemaFromPath(path.join(cwd, name))
  }
}
