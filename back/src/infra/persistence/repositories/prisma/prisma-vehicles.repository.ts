import { Injectable } from '@nestjs/common'
import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  CreateVehicleData,
  UpdateVehicleData,
  VehiclesRepository,
} from '@/domain/application/repositories/vehicles.repository'
import { formatPagination } from '@/infra/persistence/helpers/format-pagination.helper'
import { PrismaVehicleMapper } from '@/infra/persistence/mappers/prisma/prisma-vehicle.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { Vehicle } from '@/domain/enterprise/entities/vehicle.entity'

@Injectable()
export class PrismaVehiclesRepository implements VehiclesRepository {
  constructor (private readonly prisma: PrismaService) {}

  async create (data: CreateVehicleData): Promise<Vehicle> {
    const raw = await this.prisma.vehicle.create({ data })
    return PrismaVehicleMapper.toDomain(raw)
  }

  async findById (id: string): Promise<Vehicle | null> {
    const raw = await this.prisma.vehicle.findUnique({ where: { id } })
    return raw ? PrismaVehicleMapper.toDomain(raw) : null
  }

  async findByPlate (plate: string): Promise<Vehicle | null> {
    const raw = await this.prisma.vehicle.findUnique({ where: { plate } })
    return raw ? PrismaVehicleMapper.toDomain(raw) : null
  }

  async findByChassis (chassis: string): Promise<Vehicle | null> {
    const raw = await this.prisma.vehicle.findUnique({ where: { chassis } })
    return raw ? PrismaVehicleMapper.toDomain(raw) : null
  }

  async findByRenavam (renavam: string): Promise<Vehicle | null> {
    const raw = await this.prisma.vehicle.findUnique({ where: { renavam } })
    return raw ? PrismaVehicleMapper.toDomain(raw) : null
  }

  async findMany (params: PaginationParams): Promise<PaginatedItems<Vehicle>> {
    const { skip, take, page, pageSize } = formatPagination(
      params.page ?? 1,
      params.pageSize ?? 20
    )
    const order = params.order ?? 'desc'
    const [raws, totalItems] = await Promise.all([
      this.prisma.vehicle.findMany({
        skip,
        take,
        orderBy: { createdAt: order },
      }),
      this.prisma.vehicle.count(),
    ])
    const totalPages = Math.ceil(totalItems / pageSize) || 0
    return {
      page,
      pageSize,
      totalItems,
      totalPages,
      items: raws.map(PrismaVehicleMapper.toDomain),
      order,
    }
  }

  async update (input: { where: { id: string }; data: UpdateVehicleData }): Promise<Vehicle> {
    const raw = await this.prisma.vehicle.update({
      where: { id: input.where.id },
      data: input.data,
    })
    return PrismaVehicleMapper.toDomain(raw)
  }

  async delete (id: string): Promise<void> {
    await this.prisma.vehicle.delete({ where: { id } })
  }
}
