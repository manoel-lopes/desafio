export const FUEL_TYPES = [
  'GASOLINE',
  'ETHANOL',
  'DIESEL',
  'FLEX',
  'ELECTRIC',
  'HYBRID',
] as const;

export type FuelType = (typeof FUEL_TYPES)[number];

export const FUEL_LABELS: Record<FuelType, string> = {
  GASOLINE: 'Gasolina',
  ETHANOL: 'Etanol',
  DIESEL: 'Diesel',
  FLEX: 'Flex',
  ELECTRIC: 'Elétrico',
  HYBRID: 'Híbrido',
};

export interface Vehicle {
  id: string;
  plate: string;
  chassi: string;
  renavam: string;
  modelo: string;
  marca: string;
  ano: number;
  fuel: FuelType;
  createdAt: string;
  updatedAt: string | null;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  order?: 'asc' | 'desc';
}

export interface ListResult {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  order: 'asc' | 'desc';
  items: Vehicle[];
}

export interface CreateVehicleInput {
  plate: string;
  chassi: string;
  renavam: string;
  modelo: string;
  marca: string;
  ano: number;
  fuel: FuelType;
}

export type UpdateVehicleInput = Partial<CreateVehicleInput>;
