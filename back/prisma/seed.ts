import { NestFactory } from '@nestjs/core'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { FuelType, PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import type { Env } from '../src/infra/env/env'

const SEED_CONFIG = {
  vehicles: 20,
  batchSize: 10,
}

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
})
class SeedModule {}

function getDatabaseUrl (config: ConfigService<Env, true>) {
  const value = config.get('DATABASE_URL', { infer: true })
  if (value) return value
  const dbUser = config.get('DB_USER', { infer: true })
  const dbPassword = config.get('DB_PASSWORD', { infer: true })
  const dbHost = config.get('DB_HOST', { infer: true })
  const dbPort = config.get('DB_PORT', { infer: true })
  const dbName = config.get('DB_NAME', { infer: true })
  return `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public`
}

async function insertInBatches<T> (
  items: T[],
  batchSize: number,
  insertFn: (batch: T[]) => Promise<unknown>,
  label: string,
): Promise<void> {
  const totalBatches = Math.ceil(items.length / batchSize)
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await insertFn(batch)
    const currentBatch = Math.floor(i / batchSize) + 1
    console.log(`  ${label}: batch ${currentBatch}/${totalBatches} (${Math.min(i + batchSize, items.length)}/${items.length})`)
  }
}

let app: Awaited<ReturnType<typeof NestFactory.createApplicationContext>>
let prisma: PrismaClient
let pool: Pool

async function main () {
  app = await NestFactory.createApplicationContext(SeedModule)
  const config = app.get(ConfigService)
  const databaseUrl = getDatabaseUrl(config)
  pool = new Pool({ connectionString: databaseUrl })
  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter })

  console.log(`Starting database seed (~${SEED_CONFIG.vehicles} vehicles)...`)

  console.log('Cleaning up existing data...')
  await prisma.vehicle.deleteMany()

  console.log(`Creating ${SEED_CONFIG.vehicles} vehicles...`)
  const fuelCycle = [
    FuelType.GASOLINE,
    FuelType.ETHANOL,
    FuelType.FLEX,
    FuelType.DIESEL,
    FuelType.ELECTRIC,
    FuelType.HYBRID,
  ]
  const vehicleData = Array.from({ length: SEED_CONFIG.vehicles }, (_, i) => {
    const n = i + 1
    return {
      plate: `ABC${String(n).padStart(4, '0')}`,
      chassis: `CHASSI${String(n).padStart(10, '0')}`,
      renavam: `REN${String(n).padStart(8, '0')}`,
      model: `Model ${n}`,
      brand: n % 2 === 0 ? 'BrandA' : 'BrandB',
      year: 2015 + (n % 10),
      fuel: fuelCycle[i % fuelCycle.length],
    }
  })
  await insertInBatches(vehicleData, SEED_CONFIG.batchSize, (batch) => prisma.vehicle.createMany({ data: batch }), 'Vehicles')

  const vehicleCount = await prisma.vehicle.count()
  console.log(`Created ${vehicleCount} vehicles`)
  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await app.close()
    await prisma.$disconnect()
    await pool.end()
  })
