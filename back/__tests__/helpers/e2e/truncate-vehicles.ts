import type { INestApplication } from '@nestjs/common'
import { PrismaService } from '@/infra/persistence/prisma.service'

export async function truncateVehicles (app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService)
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "vehicles" RESTART IDENTITY CASCADE')
}
