import type {
  CreateVehicleInput,
  FuelType,
  ListResult,
  UpdateVehicleInput,
  Vehicle,
} from './vehicle.model';

export interface ApiVehicle {
  id: string;
  plate: string;
  chassis: string;
  renavam: string;
  model: string;
  brand: string;
  year: number;
  fuel: FuelType;
  createdAt: string;
  updatedAt: string | null;
}

export interface ApiPaginatedVehicles {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  order: 'asc' | 'desc';
  items: ApiVehicle[];
}

export interface ApiCreateVehicleBody {
  plate: string;
  chassis: string;
  renavam: string;
  model: string;
  brand: string;
  year: number;
  fuel: FuelType;
}

export type ApiUpdateVehicleBody = Partial<ApiCreateVehicleBody>;

export function fromApiVehicle(api: ApiVehicle): Vehicle {
  return {
    id: api.id,
    plate: api.plate,
    chassi: api.chassis,
    renavam: api.renavam,
    modelo: api.model,
    marca: api.brand,
    ano: api.year,
    fuel: api.fuel,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

export function fromApiList(api: ApiPaginatedVehicles): ListResult {
  return {
    page: api.page,
    pageSize: api.pageSize,
    totalItems: api.totalItems,
    totalPages: api.totalPages,
    order: api.order,
    items: api.items.map(fromApiVehicle),
  };
}

export function toApiCreateBody(input: CreateVehicleInput): ApiCreateVehicleBody {
  return {
    plate: input.plate,
    chassis: input.chassi,
    renavam: input.renavam,
    model: input.modelo,
    brand: input.marca,
    year: input.ano,
    fuel: input.fuel,
  };
}

export function toApiUpdateBody(input: UpdateVehicleInput): ApiUpdateVehicleBody {
  const body: ApiUpdateVehicleBody = {};
  if (input.plate !== undefined) body.plate = input.plate;
  if (input.chassi !== undefined) body.chassis = input.chassi;
  if (input.renavam !== undefined) body.renavam = input.renavam;
  if (input.modelo !== undefined) body.model = input.modelo;
  if (input.marca !== undefined) body.brand = input.marca;
  if (input.ano !== undefined) body.year = input.ano;
  if (input.fuel !== undefined) body.fuel = input.fuel;
  return body;
}
